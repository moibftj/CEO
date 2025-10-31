'use server'

import Stripe from 'stripe'
import { requireAuth } from '@/lib/auth'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // apiVersion: '2023-10-16', // Use default or latest stable version
})

export async function createCheckoutSession({
  priceId,
  mode,
}: {
  priceId: string
  mode: 'payment' | 'subscription'
}) {
  const user = await requireAuth()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: mode,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriber/dashboard?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/subscriber/dashboard?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email,
    })

    return { url: session.url }
  } catch (error: any) {
    console.error('Error creating checkout session:', error)
    throw new Error(error.message)
  }
}

