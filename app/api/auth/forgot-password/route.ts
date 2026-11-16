import {after, NextResponse} from 'next/server';
import {randomBytes} from 'crypto';
import {z} from 'zod';
import {db} from '@/lib/db';
import {mutation,fail,hash,HttpError} from '@/lib/auth';
import {emailConfigured,sendSystemMail} from '@/lib/mail';
import {resetKey,resetLimit,resetOrigin} from '@/lib/password-reset';
export async function POST(request:Request){
 try{
  mutation(request);
  const body=z.object({email:z.string().trim().email().max(254)}).safeParse(await request.json());
  if(!body.success)throw new HttpError(400,'Enter a valid email address');
  if(!emailConfigured())throw new HttpError(503,'Password recovery is temporarily unavailable. Contact the administrator.');
  const origin=resetOrigin(),email=body.data.email.toLowerCase();
  await resetLimit('reset:global',60000,30);await resetLimit(resetKey(email),3600000,3);
  // Same immediate response for known and unknown addresses; delivery occurs after response.
  after(async()=>{
   let tokenHash:string|undefined;
   try{
    const actor=await db.user.findUnique({where:{email}});if(!actor?.isActive)return;
    const token=randomBytes(32).toString('hex');tokenHash=hash(token);
    await db.passwordReset.create({data:{tokenHash,userId:actor.id,credentialVersion:hash(actor.passwordHash),expiresAt:new Date(Date.now()+1800000)}});
    const url=origin+'/reset-password#token='+token;
    await sendSystemMail(email,'YY ASM — password reset',`A password reset was requested for your YY ASM account.\n\nChoose a new password using this personal link, valid for 30 minutes and one use:\n${url}\n\nIf you did not request this, ignore this email. Your password has not changed.\n\nYYachts After Sales Management`);
   }catch{
    if(tokenHash)await db.passwordReset.updateMany({where:{tokenHash},data:{usedAt:new Date()}}).catch(()=>{});
    console.error('Password reset email delivery failed');
   }
  });
  return NextResponse.json({message:'If an active account exists for this email, you will receive a password reset link.'});
 }catch(e){return fail(e)}
}
