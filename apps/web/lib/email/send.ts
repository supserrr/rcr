const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM =
  process.env.RESEND_FROM_EMAIL ??
  'noreply@rwandacancerrelief.org';

interface SendEmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: SendEmailOptions): Promise<boolean> {
  if (!RESEND_API_KEY) {
    console.warn('[email] RESEND_API_KEY not configured. Email will not be sent.');
    return false;
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to,
        subject,
        text,
        html: html ?? `<pre>${text}</pre>`,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('[email] Resend API error:', response.status, errorBody);
      return false;
    }

    return true;
  } catch (error) {
    console.error('[email] Failed to send email:', error);
    return false;
  }
}

