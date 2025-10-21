import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  })
}

interface ParsedTripData {
  destination: string
  start_date: string | null
  end_date: string | null
  description: string | null
  trip_type: string | null
  confirmation_number: string | null
  confidence_score: number
}

async function parseEmailWithAI(emailBody: string, emailSubject: string): Promise<ParsedTripData> {
  const prompt = `Extract travel details from this email. Return ONLY valid JSON, no markdown or explanations.

Email Subject: ${emailSubject}

Email Body:
${emailBody.substring(0, 3000)} // Limit to prevent token overflow

Extract and return JSON with this exact structure:
{
  "destination": "city, country (e.g., 'Tokyo, Japan')",
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "description": "brief description or null",
  "trip_type": "flight|hotel|rental|train|other or null",
  "confirmation_number": "confirmation code or null",
  "confidence_score": 0.0 to 1.0
}

Rules:
- If you can't find a field with high confidence, set it to null
- destination is REQUIRED - make best guess if unclear
- dates must be YYYY-MM-DD format
- confidence_score: how confident you are (0.0 = not confident, 1.0 = very confident)
- Return ONLY the JSON object, nothing else`

  try {
    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Cheaper and faster for this task
      messages: [
        {
          role: 'system',
          content: 'You are a travel email parser. Extract trip details and return ONLY valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.1, // Low temperature for consistent parsing
      response_format: { type: 'json_object' }, // Ensure JSON response
    })

    const parsed = JSON.parse(completion.choices[0].message.content || '{}')

    // Validate required fields
    if (!parsed.destination) {
      throw new Error('Failed to extract destination from email')
    }

    return {
      destination: parsed.destination,
      start_date: parsed.start_date || null,
      end_date: parsed.end_date || null,
      description: parsed.description || null,
      trip_type: parsed.trip_type || null,
      confirmation_number: parsed.confirmation_number || null,
      confidence_score: parsed.confidence_score || 0.5,
    }
  } catch (error) {
    console.error('OpenAI parsing error:', error)
    throw new Error('Failed to parse email with AI')
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify request is from SendGrid (optional but recommended)
    // const authHeader = request.headers.get('authorization')
    // if (authHeader !== `Bearer ${process.env.EMAIL_WEBHOOK_SECRET}`) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Parse email data from SendGrid Inbound Parse
    const formData = await request.formData()

    const to = formData.get('to') as string // e.g., "abc123@trips.trekka.com"
    const from = formData.get('from') as string
    const subject = formData.get('subject') as string
    const text = formData.get('text') as string
    const html = formData.get('html') as string

    console.log('Received email:', { to, from, subject })

    if (!to || !subject || (!text && !html)) {
      return NextResponse.json({ error: 'Invalid email data' }, { status: 400 })
    }

    // Extract email_import_id from recipient address
    // Format: {email_import_id}@trips.trekka.com
    const emailImportId = to.split('@')[0].toLowerCase()

    // Look up user by email_import_id
    const supabase = await createClient()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email_import_id')
      .eq('email_import_id', emailImportId)
      .single()

    if (profileError || !profile) {
      console.error('User not found for email_import_id:', emailImportId)
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Parse email with OpenAI
    const emailBody = text || html
    let parsedData: ParsedTripData

    try {
      parsedData = await parseEmailWithAI(emailBody, subject)
    } catch (error) {
      console.error('Failed to parse email:', error)
      return NextResponse.json({ error: 'Failed to parse email' }, { status: 500 })
    }

    // Create pending trip
    const { data: pendingTrip, error: insertError } = await supabase
      .from('pending_trips')
      .insert({
        user_id: profile.id,
        destination: parsedData.destination,
        start_date: parsedData.start_date,
        end_date: parsedData.end_date,
        description: parsedData.description,
        email_subject: subject,
        email_from: from,
        email_body: emailBody.substring(0, 1000), // Store truncated version
        confirmation_number: parsedData.confirmation_number,
        trip_type: parsedData.trip_type,
        parsed_data: parsedData as any,
        confidence_score: parsedData.confidence_score,
        status: 'pending',
      })
      .select()
      .single()

    if (insertError) {
      console.error('Failed to create pending trip:', insertError)
      return NextResponse.json({ error: 'Failed to create pending trip' }, { status: 500 })
    }

    console.log('Created pending trip:', pendingTrip.id)

    // Notification will be created automatically by database trigger

    return NextResponse.json({
      success: true,
      pending_trip_id: pendingTrip.id,
      parsed_data: parsedData,
    })
  } catch (error) {
    console.error('Error processing email:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
