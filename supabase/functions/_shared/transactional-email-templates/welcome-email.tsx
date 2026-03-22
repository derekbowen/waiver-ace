import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Rental Waivers'

interface WelcomeEmailProps {
  name?: string
}

const WelcomeEmail = ({ name }: WelcomeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to {SITE_NAME} — your waiver system is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={brand}>{SITE_NAME}</Text>
        <Heading style={h1}>
          {name ? `Welcome, ${name}!` : 'Welcome aboard!'}
        </Heading>
        <Text style={text}>
          Your account is set up and ready to go. Here's how to get started:
        </Text>
        <Text style={text}>
          <strong>1.</strong> Create your first waiver template{'\n'}
          <strong>2.</strong> Send a waiver to a guest{'\n'}
          <strong>3.</strong> Get notified when they sign
        </Text>
        <Button style={button} href="https://rentalwaivers.com/dashboard">
          Go to Dashboard
        </Button>
        <Hr style={hr} />
        <Text style={text}>
          You start with 5 free credits — each waiver uses 1 credit. Need more?
          Check out our flexible credit packages.
        </Text>
        <Text style={footer}>
          Thanks for choosing {SITE_NAME}. We're here to help if you need anything.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: WelcomeEmail,
  subject: `Welcome to ${SITE_NAME} — let's get started`,
  displayName: 'Welcome email',
  previewData: { name: 'Derek' },
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
