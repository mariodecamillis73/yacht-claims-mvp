import {after,NextResponse} from 'next/server';
import bcrypt from 'bcryptjs';import {z} from 'zod';
import {db} from '@/lib/db';import {mutation,fail,hash,HttpError,COOKIE} from '@/lib/auth';
import {isValidPassword,PASSWORD_HELP} from '@/lib/password-policy';
import {sendSystemMail} from '@/lib/mail';
import {resetLimit} from '@/lib/password-reset';
export async function POST(request:Request){
 try{
  mutation(request);await resetLimit('reset:complete',60000,60);
  const parsed=z.object({token:z.string().regex(/^[a-f0-9]{64}$/),password:z.string().refine(isValidPassword,PASSWORD_HELP),confirmPassword:z.string()}).safeParse(await request.json());
  if(!parsed.success)throw new HttpError(400,PASSWORD_HELP);
  if(parsed.data.password!==parsed.data.confirmPassword)throw new HttpError(400,'Passwords do not match');
  const tokenHash=hash(parsed.data.token),now=new Date();
  const reset=await db.passwordReset.findUnique({where:{tokenHash}});
  const actor=reset?await db.user.findUnique({where:{id:reset.userId}}):null;
  if(!reset||reset.usedAt||reset.expiresAt<=now||!actor?.isActive||hash(actor.passwordHash)!==reset.credentialVersion)throw new HttpError(400,'Reset link is invalid or expired. Request a new link.');
  const passwordHash=await bcrypt.hash(parsed.data.password,12);
  await db.$transaction(async tx=>{
   const used=await tx.passwordReset.updateMany({where:{tokenHash,usedAt:null,expiresAt:{gt:new Date()}},data:{usedAt:new Date()}});
   if(!used.count)throw new HttpError(400,'Reset link is invalid or expired. Request a new link.');
   const changed=await tx.user.updateMany({where:{id:actor.id,passwordHash:actor.passwordHash,isActive:true},data:{passwordHash}});
   if(!changed.count)throw new HttpError(400,'Reset link is invalid or expired. Request a new link.');
   await tx.passwordReset.updateMany({where:{userId:actor.id,usedAt:null},data:{usedAt:new Date()}});
   await tx.loginAttempt.deleteMany({where:{email:actor.email}});
   await tx.activityLog.create({data:{entityType:'user',entityId:actor.id,actorId:actor.id,action:'password_reset',details:'Password reset completed; previous sessions invalidated'}});
  });
  after(async()=>{try{await sendSystemMail(actor.email,'YY ASM — password changed','Your YY ASM password has been changed. Previous signed-in sessions are no longer valid. If this was not you, contact your administrator immediately.\n\nYYachts After Sales Management')}catch{console.error('Password-change notification delivery failed')}});
  const response=NextResponse.json({message:'Password updated. Sign in with your new password.'});response.cookies.set(COOKIE,'',{maxAge:0,path:'/'});return response;
 }catch(e){return fail(e)}
}
