import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id');
  if (!sessionId) {
    return NextResponse.json({ error: 'Missing session_id' }, { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return NextResponse.json({
      status: session.payment_status,
      amount: session.amount_total,
      currency: session.currency,
    });
  } catch (err) {
    console.error('Stripe session verify error:', err);
    return NextResponse.json({ error: 'Could not verify session' }, { status: 500 });
  }
}