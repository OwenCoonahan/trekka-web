import { createClient } from '@/lib/supabase/server'

export default async function TestDbPage() {
  let dbStatus = 'Unknown'
  let error = null

  try {
    const supabase = await createClient()

    // Try a simple query to test connection
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)
      .single()

    if (dbError) {
      dbStatus = '❌ Database Error'
      error = dbError.message
    } else {
      dbStatus = '✅ Database Connected'
    }
  } catch (e: any) {
    dbStatus = '❌ Connection Error'
    error = e.message
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Database Test</h1>
      <div className="space-y-2">
        <p>Database Status: {dbStatus}</p>
        {error && (
          <div className="bg-red-100 p-4 rounded">
            <p className="text-red-800">Error: {error}</p>
          </div>
        )}
      </div>
    </div>
  )
}