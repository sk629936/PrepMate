/**
 * ResultSummary
 * Displays the top-level result: percentage, score/maxScore, answered/unanswered, duration, completion date.
 */

function formatDuration(seconds) {
  if (!seconds || seconds <= 0) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

function formatDate(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getScoreBand(pct) {
  if (pct >= 85) return { label: 'Excellent', cls: 'bg-slate-950 text-white' }
  if (pct >= 70) return { label: 'Good', cls: 'bg-slate-800 text-white' }
  if (pct >= 50) return { label: 'Average', cls: 'bg-slate-200 text-slate-900' }
  return { label: 'Needs Work', cls: 'bg-slate-100 text-slate-700' }
}

export function ResultSummary({ result }) {
  const pct = result?.percentage ?? 0
  const band = getScoreBand(pct)

  const statItems = [
    { label: 'Score', value: `${result?.score ?? 0} / ${result?.maxScore ?? 0}` },
    { label: 'Answered', value: `${result?.answeredQuestions ?? 0} / ${result?.totalQuestions ?? 0}` },
    { label: 'Unanswered', value: result?.unansweredQuestions ?? 0 },
    { label: 'Duration', value: formatDuration(result?.duration) },
  ]

  return (
    <section aria-labelledby="result-summary-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5">
      {/* Header row */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="space-y-0.5">
          <h2 id="result-summary-heading" className="text-base font-bold text-slate-950">
            Overall Result
          </h2>
          {result?.submittedAt && (
            <p className="text-2xs text-slate-500 font-medium">
              Submitted {formatDate(result.submittedAt)}
            </p>
          )}
        </div>
        <span className={`self-start inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${band.cls}`}>
          {band.label}
        </span>
      </div>

      {/* Big percentage */}
      <div className="flex items-end gap-3">
        <span className="text-5xl sm:text-6xl font-black tabular-nums text-slate-950 leading-none">
          {pct}
        </span>
        <span className="text-xl font-bold text-slate-500 leading-none mb-1">%</span>
      </div>

      {/* Progress bar */}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall score: ${pct}%`}
        className="h-2 w-full rounded-full bg-slate-100 overflow-hidden"
      >
        <div
          className="h-full bg-slate-950 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>

      {/* Stats grid */}
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div key={item.label} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 space-y-0.5">
            <dt className="text-2xs font-semibold uppercase tracking-wider text-slate-500">{item.label}</dt>
            <dd className="text-sm font-bold text-slate-950">{item.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

export default ResultSummary
