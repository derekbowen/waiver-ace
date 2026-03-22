import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Rental Waivers'

interface CreditsPurchasedProps {
  creditsAdded?: number
  packageLabel?: string
  newBalance?: number
}

const CreditsPurchasedEmail = ({
  creditsAdded,
  packageLabel,
  newBalance,
}: CreditsPurchasedProps) => {
  const credits = creditsAdded || 0
  const pkg = packageLabel || `${credits} Credits`
  const balance = newBalance || credits

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{credits} credits added to your {SITE_NAME} account</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>{SITE_NAME}</Text>
          <Heading style={h1}>Credits added ✓</Heading>
          <Text style={text}>
            Your credit purchase has been processed. Here's a summary:
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Package</Text>
            <Text style={detailValue}>{pkg}</Text>
            <Text style={detailLabel}>Credits added</Text>
            <Text style={detailValue}>+{credits.toLocaleString()}</Text>
            <Text style={detailLabel}>New balance</Text>
            <Text style={detailValue}>{balance.toLocaleString()} credits</Text>
          </Section>
          <Text style={text}>
            Your credits are ready to use. Each waiver sent uses 1 credit.
          </Text>
          <Button style={button} href="https://rentalwaivers.com/dashboard">
            Go to Dashboard
          </Button>
          <Hr style={hr} />
          <Text style={footer}>
            This is a purchase confirmation. Check your Stripe account for the full receipt.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CreditsPurchasedEmail,
  subject: (data: Record<string, any>) =>
    `✓ ${data.creditsAdded || 0} credits added to your account`,
  displayName: 'Credits purchased',
  previewData: {
    creditsAdded: 550,
    packageLabel: '550 Credits',
    newBalance: 645,
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { padding: '40px 30px' }
const brand = {
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: '18px',
  fontWeight: 'bold' as const,
  color: 'hsl(220, 65%, 18%)',
  margin: '0 0 30px',
}
const h1 = {
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: 'hsl(220, 20%, 10%)',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 10%, 46%)',
  lineHeight: '1.6',
  margin: '0 0 24px',
}
const detailsBox = {
  backgroundColor: '#f9fafb',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 24px',
}
const detailLabel = {
  fontSize: '12px',
  color: '#999',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.5px',
  margin: '0 0 4px',
}
const detailValue = {
  fontSize: '15px',
  color: 'hsl(220, 20%, 10%)',
  fontWeight: '600' as const,
  margin: '0 0 12px',
}
const button = {
  backgroundColor: 'hsl(220, 65%, 18%)',
  color: 'hsl(0, 0%, 98%)',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '14px 24px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { fontSize: '13px', color: '#999999', margin: '32px 0 0' }
