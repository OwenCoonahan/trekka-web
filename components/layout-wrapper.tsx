import { getUser, getProfile } from '@/lib/actions/auth'
import { Navigation } from '@/components/navigation'

export async function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const user = await getUser()
  const profile = await getProfile()

  return (
    <>
      <Navigation user={user} profile={profile as any} showBack={true} />
      <div className="pb-20 md:pb-0">
        {children}
      </div>
    </>
  )
}