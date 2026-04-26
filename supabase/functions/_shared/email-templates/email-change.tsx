/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Confirm your new Rental Waivers email</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://llsgwfzoutdpgrgtcbif.supabase.co/storage/v1/object/public/email-assets/logo.png"
            alt="Rental Waivers"
            width="40"
            height="40"
            style={logo}
          />
          <Text style={brand}>Rental Waivers</Text>
        </Section>
        <Heading style={h1}>Confirm your new email</Heading>
        <Text style={text}>
          You asked to change the email on your Rental Waivers account
          from <strong>{email}</strong> to <strong>{newEmail}</strong>.
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '0 0 28px' }}>
          <Button style={button} href={confirmationUrl}>
            Confirm change
          </Button>
        </Section>
        <Text style={footer}>
          Didn't request this? Secure your account by resetting your
          password right away.
        </Text>
        <Text style={signature}>— The Rental Waivers team</Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const header = { marginBottom: '24px' }
const logo = { display: 'inline-block', verticalAlign: 'middle', borderRadius: '8px' }
const brand = {
  display: 'inline-block',
  verticalAlign: 'middle',
  margin: '0 0 0 10px',
  fontFamily: "'Space Grotesk', -apple-system, Arial, sans-serif",
  fontSize: '15px',
  fontWeight: 600 as const,
  color: 'hsl(220, 65%, 18%)',
  letterSpacing: '-0.01em',
}
const h1 = {
  fontFamily: "'Space Grotesk', -apple-system, Arial, sans-serif",
  fontSize: '24px',
  fontWeight: 700 as const,
  color: 'hsl(220, 20%, 10%)',
  letterSpacing: '-0.02em',
  margin: '0 0 16px',
}
const text = {
  fontSize: '15px',
  color: 'hsl(220, 20%, 25%)',
  lineHeight: '1.6',
  margin: '0 0 18px',
}
const button = {
  backgroundColor: 'hsl(220, 65%, 18%)',
  color: '#ffffff',
  fontFamily: "'Space Grotesk', -apple-system, Arial, sans-serif",
  fontSize: '15px',
  fontWeight: 600 as const,
  borderRadius: '8px',
  padding: '13px 28px',
  textDecoration: 'none',
  display: 'inline-block',
}
const footer = {
  fontSize: '13px',
  color: 'hsl(220, 10%, 46%)',
  lineHeight: '1.5',
  margin: '28px 0 8px',
}
const signature = {
  fontSize: '13px',
  color: 'hsl(220, 10%, 46%)',
  margin: '0',
}
