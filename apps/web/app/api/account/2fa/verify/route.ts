import { createHash } from 'crypto';
import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

type VerifyRequestBody = {
  code?: string;
  action?: 'enable' | 'disable';
};

function hashCode(code: string, salt: string) {
  return createHash('sha256').update(`${code}:${salt}`).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { code, action } = (await request.json().catch(() => ({}))) as VerifyRequestBody;
    if (!code || code.trim().length === 0) {
      return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
    }

    const purpose = action === 'disable' ? 'disable' : 'enable';

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
      console.error('[2fa/verify] Failed to load session:', sessionError);
    }

    const user = session?.user;

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated.' }, { status: 401 });
    }

    const { data: codeRecord, error: selectError } = await supabase
      .from('two_factor_email_codes')
      .select('id, code_hash, code_salt, expires_at, consumed_at')
      .eq('user_id', user.id)
      .eq('purpose', purpose)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (selectError) {
      console.error('[2fa/verify] Failed to fetch code record:', selectError);
      return NextResponse.json(
        { error: 'Unable to verify the code. Please request a new one.' },
        { status: 500 },
      );
    }

    if (!codeRecord) {
      return NextResponse.json(
        { error: 'No verification code found. Please request a new one.' },
        { status: 400 },
      );
    }

    if (codeRecord.consumed_at) {
      return NextResponse.json(
        { error: 'This verification code has already been used. Please request a new one.' },
        { status: 400 },
      );
    }

    if (new Date(codeRecord.expires_at).getTime() < Date.now()) {
      return NextResponse.json(
        { error: 'This verification code has expired. Please request a new one.' },
        { status: 400 },
      );
    }

    const providedHash = hashCode(code.trim(), codeRecord.code_salt);
    if (providedHash !== codeRecord.code_hash) {
      return NextResponse.json({ error: 'Invalid verification code.' }, { status: 400 });
    }

    const twoFactorEnabled = purpose === 'enable';

    const { error: consumeError } = await supabase
      .from('two_factor_email_codes')
      .update({ consumed_at: new Date().toISOString() })
      .eq('id', codeRecord.id);

    if (consumeError) {
      console.error('[2fa/verify] Failed to consume code:', consumeError);
      return NextResponse.json(
        { error: 'Unable to finalise verification. Please try again.' },
        { status: 500 },
      );
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({ two_factor_enabled: twoFactorEnabled })
      .eq('id', user.id);

    if (profileError) {
      console.error('[2fa/verify] Failed to update profile flag:', profileError);
      return NextResponse.json(
        { error: 'Unable to update your account settings. Please try again.' },
        { status: 500 },
      );
    }

    const mergedMetadata = {
      ...(user.user_metadata ?? {}),
      two_factor_enabled: twoFactorEnabled,
    };

    const { error: authUpdateError } = await supabase.auth.updateUser({
      data: mergedMetadata,
    });

    if (authUpdateError) {
      console.error('[2fa/verify] Failed to update auth metadata:', authUpdateError);
      return NextResponse.json(
        { error: 'Unable to update your account metadata. Please try again.' },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      twoFactorEnabled,
    });
  } catch (error) {
    console.error('[2fa/verify] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Something went wrong while verifying the code.' },
      { status: 500 },
    );
  }
}

