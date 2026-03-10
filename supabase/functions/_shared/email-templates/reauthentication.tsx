/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Rental Waivers verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src="https://sibwbzhpyiwmhigskgtr.supabase.co/storage/v1/object/public/email-assets/logo.png" alt="Rental Waivers" width="40" height="40" style={{ margin: '0 0 16px' }} />
        <Text style={brand}>Rental Waivers</Text>
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code expires shortly. If you didn't request this, you can safely
          ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'Space Grotesk', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: 'hsl(220, 65%, 18%)',
  margin: '0 0 30px',
  letterSpacing: '4px',
}
const footer = { fontSize: '13px', color: '#999999', margin: '32px 0 0' }
