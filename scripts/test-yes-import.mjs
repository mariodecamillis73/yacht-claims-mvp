import assert from 'node:assert/strict';
import {mkdtemp,rm,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';
import {execFileSync} from 'node:child_process';import {PrismaClient} from '@prisma/client';
import {normalizeYes,applyYes,previewYes} from '../lib/yes-import.mjs';
const dir=await mkdtemp(join(tmpdir(),'yes-import-')),url='file:'+join(dir,'test.db');
const db=new PrismaClient({datasources:{db:{url}}});let snapshot;
const fields=o=>Object.entries(o).map(([label,value])=>({label,value}));
const source={yachts:[{key:'123',row:['Y8 #28 Test\nCE8028','28 Test'],fields:fields({'CE Code *':'CE8028','Year of manufacture *':'2024','Date of Delivery':'2024-02-29',Engine:'Yanmar 4LV','Engine No.':'1234','Version':'FISCHER PANDA 25i Serial no.: 987','Hull color':'Alexseal Topcoat 501 RAL 9010'})}],index:[{cells:['930','','','','2026-01-02','Y8','28 Test','A claim','0','100','Confirmed','2026-01-03'],url:'https://www.yes.navy/client/#/boat/123/warranty-requests-edit-form/2/edit-warranty-request-form/3/AFTERSALES'}],details:[]};
source.details=[{yesId:'930',url:source.index[0].url,forms:[{fields:fields({'Request ID *':'930','Desc *':'A claim','Creation Date *':'2026-01-02',Notice:'private note'}),comments:[{date:'Jan 3, 2026',header:'Jan 3, 2026 Mario',message:'Original comment',raw:'Jan 3, 2026 Mario\nOriginal comment'}]}]}];
try{
 await writeFile(join(dir,'test.db'),'');execFileSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{env:{...process.env,DATABASE_URL:url},stdio:'pipe'});
 await db.yacht.create({data:{hullNumber:'Y8028',name:'Wrong yacht',yearBuilt:2000,ownerId:'',captainName:''}});
 await db.yachtMember.create({data:{userId:'old-representative',hullNumber:'Y8028'}});
 await db.claim.create({data:{id:'legacy',yesId:'930',yachtHullNumber:'Y8028',title:'Test record',description:'Keep me'}});
 await db.claimGrant.create({data:{claimId:'legacy',email:'a@example.invalid',role:'supplier',tokenHash:'hash',createdBy:'test',expiresAt:new Date('2099-01-01')}});
 await db.comment.create({data:{claimId:'legacy',userId:'test',message:'Keep legacy comment'}});
 const p=normalizeYes(source);assert.equal((await previewYes(db,p)).collisions.length,1);
 const result=await applyYes(db,p,'admin',{databaseUrl:url});assert.equal(result.claims,1);assert.equal(result.comments,1);
 assert.equal((await db.claim.findUnique({where:{id:'legacy'}})).yesId,null);
 assert.ok((await db.claimGrant.findFirst()).revokedAt);assert.equal(await db.yachtMember.count(),0);
 assert.equal(await db.comment.count(),2);assert.equal((await db.yacht.findFirst()).warrantyYears,null);
 const c=await db.claim.findUnique({where:{id:'yes-claim-930'}});assert.equal(c.status,'in_progress');assert.equal(c.validationStatus,'pending');assert.ok(!c.description.includes('private note'));
 snapshot=new PrismaClient({datasources:{db:{url:'file:'+result.backupPath}}});assert.equal((await snapshot.claim.findUnique({where:{id:'legacy'}})).yesId,'930');assert.equal(await snapshot.claim.count(),1);
 assert.ok((await applyYes(db,p,'admin',{databaseUrl:url})).alreadyImported);assert.equal(await db.claim.count(),2);
 const changed=structuredClone(source);changed.details[0].forms[0].fields.find(f=>f.label==='Desc *').value='Changed';await assert.rejects(applyYes(db,normalizeYes(changed),'admin',{databaseUrl:url}),/reconciliation/);
 const bad=structuredClone(source);bad.details[0].yesId='999';assert.throws(()=>normalizeYes(bad),/mismatch/);
 const unknown=structuredClone(source);unknown.index[0].cells[10]='Unexpected';assert.throws(()=>normalizeYes(unknown),/Unknown source status/);
 // Force a mid-import failure and ensure all edits and grant changes are rolled back.
 const second=structuredClone(source);second.index[0].cells[0]='931';second.details[0].yesId='931';second.details[0].forms[0].fields[0].value='931';
 const broken=normalizeYes(second);broken.claims[0].yachtHullNumber='MISSING';await assert.rejects(applyYes(db,broken,'admin',{databaseUrl:url}));assert.equal(await db.claim.count(),2);
 if(process.env.YES_SOURCE_FILE){
  const full=normalizeYes(JSON.parse(await readFile(process.env.YES_SOURCE_FILE,'utf8')));
  // Fresh temporary DB, never live data.
  const fullUrl='file:'+join(dir,'full.db');await writeFile(join(dir,'full.db'),'');execFileSync(process.execPath,['node_modules/prisma/build/index.js','migrate','deploy'],{env:{...process.env,DATABASE_URL:fullUrl},stdio:'pipe'});
  const fullDb=new PrismaClient({datasources:{db:{url:fullUrl}}});
  try{const r=await applyYes(fullDb,full,'test',{databaseUrl:fullUrl});assert.equal(await fullDb.yacht.count(),39);assert.equal(await fullDb.claim.count(),878);assert.equal(await fullDb.comment.count(),2027);console.log('Full snapshot rehearsal passed:',r.yachts,r.claims,r.comments)}finally{await fullDb.$disconnect()}
 }
 console.log('PASS: source identity, preserved IDs, backup, collision isolation, internal comments, idempotency, changed-source refusal, transaction rollback.');
}finally{await snapshot?.$disconnect();await db.$disconnect();await rm(dir,{recursive:true,force:true})}
