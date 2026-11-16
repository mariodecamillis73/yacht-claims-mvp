import {db} from './db';
import {hash, HttpError} from './auth';
// Global and per-address limits also apply to unknown accounts.
export async function resetLimit(key:string,windowMs:number,limit:number){
 const now=new Date();
 await db.loginAttempt.upsert({where:{email:key},create:{email:key,failures:0},update:{}});
 await db.loginAttempt.updateMany({where:{email:key,windowStart:{lte:new Date(+now-windowMs)}},data:{failures:0,windowStart:now}});
 const r=await db.loginAttempt.updateMany({where:{email:key,failures:{lt:limit}},data:{failures:{increment:1}}});
 if(!r.count)throw new HttpError(429,'Too many reset attempts. Please try again later.');
}
export const resetKey=(email:string)=>'reset:'+hash(email);
export function resetOrigin(){
 const url=new URL(process.env.APP_URL||'');
 if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))throw new HttpError(503,'Password recovery is temporarily unavailable. Contact the administrator.');
 return url.origin;
}
