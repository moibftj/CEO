import { requireRole } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EmployeeDashboard() {
  try {
    const user = await requireRole('employee')
    const supabase = await createClient()

    // Fetch employee metrics
    const { data: metrics, error } = await supabase
      .from('employee_metrics')
      .select('*')
      .eq('employee_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching employee metrics:', error)
    }

    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
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
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Coupon Code Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Your Coupon Code</h3>
              <p className="text-3xl font-bold text-indigo-600">{metrics?.coupon_code || 'N/A'}</p>
              <p className="text-xs text-gray-500 mt-2">Share this with new subscribers</p>
            </div>

            {/* Uses Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Uses</h3>
              <p className="text-3xl font-bold text-green-600">{metrics?.uses || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Times your coupon was used</p>
            </div>

            {/* Points Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Points Earned</h3>
              <p className="text-3xl font-bold text-purple-600">{metrics?.points || 0}</p>
              <p className="text-xs text-gray-500 mt-2">Loyalty points accumulated</p>
            </div>

            {/* Revenue Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Revenue Generated</h3>
              <p className="text-3xl font-bold text-blue-600">
                ${Number(metrics?.revenue_generated || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">5% commission on sales</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">How It Works</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Share your unique coupon code with potential subscribers</li>
              <li>When they sign up and make a payment using your code, you earn commission</li>
              <li>Track your performance metrics in real-time on this dashboard</li>
              <li>Earn 5% commission on all revenue generated through your referrals</li>
            </ol>
          </div>
        </main>
      </div>
    )
  } catch (error) {
    redirect('/login')
  }
}

