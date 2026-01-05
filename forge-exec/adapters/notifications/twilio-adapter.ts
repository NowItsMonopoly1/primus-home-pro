/**
 * TWILIO NOTIFICATIONS ADAPTER
 *
 * DO NOT ADD LOGIC HERE.
 * This is a side-effect sink only.
 *
 * Responsibilities:
 * - Execute notification operations exactly as instructed
 * - NO conditional logic
 * - NO transformations
 * - NO business decisions
 */

import type { KernelOutput } from '../../kernel-client/interface'

export interface TwilioConfig {
  readonly accountSid: string
  readonly authToken: string
  readonly fromPhone: string
}

/**
 * Send SMS notification.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function sendSMS(
  config: TwilioConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  const { to, body } = output.payload as { to: string; body: string }

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${config.accountSid}/Messages.json`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${config.accountSid}:${config.authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        From: config.fromPhone,
        To: to,
        Body: body
      })
    }
  )

  if (!response.ok) {
    throw new Error(`Twilio API error: ${response.status}`)
  }
}

/**
 * Send email notification.
 * DO NOT ADD LOGIC - just call the external API.
 */
export async function sendEmail(
  config: TwilioConfig,
  output: Readonly<KernelOutput>
): Promise<void> {
  // Twilio SendGrid integration
  const { to, subject, body } = output.payload as {
    to: string
    subject: string
    body: string
  }

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.authToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@nextlevelelectric.com' },
      subject,
      content: [{ type: 'text/plain', value: body }]
    })
  })

  if (!response.ok) {
    throw new Error(`SendGrid API error: ${response.status}`)
  }
}
