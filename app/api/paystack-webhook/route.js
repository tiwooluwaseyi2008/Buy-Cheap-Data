import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

export async function POST(request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get('x-paystack-signature');
    const secret = process.env.PAYSTACK_SECRET_KEY;

    const hash = crypto.createHmac('sha256', secret).update(bodyText).digest('hex');
    if (hash !== signature) {
      return NextResponse.json({ message: 'Unauthorized signature' }, { status: 401 });
    }

    const event = JSON.parse(bodyText);

    if (event.event === 'charge.success') {
      const email = event.data.customer.email.toLowerCase();
      const amountPaid = event.data.amount / 100;
      const reference = event.data.reference;

      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('reference', reference)
        .single();

      if (existing) {
        return NextResponse.json({ status: 'already processed' }, { status: 200 });
      }

      const { data: user } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (user) {
        const newBalance = Number(user.wallet_balance || 0) + amountPaid;
        await supabase.from('profiles').update({ wallet_balance: newBalance }).eq('id', user.id);
        await supabase.from('transactions').insert({
          user_id: user.id,
          type: 'deposit',
          amount: amountPaid,
          status: 'success',
          reference: reference,
          details: 'Wallet funded via Paystack'
        });
      } else {
        const { data: newUser } = await supabase
          .from('profiles')
          .insert({ email, wallet_balance: amountPaid })
          .select()
          .single();
        if (newUser) {
          await supabase.from('transactions').insert({
            user_id: newUser.id,
            type: 'deposit',
            amount: amountPaid,
            status: 'success',
            reference: reference,
            details: 'Initial wallet funded via Paystack'
          });
        }
      }
    }

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

