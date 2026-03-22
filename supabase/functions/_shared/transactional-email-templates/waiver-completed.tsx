import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'Rental Waivers'

interface WaiverCompletedProps {
  signerName?: string
  orgName?: string
  signedAt?: string
  downloadUrl?: string
  isHostCopy?: boolean
}

const WaiverCompletedEmail = ({
  signerName,
  orgName,
  signedAt,
  downloadUrl,
  isHostCopy,
}: WaiverCompletedProps) => {
  const displayName = signerName || 'Guest'
  const org = orgName || SITE_NAME
  const date = signedAt || new Date().toLocaleDateString()

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        {isHostCopy
          ? `${displayName} has signed a waiver`
          : `Your signed waiver from ${org}`}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={brand}>{org}</Text>
          <Heading style={h1}>
            {isHostCopy
              ? `${displayName} signed your waiver`
              : 'Your waiver is complete'}
          </Heading>
          <Text style={text}>
            {isHostCopy
              ? `${displayName} has signed a liability waiver. A copy is available in your dashboard.`
              : `Thanks for signing your waiver with ${org}. A copy is available for your records.`}
          </Text>
          <Section style={detailsBox}>
            <Text style={detailLabel}>Signer</Text>
            <Text style={detailValue}>{displayName}</Text>
            <Text style={detailLabel}>Date signed</Text>
            <Text style={detailValue}>{date}</Text>
          </Section>
          {downloadUrl && (
            <Button style={button} href={downloadUrl}>
              Download PDF
            </Button>
          )}
          {!downloadUrl && (
            <Button style={button} href="https://rentalwaivers.com/dashboard">
              View in Dashboard
            </Button>
          )}
          <Hr style={hr} />
          <Text style={footer}>
            This document is stored securely for 2 years. {isHostCopy
              ? 'Access it anytime from your dashboard.'
              : 'Contact the host if you need another copy.'}
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: WaiverCompletedEmail,
  subject: (data: Record<string, any>) =>
    data.isHostCopy
      ? `${data.signerName || 'A guest'} signed your waiver`
      : `Your signed waiver from ${data.orgName || 'Rental Waivers'}`,
  displayName: 'Waiver completed',
  previewData: {
    signerName: 'Jane Doe',
    orgName: 'Pool Party Rentals',
    signedAt: 'March 22, 2026',
    downloadUrl: 'https://rentalwaivers.com/dashboard',
    isHostCopy: false,
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
