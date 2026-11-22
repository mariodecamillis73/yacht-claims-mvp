import bcrypt from 'bcryptjs';

// Owner-operated maintenance only. No HTTP endpoint; secrets arrive from runtime configuration.
// The durable marker makes a requested credential update run exactly once across restarts.
export async function rotateDirector(db, env = process.env) {
  const rotation = env.ADMIN_ROTATION_ID;
  if (!rotation) return false;
  if (!/^[a-zA-Z0-9_-]{1,80}$/.test(rotation)) throw new Error('Invalid credential maintenance identifier');
  const id = 'admin-credentials-' + rotation;
  if (await db.activityLog.findUnique({ where: { id } })) return false;
  const previousEmail = env.ADMIN_ROTATE_FROM_EMAIL?.trim().toLowerCase();
  const email = env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = env.ADMIN_PASSWORD;
  if (!previousEmail || !email || !email.includes('@') || !password || password.length < 10 || password.length > 72) throw new Error('Credential maintenance configuration is incomplete');
  const passwordHash = await bcrypt.hash(password, 12);
  await db.$transaction(async tx => {
    const actor = await tx.user.findUnique({ where: { email: previousEmail } });
    if (!actor || actor.role !== 'director' || !actor.isActive) throw new Error('Active source director not found; credentials unchanged');
    const target = await tx.user.findUnique({ where: { email } });
    if (target && target.id !== actor.id) throw new Error('Target email is already registered; credentials unchanged');
    await tx.user.update({ where: { id: actor.id }, data: { email, passwordHash } });
    await tx.loginAttempt.deleteMany({ where: { email: { in: [previousEmail, email] } } });
    await tx.activityLog.create({ data: { id, entityType: 'user', entityId: actor.id, actorId: actor.id, action: 'credentials_updated', details: 'Owner-requested director credential maintenance completed' } });
  });
  return true;
}
