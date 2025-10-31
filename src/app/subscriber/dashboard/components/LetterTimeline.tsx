'use client'

interface Letter {
  id: string
  status: 'received' | 'under_attorney_review' | 'posted' | 'completed'
  form_data: {
    subject: string
    sender_name: string
    recipient_name: string
  }
  generated_content: string
  created_at: string
}

interface LetterTimelineProps {
  letters: Letter[]
}

const statusConfig = {
  received: {
    label: 'Received',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
  },
  under_attorney_review: {
    label: 'Under Attorney Review',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
  },
  posted: {
    label: 'Posted',
    color: 'bg-purple-500',
    textColor: 'text-purple-700',
    bgColor: 'bg-purple-50',
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
  },
}

export default function LetterTimeline({ letters }: LetterTimelineProps) {
  if (letters.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center text-gray-500">
        No letters yet. Generate your first letter using the form on the left.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {letters.map((letter) => {
        const config = statusConfig[letter.status]
        return (
          <div
            key={letter.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {letter.form_data.subject}
                </h3>
                <p className="text-sm text-gray-600">
                  From: {letter.form_data.sender_name} → To: {letter.form_data.recipient_name}
                </p>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${config.textColor} ${config.bgColor}`}
              >
                {config.label}
              </span>
            </div>

            {/* Status Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                {Object.entries(statusConfig).map(([key, value], index) => {
                  const isActive = Object.keys(statusConfig).indexOf(letter.status) >= index
                  return (
                    <div key={key} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? value.color : 'bg-gray-300'
                        } text-white text-xs font-bold transition-colors`}
                      >
                        {index + 1}
                      </div>
                      <span className="text-xs text-gray-600 mt-1 text-center hidden sm:block">
                        {value.label.split(' ')[0]}
                      </span>
                    </div>
                  )
                })}
              </div>
              <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`absolute top-0 left-0 h-full ${config.color} transition-all duration-500`}
                  style={{
                    width: `${
                      ((Object.keys(statusConfig).indexOf(letter.status) + 1) /
                        Object.keys(statusConfig).length) *
                      100
                    }%`,
                  }}
                />
              </div>
            </div>

            <div className="text-sm text-gray-500 mb-3">
              Created: {new Date(letter.created_at).toLocaleDateString()} at{' '}
              {new Date(letter.created_at).toLocaleTimeString()}
            </div>

            {letter.generated_content && (
              <details className="mt-3">
                <summary className="cursor-pointer text-indigo-600 hover:text-indigo-700 font-medium text-sm">
                  View Letter Content
                </summary>
                <div className="mt-3 p-4 bg-gray-50 rounded border border-gray-200 text-sm whitespace-pre-wrap">
                  {letter.generated_content}
                </div>
              </details>
            )}
          </div>
        )
      })}
    </div>
  )
}

