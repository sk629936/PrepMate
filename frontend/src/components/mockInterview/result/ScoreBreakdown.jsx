/**
 * ScoreBreakdown
 * Shows technicalScore and hrScore breakdowns, plus difficultyStats when available.
 * All data sourced from the actual API response — no fabricated values.
 */

function MiniBar({ value }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full bg-slate-800 rounded-full transition-all duration-400 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

function TrackCard({ label, stats }) {
  if (!stats || (!stats.total && stats.total !== 0)) return null
  if (stats.total === 0) return null

  const pct = stats.percentage ?? 0
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-3.5 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-950">{label}</span>
        <span className="text-xs font-black tabular-nums text-slate-950">{pct}%</span>
      </div>
      <MiniBar value={pct} />
      <dl className="grid grid-cols-3 gap-1">
        {[
          { k: 'Qs', v: stats.total },
          { k: 'Answered', v: stats.answered },
          { k: 'Score', v: `${stats.score ?? 0}/${stats.maxScore ?? 0}` },
        ].map(({ k, v }) => (
          <div key={k}>
            <dt className="text-2xs text-slate-500 font-medium">{k}</dt>
            <dd className="text-2xs font-bold text-slate-800">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function ScoreBreakdown({ technicalScore, hrScore, difficultyStats }) {
  // Normalize difficultyStats — may be a Map serialized as object or plain object
  let diffEntries = []
  if (difficultyStats) {
    if (typeof difficultyStats === 'object' && !(difficultyStats instanceof Map)) {
      diffEntries = Object.entries(difficultyStats)
    } else if (difficultyStats instanceof Map) {
      diffEntries = Array.from(difficultyStats.entries())
    }
    // Filter out empty entries
    diffEntries = diffEntries.filter(([, v]) => v && v.total > 0)
  }

  const hasTech = technicalScore && technicalScore.total > 0
  const hasHR = hrScore && hrScore.total > 0
  const hasDiff = diffEntries.length > 0

  if (!hasTech && !hasHR && !hasDiff) return null

  return (
    <section aria-labelledby="score-breakdown-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <h2 id="score-breakdown-heading" className="text-sm font-bold text-slate-950">
        Performance Breakdown
      </h2>

      {(hasTech || hasHR) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {hasTech && <TrackCard label="Technical" stats={technicalScore} />}
          {hasHR && <TrackCard label="Behavioural / HR" stats={hrScore} />}
        </div>
      )}

      {hasDiff && (
        <div className="space-y-2.5">
          <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500">By Difficulty</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {diffEntries.map(([level, stats]) => (
              <div key={level} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">{level}</span>
                  <span className="text-xs font-bold tabular-nums text-slate-950">{stats.percentage ?? 0}%</span>
                </div>
                <MiniBar value={stats.percentage ?? 0} />
                <p className="text-2xs text-slate-500 font-medium">
                  {stats.answered ?? 0} / {stats.total ?? 0} answered
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

export default ScoreBreakdown
