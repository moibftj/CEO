'use client'

import { useState } from 'react'
import { createCheckoutSession } from '@/app/actions/stripe'
import Link from 'next/link'

const plans = [
  {
    name: 'One-Time Letter',
    price: '$299',
    description: 'Single professional legal letter',
    features: ['1 AI-generated letter', 'Attorney review', 'PDF download', 'Email delivery'],
    priceId: 'price_one_time_letter', // Replace with actual Stripe Price ID
    mode: 'payment' as const,
  },
  {
    name: '4 Letters/Month',
    price: '$299/year',
    description: 'Perfect for ongoing legal needs',
    features: ['4 letters per month', 'Attorney review', 'PDF downloads', 'Priority support'],
    priceId: 'price_4_letters_year', // Replace with actual Stripe Price ID
    mode: 'subscription' as const,
  },
  {
    name: '8 Letters/Year',
    price: '$599/year',
    description: 'Best value for regular users',
    features: ['8 letters per year', 'Attorney review', 'PDF downloads', 'Premium support'],
    priceId: 'price_8_letters_year', // Replace with actual Stripe Price ID
    mode: 'subscription' as const,
  },
]

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCheckout = async (priceId: string, mode: 'payment' | 'subscription') => {
    setLoading(priceId)
    setError(null)

    try {
      const { url } = await createCheckoutSession({ priceId, mode })
      if (url) {
        window.location.href = url
      }
    } catch (error: any) {
      setError(error.message)
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Pricing Plans</h1>
            <Link
              href="/subscriber/dashboard"
              className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
          <p className="text-xl text-gray-600">
            Select the plan that best fits your legal letter needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.priceId}
              className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition-shadow"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 mb-4">{plan.description}</p>
              <div className="text-4xl font-bold text-indigo-600 mb-6">{plan.price}</div>
              
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleCheckout(plan.priceId, plan.mode)}
                disabled={loading === plan.priceId}
                className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === plan.priceId ? 'Processing...' : 'Get Started'}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>All plans include secure payment processing via Stripe</p>
          <p className="mt-2">
            Note: Replace the priceId values in the code with your actual Stripe Price IDs
          </p>
        </div>
      </main>
    </div>
  )
}

