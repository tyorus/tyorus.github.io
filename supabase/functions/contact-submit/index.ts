/**
 * Contact form edge function.
 *
 * Required secrets (see supabase/functions/.env.example):
 *   RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL
 * Optional:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID
 *
 * Auto-injected by Supabase: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const inquiryLabels: Record<string, string> = {
  client: 'Prospective client',
  professional: 'Professional connection',
  general: 'General inquiry',
};

type ContactPayload = {
  name?: string;
  email?: string;
  inquiryType?: string;
  subject?: string;
  message?: string;
  website?: string;
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function hashIp(ip: string) {
  const data = new TextEncoder().encode(ip);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function sendEmail(payload: {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
}) {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const to = Deno.env.get('CONTACT_TO_EMAIL');
  const from = Deno.env.get('CONTACT_FROM_EMAIL');

  if (!apiKey || !to || !from) {
    throw new Error('Email is not configured');
  }

  const inquiryLabel = inquiryLabels[payload.inquiryType] ?? payload.inquiryType;
  const subjectLine = payload.subject
    ? `[Contact] ${payload.subject}`
    : `[Contact] ${inquiryLabel} — ${payload.name}`;

  const text = [
    `New contact form submission`,
    ``,
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Type: ${inquiryLabel}`,
    `Subject: ${payload.subject || '(none)'}`,
    ``,
    `Message:`,
    payload.message,
  ].join('\n');

  const html = `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(payload.name)}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(payload.email)}">${escapeHtml(payload.email)}</a></p>
    <p><strong>Type:</strong> ${escapeHtml(inquiryLabel)}</p>
    <p><strong>Subject:</strong> ${escapeHtml(payload.subject || '(none)')}</p>
    <p><strong>Message:</strong></p>
    <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(payload.message)}</pre>
  `;

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: payload.email,
      subject: subjectLine,
      html,
      text,
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Resend failed: ${detail}`);
  }
}

async function sendTelegram(payload: {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
}) {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

  if (!token || !chatId) {
    return false;
  }

  const inquiryLabel = inquiryLabels[payload.inquiryType] ?? payload.inquiryType;
  const text = [
    '📬 New contact form',
    '',
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    `Type: ${inquiryLabel}`,
    `Subject: ${payload.subject || '(none)'}`,
    '',
    payload.message,
  ].join('\n');

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
    }),
  });

  if (!response.ok) {
    const detail = await response.text();
    console.error('Telegram failed:', detail);
    return false;
  }

  return true;
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  let body: ContactPayload;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (body.website?.trim()) {
    return jsonResponse({ ok: true });
  }

  const name = body.name?.trim() ?? '';
  const email = body.email?.trim() ?? '';
  const inquiryType = body.inquiryType?.trim() ?? '';
  const subject = body.subject?.trim() ?? '';
  const message = body.message?.trim() ?? '';

  if (!name || name.length > 120) {
    return jsonResponse({ error: 'Invalid name' }, 400);
  }

  if (!isValidEmail(email) || email.length > 254) {
    return jsonResponse({ error: 'Invalid email' }, 400);
  }

  if (!['client', 'professional', 'general'].includes(inquiryType)) {
    return jsonResponse({ error: 'Invalid inquiry type' }, 400);
  }

  if (!message || message.length < 10 || message.length > 5000) {
    return jsonResponse({ error: 'Invalid message' }, 400);
  }

  if (subject.length > 200) {
    return jsonResponse({ error: 'Invalid subject' }, 400);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server misconfigured' }, 500);
  }

  const forwardedFor = req.headers.get('x-forwarded-for') ?? '';
  const clientIp = forwardedFor.split(',')[0]?.trim() || 'unknown';
  const ipHash = await hashIp(clientIp);
  const userAgent = req.headers.get('user-agent') ?? '';

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count, error: rateError } = await supabase
    .from('contact_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('ip_hash', ipHash)
    .gte('created_at', oneHourAgo);

  if (rateError) {
    console.error('Rate limit check failed:', rateError.message);
    return jsonResponse({ ok: false, saved: false, emailSent: false, telegramSent: false, error: 'Unable to process submission' }, 500);
  }

  if ((count ?? 0) >= 3) {
    return jsonResponse({ ok: false, saved: false, emailSent: false, telegramSent: false, error: 'Too many submissions. Please try again later.' }, 429);
  }

  const { error: insertError } = await supabase.from('contact_submissions').insert({
    name,
    email,
    inquiry_type: inquiryType,
    subject: subject || null,
    message,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error('Insert failed:', insertError.message);
    return jsonResponse({ ok: false, saved: false, emailSent: false, telegramSent: false, error: 'Unable to save submission' }, 500);
  }

  let emailSent = false;
  try {
    await sendEmail({ name, email, inquiryType, subject, message });
    emailSent = true;
  } catch (error) {
    console.error('Email failed:', error);
    return jsonResponse(
      {
        ok: false,
        saved: true,
        emailSent: false,
        telegramSent: false,
        error: 'Unable to send notification email',
      },
      502,
    );
  }

  let telegramSent = false;
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  if (token && chatId) {
    telegramSent = await sendTelegram({ name, email, inquiryType, subject, message });
  }

  return jsonResponse({ ok: true, saved: true, emailSent, telegramSent });
});
