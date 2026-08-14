/**
 * Shared branded email builder for all transactional emails.
 * Matches the Rental Waivers design system: Space Grotesk headings,
 * DM Sans body, navy primary (#162a4a), clean white layout.
 */

import { sendLovableEmail } from 'npm:@lovable.dev/email-js'
import { createClient } from 'npm:@supabase/supabase-js@2'

const PRIMARY = '#162a4a';        // hsl(220, 65%, 18%)
const PRIMARY_FG = '#fafafa';     // hsl(0, 0%, 98%)
const FOREGROUND = '#1a1c22';     // hsl(220, 20%, 10%)
const MUTED_FG = '#6b7280';       // hsl(220, 10%, 46%)
const BORDER = '#e5e7eb';         // hsl(220, 13%, 91%)
const SUCCESS = '#22976a';        // hsl(152, 60%, 40%)
const WARNING = '#f59e0b';        // hsl(38, 92%, 50%)
const DESTRUCTIVE = '#ef4444';    // hsl(0, 72%, 51%)
const SURFACE = '#f8fafc';
const LOGO_URL = 'https://sibwbzhpyiwmhigskgtr.supabase.co/storage/v1/object/public/email-assets/logo.png';

interface EmailSection {
  type: 'text' | 'heading' | 'button' | 'table' | 'callout' | 'divider' | 'small';
  content?: string;
  rows?: Array<{ label: string; value: string }>;
  href?: string;
  variant?: 'success' | 'warning' | 'error' | 'info';
}

interface EmailOptions {
  previewText: string;
  orgName?: string;
  greeting?: string;
  sections: EmailSection[];
  footerText?: string;
}

export function buildEmail(options: EmailOptions): string {
  const {
    previewText,
    orgName = 'Rental Waivers',
    greeting,
    sections,
    footerText,
  } = options;

  const body = sections.map(renderSection).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${previewText}</title>
  <!--[if mso]><style>body,table,td{font-family:Arial,sans-serif!important}</style><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;-webkit-text-size-adjust:none;">
  <!-- Preview text -->
  <div style="display:none;max-height:0;overflow:hidden;">${previewText}&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
          <!-- Header -->
          <tr>
            <td style="padding:32px 40px 24px;border-bottom:1px solid ${BORDER};">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:12px;">
                    <img src="${LOGO_URL}" alt="${orgName}" width="32" height="32" style="display:block;border-radius:6px;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:18px;font-weight:700;color:${PRIMARY};letter-spacing:-0.02em;">${orgName}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px 40px;">
              ${greeting ? `<p style="font-size:16px;color:${FOREGROUND};margin:0 0 24px;line-height:1.5;">${greeting}</p>` : ''}
              ${body}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px 32px;border-top:1px solid ${BORDER};">
              ${footerText ? `<p style="font-size:13px;color:${MUTED_FG};margin:0 0 12px;line-height:1.5;">${footerText}</p>` : ''}
              <p style="font-size:12px;color:#9ca3af;margin:0;line-height:1.5;">
                Sent by ${orgName} via <a href="https://rentalwaivers.com" style="color:#9ca3af;text-decoration:underline;">Rental Waivers</a><br>
                This is not legal advice. Rental Waivers is a document signing tool, not a law firm.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function renderSection(section: EmailSection): string {
  switch (section.type) {
    case 'heading':
      return `<h2 style="font-family:'Space Grotesk',system-ui,sans-serif;font-size:22px;font-weight:700;color:${FOREGROUND};margin:0 0 16px;letter-spacing:-0.02em;">${section.content}</h2>`;

    case 'text':
      return `<p style="font-size:15px;color:${MUTED_FG};line-height:1.6;margin:0 0 20px;">${section.content}</p>`;

    case 'small':
      return `<p style="font-size:13px;color:${MUTED_FG};line-height:1.5;margin:0 0 16px;">${section.content}</p>`;

    case 'button':
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
        <tr>
          <td style="background-color:${PRIMARY};border-radius:8px;">
            <a href="${section.href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:${PRIMARY_FG};text-decoration:none;font-family:'DM Sans',-apple-system,sans-serif;">${section.content}</a>
          </td>
        </tr>
      </table>`;

    case 'table':
      if (!section.rows?.length) return '';
      const rows = section.rows.map(r =>
        `<tr>
          <td style="padding:10px 16px;font-size:14px;color:${MUTED_FG};border-bottom:1px solid ${BORDER};">${r.label}</td>
          <td style="padding:10px 16px;font-size:14px;color:${FOREGROUND};font-weight:500;text-align:right;border-bottom:1px solid ${BORDER};">${r.value}</td>
        </tr>`
      ).join('');
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${SURFACE};border-radius:8px;overflow:hidden;margin:0 0 24px;">
        ${rows}
      </table>`;

    case 'callout': {
      const colors: Record<string, { bg: string; border: string; text: string; icon: string }> = {
        success: { bg: '#f0fdf4', border: SUCCESS, text: '#15803d', icon: '✓' },
        warning: { bg: '#fffbeb', border: WARNING, text: '#92400e', icon: '⚠' },
        error:   { bg: '#fef2f2', border: DESTRUCTIVE, text: '#991b1b', icon: '✕' },
        info:    { bg: '#eff6ff', border: PRIMARY, text: PRIMARY, icon: 'ℹ' },
      };
      const c = colors[section.variant || 'info'];
      return `<div style="background-color:${c.bg};border-left:4px solid ${c.border};border-radius:6px;padding:16px 20px;margin:0 0 24px;">
        <p style="font-size:14px;color:${c.text};margin:0;line-height:1.5;font-weight:500;">${c.icon}&nbsp;&nbsp;${section.content}</p>
      </div>`;
    }

    case 'divider':
      return `<hr style="border:none;border-top:1px solid ${BORDER};margin:24px 0;">`;

    default:
      return '';
  }
}

// Convert HTML to a plain-text fallback (required by the email API)
function htmlToText(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<a[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)')
    .replace(/<br\s*\/?>(?=)/gi, '\n')
    .replace(/<\/(p|div|tr|h1|h2|h3|li|table)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n\s*\n+/g, '\n\n')
    .trim();
}

// ---------------- Delivery logging + retry helpers ----------------

const MAX_ATTEMPTS = 4; // 1 initial + 3 retries
const BASE_DELAY_MS = 500;

function adminClient() {
  const url = Deno.env.get('SUPABASE_URL');
  const key = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function logDelivery(entry: {
  message_id: string;
  template_name: string;
  recipient_email: string;
  status: 'pending' | 'sent' | 'failed' | 'dlq';
  error_message?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const client = adminClient();
    if (!client) return;
    await client.from('email_send_log').insert(entry);
  } catch (e) {
    console.error('email_send_log insert failed:', e);
  }
}

async function logEnvelopeEvent(envelopeId: string | undefined, eventType: string, metadata: Record<string, unknown>) {
  if (!envelopeId) return;
  try {
    const client = adminClient();
    if (!client) return;
    await client.from('envelope_events').insert({
      envelope_id: envelopeId,
      event_type: eventType,
      metadata,
    });
  } catch (e) {
    console.error('envelope_events insert failed:', e);
  }
}

// Transient = worth retrying. Permanent (4xx other than 408/429) = fail fast.
function isTransient(error: any): boolean {
  const status = typeof error?.status === 'number' ? error.status : undefined;
  if (status === undefined) return true; // network / timeout / unknown
  if (status === 408 || status === 429) return true;
  return status >= 500;
}

function backoffMs(attempt: number, error: any): number {
  const retryAfter = typeof error?.retryAfterSeconds === 'number' ? error.retryAfterSeconds * 1000 : null;
  if (retryAfter && retryAfter > 0) return Math.min(retryAfter, 15_000);
  const exp = BASE_DELAY_MS * Math.pow(2, attempt - 1);
  return Math.min(exp + Math.floor(Math.random() * 250), 8_000);
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Helper to send email via Lovable Emails, with automatic retries on transient failures
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  templateName?: string;
  envelopeId?: string;
}): Promise<{ success: boolean; id?: string; error?: string; attempts?: number }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

  const recipients = Array.isArray(params.to) ? params.to : [params.to];
  const messageIds: string[] = [];
  const textBody = (params.text || htmlToText(params.html) || params.subject).slice(0, 100000);
  const templateName = params.templateName || 'legacy-transactional';
  let totalAttempts = 0;

  for (const recipient of recipients) {
    // Stable per-recipient identity so retries are deduped upstream and
    // all log rows for this email correlate on the same message_id.
    const messageId = crypto.randomUUID();
    const idempotencyKey = messageId;

    await logDelivery({
      message_id: messageId,
      template_name: templateName,
      recipient_email: recipient,
      status: 'pending',
      metadata: { subject: params.subject, envelope_id: params.envelopeId ?? null },
    });

    let lastError: any = null;
    let delivered = false;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      totalAttempts++;
      try {
        const result = await sendLovableEmail(
          {
            to: recipient,
            from: params.from || 'Rental Waivers <noreply@rentalwaivers.com>',
            sender_domain: 'notify.rentalwaivers.com',
            subject: params.subject,
            html: params.html,
            text: textBody,
            purpose: 'transactional',
            label: templateName,
            idempotency_key: idempotencyKey,
          },
          { apiKey: LOVABLE_API_KEY, sendUrl: Deno.env.get('LOVABLE_SEND_URL') }
        );
        if (result?.id) messageIds.push(result.id);
        delivered = true;

        await logDelivery({
          message_id: messageId,
          template_name: templateName,
          recipient_email: recipient,
          status: 'sent',
          metadata: { attempt, provider_id: result?.id ?? null, envelope_id: params.envelopeId ?? null },
        });
        await logEnvelopeEvent(params.envelopeId, 'email_sent', {
          recipient,
          template: templateName,
          message_id: messageId,
          attempts: attempt,
        });
        break;
      } catch (error: any) {
        lastError = error;
        const transient = isTransient(error);
        const willRetry = transient && attempt < MAX_ATTEMPTS;
        const errMsg = error instanceof Error ? error.message : 'Failed to send email';

        console.error(`Lovable email send error (attempt ${attempt}/${MAX_ATTEMPTS}, transient=${transient}):`, error);

        await logDelivery({
          message_id: messageId,
          template_name: templateName,
          recipient_email: recipient,
          status: willRetry ? 'pending' : (transient ? 'dlq' : 'failed'),
          error_message: errMsg,
          metadata: {
            attempt,
            transient,
            will_retry: willRetry,
            status_code: error?.status ?? null,
            envelope_id: params.envelopeId ?? null,
          },
        });
        await logEnvelopeEvent(params.envelopeId, willRetry ? 'email_retry' : 'email_failed', {
          recipient,
          template: templateName,
          message_id: messageId,
          attempt,
          transient,
          error: errMsg,
        });

        if (!willRetry) break;
        await sleep(backoffMs(attempt, error));
      }
    }

    if (!delivered) {
      return {
        success: false,
        attempts: totalAttempts,
        error: lastError instanceof Error ? lastError.message : 'Failed to send email',
      };
    }
  }

  return { success: true, id: messageIds.join(','), attempts: totalAttempts };
}

