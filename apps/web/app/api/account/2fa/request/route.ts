import { createHash, randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

import { sendEmail } from '@/lib/email/send';
import { createClient } from '@/lib/supabase/server';

const CODE_TTL_MINUTES = 10;

type RequestBody = {
  action?: 'enable' | 'disable';
};

function hashCode(code: string, salt: string) {
  return createHash('sha256').update(`${code}:${salt}`).digest('hex');
}

function generateCode() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as RequestBody;
    const purpose = body.action === 'disable' ? 'disable' : 'enable';

    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not configured.' },
        { status: 500 },
      );
    }

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('[2fa/request] Failed to load session:', sessionError);
    }

    const user = session?.user;

    if (!user || !user.email) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('two_factor_enabled')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('[2fa/request] Failed to load profile:', profileError);
      return NextResponse.json(
        { error: 'Unable to read account settings.' },
        { status: 500 },
      );
    }

    if (purpose === 'enable' && profile?.two_factor_enabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled.' },
        { status: 400 },
      );
    }

    if (purpose === 'disable' && !profile?.two_factor_enabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is not currently enabled.' },
        { status: 400 },
      );
    }

    await supabase
      .from('two_factor_email_codes')
      .delete()
      .eq('user_id', user.id)
      .eq('purpose', purpose);

    const code = generateCode();
    const salt = randomBytes(16).toString('hex');
    const codeHash = hashCode(code, salt);
    const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000).toISOString();

    const { error: insertError } = await supabase.from('two_factor_email_codes').insert({
      user_id: user.id,
      purpose,
      code_hash: codeHash,
      code_salt: salt,
      expires_at: expiresAt,
    });

    if (insertError) {
      console.error('[2fa/request] Failed to store code:', insertError);
      return NextResponse.json(
        { error: 'Unable to generate verification code. Please try again.' },
        { status: 500 },
      );
    }

    const emailSubject =
      purpose === 'disable'
        ? 'Confirm disabling two-factor authentication'
        : 'Your two-factor authentication verification code';

    const emailText = [
      `Hello,`,
      '',
      purpose === 'disable'
        ? 'Use the code below to disable two-factor authentication for your Rwanda Cancer Relief account.'
        : 'Use the code below to enable two-factor authentication for your Rwanda Cancer Relief account.',
      '',
      `Code: ${code}`,
      '',
      `This code expires in ${CODE_TTL_MINUTES} minutes.`,
      '',
      'If you did not request this, please secure your account immediately.',
    ].join('\n');

    const emailSent = await sendEmail({
      to: user.email,
      subject: emailSubject,
      text: emailText,
      html: emailText.replace(/\n/g, '<br />'),
    });

    if (!emailSent) {
      console.info(`[2fa/request] Verification code for ${user.email}: ${code}`);
    }

    return NextResponse.json({
      success: true,
      delivery: emailSent ? 'email' : 'fallback',
      expiresAt,
    });
  } catch (error) {
    console.error('[2fa/request] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while generating the verification code.' },
      { status: 500 },
    );
  }
}

