import { signOut } from '@/lib/actions/auth'

export async function GET() {
  await signOut()
}