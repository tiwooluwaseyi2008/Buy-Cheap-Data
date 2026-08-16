import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { purchaseDataSubAndGain } from '@/lib/subandgain';

export async function POST(request) {
  try {
    const { email, network, phone, planId, amount } = await request.json();

    if (!email || !network || !phone || !planId || !amount) {
      return NextResponse.json({ message: 'Missing required request fields' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase();

    const { data: user, error: userErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', cleanEmail)
      .single();

    if (userErr || !user) {
      return NextResponse.json({ message: 'User account not found. Please log in first.' }, { status: 404 });
    }

    const currentBalance = Number(user.wallet_balance || 0);
    const cost = Number(amount);

    if (currentBalance < cost) {
      return NextResponse.json({ message: 'Insufficient wallet balance. Please fund your wallet.' }, { status: 400 });
    }

    // Deduct balance securely on server
    const newBalance = currentBalance - cost;
    await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);

    // Call SubAndGain API
    const apiResult = await purchaseDataSubAndGain(network, phone, planId);

    if (apiResult.success) {
      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'data_purchase',
        network: network,
        phone: phone,
        amount: cost,
        status: 'success',
        reference: apiResult.reference,
        details: `${network} data bundle sent to ${phone}`
      });

      return NextResponse.json({
        success: true,
        message: `Successfully sent data bundle to ${phone}!`,
        newBalance
      });
    } else {
      // Refund user balance if provider failed
      await supabase.from('profiles').update({ wallet_balance: currentBalance }).eq('id', user.id);

      await supabase.from('transactions').insert({
        user_id: user.id,
        type: 'failed_purchase',
        network: network,
        phone: phone,
        amount: cost,
        status: 'failed',
        reference: `FAIL-${Date.now()}`,
        details: apiResult.message
      });

      return NextResponse.json({
        success: false,
        message: `Purchase failed: ${apiResult.message}. Your money has been refunded.`
      }, { status: 400 });
    }
  } catch (error) {
    console.error('Purchase Route Error:', error);
    return NextResponse.json({ message: 'Server error processing transaction' }, { status: 500 });
  }
}

