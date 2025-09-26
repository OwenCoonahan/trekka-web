'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.FROM_EMAIL || 'Trekka <notifications@trekka.com>'

interface EmailNotificationData {
  type: 'trip_added' | 'trip_updated' | 'city_overlap' | 'follow'
  recipientEmail: string
  recipientName: string
  data: any
}

export async function sendEmailNotification({ type, recipientEmail, recipientName, data }: EmailNotificationData) {
  if (!process.env.RESEND_API_KEY) {
    console.warn('RESEND_API_KEY not configured, skipping email notification')
    return
  }

  try {
    const { subject, html } = getEmailTemplate(type, data)

    await resend.emails.send({
      from: FROM_EMAIL,
      to: recipientEmail,
      subject,
      html
    })

    console.log(`Email sent successfully to ${recipientEmail} for ${type}`)
  } catch (error) {
    console.error('Failed to send email notification:', error)
    // Don't throw - we don't want email failures to break the app
  }
}

function getEmailTemplate(type: string, data: any): { subject: string; html: string } {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  switch (type) {
    case 'trip_added':
      return {
        subject: `✈️ ${data.creator.display_name} is planning a trip to ${data.destination}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; margin: 0;">🌍 New Trip Alert!</h1>
            </div>

            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="margin: 0 0 15px 0; color: #1e293b;">
                ${data.creator.display_name} just added a trip to <strong>${data.destination}</strong>
              </h2>

              <div style="margin: 10px 0;">
                <strong>📅 Dates:</strong> ${formatDateRange(data.start_date, data.end_date)}
              </div>

              ${data.description ? `
                <div style="margin: 15px 0;">
                  <strong>📝 Details:</strong><br/>
                  ${data.description}
                </div>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/trips/${data.id}"
                 style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                View Trip Details
              </a>
            </div>

            <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p>This email was sent because you follow ${data.creator.display_name} on Trekka.</p>
              <p><a href="${baseUrl}/notifications/preferences" style="color: #2563eb;">Manage your notification preferences</a></p>
            </div>
          </div>
        `
      }

    case 'trip_updated':
      return {
        subject: `📝 ${data.creator.display_name} updated their trip to ${data.destination}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #ea580c; margin: 0;">📝 Trip Updated!</h1>
            </div>

            <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #fed7aa;">
              <h2 style="margin: 0 0 15px 0; color: #9a3412;">
                ${data.creator.display_name} updated their trip to <strong>${data.destination}</strong>
              </h2>

              <div style="margin: 10px 0;">
                <strong>📅 Dates:</strong> ${formatDateRange(data.start_date, data.end_date)}
              </div>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/trips/${data.id}"
                 style="background: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                See What Changed
              </a>
            </div>

            <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p><a href="${baseUrl}/notifications/preferences" style="color: #ea580c;">Manage your notification preferences</a></p>
            </div>
          </div>
        `
      }

    case 'follow':
      return {
        subject: `👥 ${data.follower.display_name} started following you on Trekka`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #7c3aed; margin: 0;">👥 New Follower!</h1>
            </div>

            <div style="background: #faf5ff; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e9d5ff;">
              <h2 style="margin: 0 0 15px 0; color: #6b21a8;">
                <strong>${data.follower.display_name}</strong> started following you
              </h2>

              ${data.follower.bio ? `
                <p style="color: #7c2d12; margin: 10px 0;">
                  ${data.follower.bio}
                </p>
              ` : ''}
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/u/${data.follower.username}"
                 style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                View Their Profile
              </a>
            </div>

            <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p><a href="${baseUrl}/notifications/preferences" style="color: #7c3aed;">Manage your notification preferences</a></p>
            </div>
          </div>
        `
      }

    case 'city_overlap':
      return {
        subject: `🏙️ ${data.creator.display_name} is visiting your area!`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #059669; margin: 0;">🏙️ Local Connection!</h1>
            </div>

            <div style="background: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #a7f3d0;">
              <h2 style="margin: 0 0 15px 0; color: #065f46;">
                ${data.creator.display_name} is planning a trip to <strong>${data.destination}</strong>
              </h2>

              <div style="margin: 10px 0;">
                <strong>📅 Dates:</strong> ${formatDateRange(data.start_date, data.end_date)}
              </div>

              <p style="color: #047857; margin: 15px 0;">
                This overlaps with your area - maybe you can meet up or show them around!
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${baseUrl}/trips/${data.id}"
                 style="background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                Say Hello!
              </a>
            </div>

            <div style="text-align: center; color: #64748b; font-size: 14px; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p><a href="${baseUrl}/notifications/preferences" style="color: #059669;">Manage your notification preferences</a></p>
            </div>
          </div>
        `
      }

    default:
      return {
        subject: 'New Trekka Notification',
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <p>You have a new notification on Trekka.</p>
            <p><a href="${baseUrl}" style="color: #2563eb;">View on Trekka</a></p>
          </div>
        `
      }
  }
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const options: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString('en-US', options)
  }

  return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)}`
}

// Helper function to send emails for new notifications
export async function sendNotificationEmails(notificationType: string, notificationData: any, recipientUserIds: string[]) {
  const supabase = await createClient()

  // Get user emails and preferences
  const { data: recipients, error } = await supabase
    .from('profiles')
    .select('id, username, display_name, email, notification_preferences(*)')
    .in('id', recipientUserIds)

  if (error || !recipients) {
    console.error('Failed to fetch recipients for email notifications:', error)
    return
  }

  // Send emails to users who have email notifications enabled
  for (const recipient of recipients) {
    const preferences = recipient.notification_preferences?.[0]

    if (preferences?.email_notifications && recipient.email) {
      await sendEmailNotification({
        type: notificationType as any,
        recipientEmail: recipient.email,
        recipientName: recipient.display_name || recipient.username,
        data: notificationData
      })
    }
  }
}