import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import LetterForm from './components/LetterForm'
import LetterTimeline from './components/LetterTimeline'
import { redirect } from 'next/navigation'

export default async function SubscriberDashboard() {
  try {
    const user = await requireRole('subscriber')
    const supabase = await createClient()

    // Fetch user's letters
    const { data: letters, error } = await supabase
      .from('letters')
      .select('*')
      .eq('subscriber_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching letters:', error)
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Subscriber Dashboard</h1>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">Welcome, {user.profile?.full_name || user.email}</span>
                <form action="/api/auth/signout" method="post">
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Sign Out
                  </button>
                </form>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Letter Generation Form */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Generate New Letter</h2>
              <LetterForm userId={user.id} />
            </div>

            {/* Letter Timeline */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Your Letters</h2>
              <LetterTimeline letters={letters || []} />
            </div>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}

