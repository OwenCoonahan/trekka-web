// Test Supabase connection
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://wieqlpveckjrpfecxwfv.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndpZXFscHZlY2tqcnBmZWN4d2Z2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDAwNzgsImV4cCI6MjA3MzYxNjA3OH0.1dXmi2R9_fKFb1GVqw7le6s9PbACF8rgo2IELNQpCKU'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('Testing Supabase connection...')

  // Test 1: Check profiles table
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('count')

  if (profileError) {
    console.error('Error accessing profiles:', profileError)
  } else {
    console.log('✓ Connected to profiles table')
  }

  // Test 2: Check if we can query auth
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError) {
    console.log('No user logged in (expected)')
  } else {
    console.log('Current user:', user)
  }
}

testConnection()