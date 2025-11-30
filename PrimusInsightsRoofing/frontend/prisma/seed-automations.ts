// PRIMUS HOME PRO - Seed Script: Default Automations
// Run: npx ts-node prisma/seed-automations.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding default automations...')

  // Get first user (or create a test user)
  const user = await prisma.user.findFirst()

  if (!user) {
    console.error('No user found. Please sign up first via Clerk.')
    process.exit(1)
  }

  console.log(`Using user: ${user.email}`)

  // Automation 1: Welcome message on new lead
  const automation1 = await prisma.automation.upsert({
    where: { id: 'automation_welcome' },
    update: {},
    create: {
      id: 'automation_welcome',
      userId: user.id,
      name: 'Welcome New Leads',
      trigger: 'lead.created',
      action: 'send_sms',
      template: `Hi {{name}}, thanks for your interest in Primus Home Pro! We specialize in roofing and solar. How can we help you today? - The Primus Team`,
      enabled: true,
      config: {
        channel: 'sms',
        delay: 0, // Immediate
        conditions: {
          minScore: 0, // Send to all
        },
      },
    },
  })

  console.log('✓ Created: Welcome New Leads')

  // Automation 2: Follow-up for stale leads
  const automation2 = await prisma.automation.upsert({
    where: { id: 'automation_followup' },
    update: {},
    create: {
      id: 'automation_followup',
      userId: user.id,
      name: 'Follow-up Stale Leads',
      trigger: 'lead.no_reply_3d',
      action: 'send_email',
      template: `Hi {{name}}, we noticed you reached out about our {{businessType}} services. Are you still interested? We'd love to help! - {{agentName}}`,
      enabled: true,
      config: {
        channel: 'email',
        delay: 0,
        conditions: {
          minScore: 30, // Only if score > 30
        },
      },
    },
  })

  console.log('✓ Created: Follow-up Stale Leads')

  // Automation 3: High-intent booking reminder
  const automation3 = await prisma.automation.upsert({
    where: { id: 'automation_booking' },
    update: {},
    create: {
      id: 'automation_booking',
      userId: user.id,
      name: 'High Intent - Send Calendar',
      trigger: 'lead.created',
      action: 'send_email',
      template: `Hi {{name}}, thanks for reaching out! Based on your interest, I'd love to schedule a free consultation. Click here to book a time that works for you: [CALENDAR_LINK] - {{agentName}}`,
      enabled: true,
      config: {
        channel: 'email',
        delay: 0,
        conditions: {
          minScore: 70, // Only high-intent leads
          intentIn: ['Booking', 'Pricing'],
        },
      },
    },
  })

  console.log('✓ Created: High Intent - Send Calendar')

  console.log('\n✅ Default automations seeded successfully!')
  console.log('\nAutomations created:')
  console.log('1. Welcome New Leads (SMS, all leads)')
  console.log('2. Follow-up Stale Leads (Email, score >30)')
  console.log('3. High Intent - Send Calendar (Email, score >70, intent: Booking/Pricing)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
