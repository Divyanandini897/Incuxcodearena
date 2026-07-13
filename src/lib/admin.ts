export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const admins = (process.env.ADMIN_EMAILS || 'deepika.tiwari.1408@gmail.com').split(',').map((e) => e.trim().toLowerCase())
  return admins.includes(email.toLowerCase())
}
