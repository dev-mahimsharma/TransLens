import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';

const MIN_CENTS = 100; // $1
const MAX_CENTS = 100000; // $1,000 sanity cap

export async function POST(req: NextRequest) {
  try {
    const { amountCents } = await req.json();
    const amount = Math.round(Number(amountCents));

    if (!Number.isFinite(amount) || amount < MIN_CENTS || amount > MAX_CENTS) {
      return NextResponse.json({ error: 'Enter an amount between $1 and $1,000.' }, { status: 400 });
    }

    const origin = req.headers.get('origin') ?? new URL(req.url).origin;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Donation to TransLens',
              description: 'Keeps TransLens free, ad-free, and running.',
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/thank-you?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/donate`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error('Stripe checkout session error:', err);
    return NextResponse.json({ error: 'Could not start checkout. Please try again.' }, { status: 500 });
  }
}