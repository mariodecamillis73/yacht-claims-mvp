import { createHash, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { backupDatabase } from '../scripts/backup.mjs';
import { dirname, resolve } from 'node:path';
const text=z.string().max(100000);
const fields=z.array(z.object({label:text,value:text})).max(100);
const source=z.object({
 yachts:z.array(z.object({key:z.string().regex(/^-?\d+$/),row:z.array(text).min(2),fields})).min(1).max(1000),
 index:z.array(z.object({cells:z.array(text).length(12),url:z.string().url()})).min(1).max(10000),
 details:z.array(z.object({yesId:z.string().regex(/^\d+$/),url:z.string().url(),forms:z.array(z.object({fields,comments:z.array(z.object({date:text,header:text,message:text,raw:text})).max(10000)})).length(1)})).max(10000)
}).strict();
const sha=value=>createHash('sha256').update(value).digest('hex');
const fieldMap=fields=>Object.fromEntries(fields.map(f=>[f.label,f.value.trim()]));
function requireValue(condition,message){if(!condition)throw new Error(message)}
function day(value,required=false){
 if(!value){requireValue(!required,'Missing creation date');return null}
 requireValue(/^\d{4}-\d{2}-\d{2}$/.test(value),'Invalid source date: '+value);
 const d=new Date(value+'T00:00:00.000Z');
 requireValue(Number.isFinite(+d)&&d.toISOString().slice(0,10)===value,'Invalid source date');return d;
}
function equipment(value,serial=''){
 const brand=value.match(/FISCHER\s+PANDA|YANMAR|NANNI|VOLVO\s*PENTA|CUMMINS/i)?.[0]||'';
 return {brand,model:value.replace(brand,'').replace(/^\s*[,\s]+/,'').trim(),power:'',serialNumber:serial};
}
function yachtData(y){
 const f=fieldMap(y.fields), heading=y.row[0].split('\n')[0];
 requireValue(y.row[0].split('\n').at(-1).trim()===f['CE Code *'],'Yacht CE mismatch '+y.key);
 const slot=heading.match(/^Y([6789]) #(\d+)\b/);
 // Stable hull identities use model and slot, never a potentially inconsistent engine/boat serial.
 const hullNumber=slot?'Y'+slot[1]+slot[2].padStart(3,'0'):
 heading.startsWith('YC #09')&&f['CE Code *']==='9009RI99955'?'Y9009':
 f['CE Code *'].replace(/[–—]/g,'-').toUpperCase();
 requireValue(/^[A-Z0-9][A-Z0-9._-]{0,49}$/.test(hullNumber),'Invalid hull identity');
 const name=slot?heading.replace(/^Y[6789] #\d+\s*/,'').trim()||hullNumber:heading.replace(/^YC #\d+\s*/,'');
 const yearBuilt=Number(f['Year of manufacture *']);requireValue(Number.isInteger(yearBuilt)&&yearBuilt>=1900&&yearBuilt<=2200,'Invalid year');
 const engine=f.Engine||'', version=f.Version||'', hull=f['Hull color']||'';
 const engineOnly=engine.split(/\s*\/\s*(?=FISCHER\s+PANDA)/i)[0];
 const genset=/FISCHER\s+PANDA/i.test(version)?version:engine.match(/FISCHER\s+PANDA.*$/i)?.[0]||'';
 const e=equipment(engineOnly,f['Engine No.']||'');
 if(/^(QSB|T4\.)/.test(version))e.model=[e.model,version].filter(Boolean).join(' ');
 const g=equipment(genset);g.serialNumber=[...genset.matchAll(/Serial\s*no\.?\s*:\s*(\w+)/ig)].map(m=>m[1]).join(' / ');
 const technicalProfile={equipment:{engine:e,genset:g},painting:{hullPainting:{brand:/alexseal|\bAS\b/i.test(hull)?'Alexseal':'',paintType:hull.match(/Topcoat\s*501|Metallic/ig)?.join(' / ')||'',colorCode:hull}},customFields:[]};
 for(const [label,value] of Object.entries(f))if(value){
  const section=label==='Hull color'?'hullPainting':label==='Version'&&genset?'genset':'engine';
  technicalProfile.customFields.push({id:'yes-'+sha(label).slice(0,16),section,name:'YES · '+label,value,unit:''});
 }
 requireValue(JSON.stringify(technicalProfile).length<100000,'Yacht profile too large');
 return {sourceKey:y.key,hullNumber,name,yearBuilt,deliveryDate:day(f['Date of Delivery']),equipmentJson:JSON.stringify(technicalProfile)};
}
export function normalizeYes(input){
 const raw=source.parse(input), digest=sha(JSON.stringify(raw));
 requireValue(new Set(raw.yachts.map(y=>y.key)).size===raw.yachts.length,'Duplicate source yacht');
 const yachts=raw.yachts.map(yachtData), byKey=new Map(yachts.map(y=>[y.sourceKey,y]));
 requireValue(new Set(yachts.map(y=>y.hullNumber)).size===yachts.length,'Duplicate hull identity');
 const details=new Map(raw.details.map(d=>[d.yesId,d]));
 requireValue(details.size===raw.details.length&&raw.index.length===details.size,'Claim details count mismatch');
 const seen=new Set();
 const claims=raw.index.map(row=>{
  const yesId=row.cells[0]; requireValue(/^\d+$/.test(yesId)&&!seen.has(yesId),'Duplicate/invalid YES ID');seen.add(yesId);
  const d=details.get(yesId);requireValue(d&&d.url===row.url,'Claim detail mismatch #'+yesId);
  const url=new URL(row.url);requireValue(url.hostname==='www.yes.navy'&&url.protocol==='https:','Invalid YES URL');
  const yacht=byKey.get(url.hash.match(/\/boat\/(-?\d+)\//)?.[1]); requireValue(yacht,'Unknown yacht #'+yesId);
  const f=fieldMap(d.forms[0].fields);requireValue(f['Request ID *']===yesId,'Claim identity mismatch');
  const status=row.cells[10];requireValue(['Confirmed','In progress','Created','Closed','Waiting for approval','Proceed'].includes(status),'Unknown source status');
  const closed=status==='Closed'||/^100(?:[.,]0+)?\s*%?$/.test(row.cells[9].trim());
  const original=f['Desc *']||row.cells[7];requireValue(original,'Missing claim description');
  const description=original+'\n\n— YES System —\nYES status: '+status+'\nYES state: '+row.cells[9];
  const comments=d.forms[0].comments.map((c,i)=>{
   const parsed=new Date(c.date+' 00:00:00 UTC');requireValue(Number.isFinite(+parsed),'Invalid comment date #'+yesId);
   return {id:'yes-comment-'+sha(yesId+'\n'+i+'\n'+c.raw),userId:'YES · '+(c.header.replace(c.date,'').trim()||'YES System'),message:c.raw,createdAt:parsed,visibility:'internal'};
  });
  return {id:'yes-claim-'+yesId,yesId,yachtHullNumber:yacht.hullNumber,title:original.split('\n')[0].slice(0,200),description,
   // Confirmed does not establish either closure or YY ASM director approval.
   status:closed?'closed':status==='Created'?'new':'in_progress',
   createdAt:day(f['Creation Date *']||row.cells[4],true),closedAt:closed?day(f['Finished Date']):null,
   comments,source:JSON.stringify({index:row,detail:d})};
 });
 return {digest,yachts,claims,raw};
}
export async function previewYes(db,p){
 const collisions=await db.claim.findMany({where:{yesId:{in:p.claims.map(c=>c.yesId)},NOT:{id:{in:p.claims.map(c=>c.id)}}},select:{id:true,yesId:true,title:true}});
 const existing=await db.yacht.findMany({where:{hullNumber:{in:p.yachts.map(y=>y.hullNumber)}},select:{hullNumber:true,name:true}});
 return {digest:p.digest,yachts:p.yachts.length,claims:p.claims.length,comments:p.claims.reduce((n,c)=>n+c.comments.length,0),collisions,
  yachtCorrections:existing.filter(y=>p.yachts.find(n=>n.hullNumber===y.hullNumber)?.name!==y.name),
  completed:!!await db.activityLog.findUnique({where:{id:'yes-import-'+p.digest}})};
}
export async function applyYes(db,p,actorId,{databaseUrl,backupPath}={}){
 const runId='yes-import-'+p.digest;
 const previous=await db.activityLog.findUnique({where:{id:runId}});
 if(previous)return {...JSON.parse(previous.details),alreadyImported:true};
 requireValue(databaseUrl?.startsWith('file:'),'SQLite database required');
 const target=backupPath||resolve(dirname(databaseUrl.slice(5)),'backups','before-yes-'+randomUUID()+'.db');
 console.info("YES import: creating verified backup");
 await backupDatabase(databaseUrl,target);
 console.info("YES import: backup verified; starting atomic import");
 return db.$transaction(async tx=>{
  const duplicate=await tx.activityLog.findUnique({where:{id:runId}});if(duplicate)return {...JSON.parse(duplicate.details),alreadyImported:true};
  // A changed source needs an explicit reconciliation, not silent overwrites of work done since import.
  requireValue(!(await tx.claim.count({where:{id:{in:p.claims.map(c=>c.id)}}})),'YES claims already imported from a different snapshot; reconciliation required');
  const report=await previewYes(tx,p);const now=new Date();
  for(const collision of report.collisions){
   const old=await tx.claim.findUnique({where:{id:collision.id}});
   await tx.activityLog.create({data:{entityType:'claim',entityId:collision.id,claimId:collision.id,actorId,action:'YES import: preserved previous record',details:JSON.stringify(old)}});
   await tx.claim.update({where:{id:collision.id},data:{yesId:null,title:'[Pre-import #YES '+collision.yesId+'] '+collision.title}});
   await tx.claimGrant.updateMany({where:{claimId:collision.id,revokedAt:null},data:{revokedAt:now}});
   await tx.claimAccessToken.updateMany({where:{claimId:collision.id},data:{expiresAt:now}});
  }
  for(const yacht of p.yachts){
   const {sourceKey,...data}=yacht;
   const old=await tx.yacht.findUnique({where:{hullNumber:data.hullNumber}});
   if(old)await tx.activityLog.create({data:{entityType:'yacht',entityId:data.hullNumber,actorId,action:'YES import: previous yacht data',details:JSON.stringify(old)}});
   // Prevent stale representative memberships from granting access after an identity correction.
   if(old&&old.name.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase()!==data.name.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase())await tx.yachtMember.deleteMany({where:{hullNumber:data.hullNumber}});
   await tx.yacht.upsert({where:{hullNumber:data.hullNumber},create:{...data,ownerId:'',captainName:''},update:{...data,warrantyYears:null,warrantyExpiresAt:null}});
   await tx.activityLog.create({data:{entityType:'yacht',entityId:data.hullNumber,actorId,action:'Imported from YES',details:JSON.stringify(p.raw.yachts.find(y=>y.key===sourceKey))}});
  }
  // Bulk writes keep the SQLite transaction short enough for hosted request/health deadlines.
  await tx.claim.createMany({data:p.claims.map(({comments,source,...data})=>({...data,createdBy:actorId,validationStatus:'pending',priority:'medium'}))});
  const allComments=p.claims.flatMap(c=>c.comments.map(comment=>({...comment,claimId:c.id})));
  for(let i=0;i<allComments.length;i+=100)await tx.comment.createMany({data:allComments.slice(i,i+100)});
  for(let i=0;i<p.claims.length;i+=50)await tx.activityLog.createMany({data:p.claims.slice(i,i+50).map(c=>({entityType:'claim',entityId:c.id,claimId:c.id,actorId,action:'Imported from YES',details:c.source}))});
  requireValue(await tx.claim.count({where:{id:{in:p.claims.map(c=>c.id)}}})===p.claims.length,'Claim verification failed');
  requireValue(await tx.comment.count({where:{claimId:{in:p.claims.map(c=>c.id)}}})===report.comments,'Comment verification failed');
  const result={...report,completed:true,backupPath:target,importedAt:now.toISOString()};
  await tx.activityLog.create({data:{id:runId,entityType:'import',entityId:runId,actorId,action:'YES import completed',details:JSON.stringify(result)}});
  console.info("YES import: verified",result.yachts,result.claims,result.comments);
  return result;
 },{maxWait:10000,timeout:180000});
}
