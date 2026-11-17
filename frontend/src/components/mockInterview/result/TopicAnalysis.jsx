/**
 * TopicAnalysis
 * Shows topic-wise performance from topicStats, strongTopics, and weakTopics.
 * All values sourced directly from the backend result — never calculated on the frontend.
 */
import { useState } from 'react'

function MiniBar({ value }) {
  const pct = Math.min(Math.max(Number(value) || 0, 0), 100)
  return (
    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-400 ease-out"
        style={{
          width: `${pct}%`,
          backgroundColor: pct >= 70 ? '#0f172a' : '#94a3b8',
        }}
      />
    </div>
  )
}

export function TopicAnalysis({ topicStats, strongTopics, weakTopics }) {
  const [showAll, setShowAll] = useState(false)

  // Normalize topicStats — backend returns a Map serialized as an object
  let topicEntries = []
  if (topicStats) {
    if (typeof topicStats === 'object' && !(topicStats instanceof Map)) {
      topicEntries = Object.entries(topicStats)
    } else if (topicStats instanceof Map) {
      topicEntries = Array.from(topicStats.entries())
    }
    topicEntries = topicEntries.filter(([, v]) => v && v.total > 0)
    topicEntries.sort((a, b) => (b[1].percentage ?? 0) - (a[1].percentage ?? 0))
  }

  const safeStrong = Array.isArray(strongTopics) ? strongTopics : []
  const safeWeak = Array.isArray(weakTopics) ? weakTopics : []

  if (topicEntries.length === 0 && safeStrong.length === 0 && safeWeak.length === 0) return null

  const displayed = showAll ? topicEntries : topicEntries.slice(0, 6)

  return (
    <section aria-labelledby="topic-analysis-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <h2 id="topic-analysis-heading" className="text-sm font-bold text-slate-950">
        Topic Analysis
      </h2>

      {/* Strong / Weak topic chips */}
      {(safeStrong.length > 0 || safeWeak.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {safeStrong.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-700">
                Strong Topics
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {safeStrong.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-950 px-2.5 py-0.5 text-2xs font-semibold text-white"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
          {safeWeak.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 space-y-2">
              <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                Needs Improvement
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {safeWeak.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2.5 py-0.5 text-2xs font-semibold text-slate-700"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Topic breakdown table */}
      {topicEntries.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="text-2xs font-bold uppercase tracking-wider text-slate-500">
            All Topics
          </h3>
          <div className="space-y-2">
            {displayed.map(([topic, stats]) => {
              const pct = stats.percentage ?? 0
              return (
                <div key={topic} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-800 truncate max-w-[60%]">{topic}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-2xs text-slate-500 font-medium">
                        {stats.answered ?? 0}/{stats.total ?? 0}
                      </span>
                      <span className="text-xs font-bold tabular-nums text-slate-950 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                  <MiniBar value={pct} />
                </div>
              )
            })}
          </div>

          {topicEntries.length > 6 && (
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="text-2xs font-semibold text-slate-600 underline hover:text-slate-950 transition-colors focus:outline-none cursor-pointer"
            >
              {showAll ? 'Show less' : `Show ${topicEntries.length - 6} more topics`}
            </button>
          )}
        </div>
      )}
    </section>
  )
}

export default TopicAnalysis
