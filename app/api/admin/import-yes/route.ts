import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fail, HttpError, mutation, user } from '@/lib/auth';
import { normalizeYes, previewYes, applyYes } from '@/lib/yes-import.mjs';
export const runtime='nodejs';
export const maxDuration=240;
let importing=false;
export async function POST(request:Request){
 try {
  mutation(request);const actor=await user(request);
  if(actor.role!=='director')throw new HttpError(403,'Administrator access required');
  if(importing)throw new HttpError(409,'An import is already running');
  if(Number(request.headers.get('content-length')||0)>15000000)throw new HttpError(413,'Import file too large');
  const bodyText=await request.text();if(bodyText.length>15000000)throw new HttpError(413,'Import file too large');
  let body, prepared;
  try{body=JSON.parse(bodyText);prepared=normalizeYes(body.source)}catch{throw new HttpError(400,'Invalid YES export. Check source identities, fields and dates.')}
  if(body.action==='preview')return NextResponse.json(await previewYes(db,prepared),{headers:{'Cache-Control':'no-store'}});
  if(body.action!=='apply'||body.digest!==prepared.digest)throw new HttpError(400,'Preview this export before importing');
  importing=true;
  try {
   const result=await applyYes(db,prepared,actor.id,{databaseUrl:process.env.DATABASE_URL});
   return NextResponse.json(result,{headers:{'Cache-Control':'no-store'}});
  }finally{importing=false}
 }catch(e){console.error('YES import failed',e instanceof HttpError?e.message:e instanceof Error?e.name:'unknown');return fail(e)}
}
