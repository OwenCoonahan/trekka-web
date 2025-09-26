export default function DebugPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      <div className="space-y-2">
        <p>✅ Next.js is working</p>
        <p>✅ React is rendering</p>
        <p>✅ TypeScript is compiling</p>
        <p>Environment check:</p>
        <ul className="ml-4">
          <li>NEXT_PUBLIC_SUPABASE_URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</li>
          <li>NEXT_PUBLIC_SUPABASE_ANON_KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</li>
          <li>RESEND_API_KEY: {process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}</li>
        </ul>
      </div>
    </div>
  )
}