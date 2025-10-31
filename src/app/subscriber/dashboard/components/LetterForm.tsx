'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface LetterFormProps {
  userId: string
}

export default function LetterForm({ userId }: LetterFormProps) {
  const [formData, setFormData] = useState({
    sender_name: '',
    sender_address: '',
    recipient_name: '',
    recipient_address: '',
    subject: '',
    desired_resolution: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setLoading(true)

    try {
      // Call the generate-letter Edge Function
      const { data, error } = await supabase.functions.invoke('generate-letter', {
        body: {
          subscriber_id: userId,
          formData,
        },
      })

      if (error) throw error

      setSuccess(true)
      setFormData({
        sender_name: '',
        sender_address: '',
        recipient_name: '',
        recipient_address: '',
        subject: '',
        desired_resolution: '',
      })

      // Refresh the page to show the new letter
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to generate letter')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          Letter generated successfully! Check the timeline below.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="sender_name"
            name="sender_name"
            type="text"
            value={formData.sender_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label htmlFor="sender_address" className="block text-sm font-medium text-gray-700 mb-1">
            Your Address
          </label>
          <textarea
            id="sender_address"
            name="sender_address"
            value={formData.sender_address}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="123 Main St, City, State 12345"
          />
        </div>

        <div>
          <label htmlFor="recipient_name" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Name
          </label>
          <input
            id="recipient_name"
            name="recipient_name"
            type="text"
            value={formData.recipient_name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Jane Smith"
          />
        </div>

        <div>
          <label htmlFor="recipient_address" className="block text-sm font-medium text-gray-700 mb-1">
            Recipient Address
          </label>
          <textarea
            id="recipient_address"
            name="recipient_address"
            value={formData.recipient_address}
            onChange={handleChange}
            required
            rows={2}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="456 Oak Ave, City, State 67890"
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
            Subject/Matter
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Dispute regarding contract breach"
          />
        </div>

        <div>
          <label htmlFor="desired_resolution" className="block text-sm font-medium text-gray-700 mb-1">
            Desired Resolution
          </label>
          <textarea
            id="desired_resolution"
            name="desired_resolution"
            value={formData.desired_resolution}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="I seek a full refund and compensation for damages..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Letter...' : 'Generate Letter'}
        </button>
      </form>
    </div>
  )
}

