export function InterviewHistoryPreview({ history, isLoading }) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-950 mb-2">
          Previous Attempts
        </h2>
        <div className="py-4 text-center text-2xs text-slate-500 animate-pulse">
          Loading past interview history...
        </div>
      </section>
    )
  }

  if (!history || history.length === 0) {
    return (
      <section className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-5 text-center space-y-2 transition-colors">
        <h2 className="text-xs font-bold text-slate-900">
          No Past Interviews Yet
        </h2>
        <p className="text-2xs text-slate-500 max-w-sm mx-auto leading-relaxed">
          Select your configuration above and click &ldquo;Start Interview&rdquo; to begin your first round.
        </p>
        <div className="pt-1 flex items-center justify-center gap-3 text-2xs font-semibold">
          <a
            href="/mock-interview/history"
            className="text-slate-600 hover:text-slate-950 transition-colors"
          >
            History
          </a>
          <span className="text-slate-300">·</span>
          <a
            href="/mock-interview/progress"
            className="text-slate-600 hover:text-slate-950 transition-colors"
          >
            Progress Dashboard
          </a>
        </div>
      </section>
    )
  }

  return (
    <section aria-labelledby="history-heading" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 id="history-heading" className="text-sm font-bold text-slate-950">
            Previous Attempts
          </h2>
          <p className="text-2xs text-slate-500 mt-0.5">
            Your recent mock interview logs and quick performance summaries.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="/mock-interview/history"
            className="rounded border border-slate-200 bg-white px-2 py-1 text-2xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
          >
            View All ({history.length})
          </a>
          <a
            href="/mock-interview/progress"
            className="rounded border border-slate-200 bg-white px-2 py-1 text-2xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-950 transition-colors"
          >
            Progress
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700 whitespace-nowrap">
          <thead className="border-b border-slate-200 bg-slate-50 text-2xs font-semibold uppercase text-slate-500 tracking-wider">
            <tr>
              <th className="py-2 px-2.5">Track</th>
              <th className="py-2 px-2.5">Difficulty</th>
              <th className="py-2 px-2.5">Questions</th>
              <th className="py-2 px-2.5 text-center">Score</th>
              <th className="py-2 px-2.5">Status</th>
              <th className="py-2 px-2.5">Date</th>
              <th className="py-2 px-2.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-xs">
            {history.slice(0, 5).map((session) => {
              const sessionId = session._id || session.id
              const dateStr = new Date(session.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })

              const isCompleted = session.status === 'completed'

              return (
                <tr key={sessionId} className="hover:bg-slate-50 transition-colors duration-150">
                  <td className="py-2.5 px-2.5 font-bold text-slate-900 capitalize text-xs">
                    {session.interviewType}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span className="rounded bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-2xs font-medium text-slate-700">
                      {session.difficulty}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-2xs sm:text-xs text-slate-600">
                    {session.answeredQuestions || 0} / {session.totalQuestions || session.questionCount}
                  </td>
                  <td className="py-2.5 px-2.5 text-center">
                    {isCompleted ? (
                      <span className="font-bold text-slate-950 text-xs">
                        {session.percentage}%
                      </span>
                    ) : (
                      <span className="text-slate-400 text-2xs">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-2.5">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-2xs font-semibold capitalize ${
                        isCompleted
                          ? 'bg-slate-950 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-white' : 'bg-slate-400'}`} />
                      {session.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 px-2.5 text-2xs text-slate-500">
                    {dateStr}
                  </td>
                  <td className="py-2.5 px-2.5 text-right">
                    {isCompleted ? (
                      <a
                        href={`/mock-interview/session/${sessionId}/result`}
                        className="rounded border border-slate-200 bg-white px-2 py-0.5 text-2xs font-semibold text-slate-800 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                      >
                        Result
                      </a>
                    ) : (
                      <span className="text-slate-400 text-2xs">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
        <a
          href="/mock-interview/history"
          className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:text-slate-700 transition-colors"
        >
          View Full History ({history.length})
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </a>
        <a
          href="/mock-interview/progress"
          className="inline-flex items-center gap-1 font-medium text-slate-600 hover:text-slate-950 transition-colors"
        >
          Progress Dashboard
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </a>
      </div>
    </section>
  )
}

export default InterviewHistoryPreview
