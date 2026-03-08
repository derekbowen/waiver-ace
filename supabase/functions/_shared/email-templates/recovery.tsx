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
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your Rental Waivers password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://sibwbzhpyiwmhigskgtr.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="Rental Waivers" width="40" height="40" style={{ margin: '0 0 16px' }} />
        <Text style={brand}>Rental Waivers</Text>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password. Click the button below
          to choose a new one.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request this, you can safely ignore this email. Your
          password won't be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const footer = { fontSize: '13px', color: '#999999', margin: '32px 0 0' }
