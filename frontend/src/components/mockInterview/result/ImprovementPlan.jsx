/**
 * ImprovementPlan
 * Derives concise, actionable recommendations from:
 *   - weakTopics (backend-returned array)
 *   - answers where pointsMissed is non-empty
 * Never fabricates generic advice beyond what the data supports.
 */

function buildRecommendations(weakTopics, answers) {
  const items = []

  // 1. Topic-level advice from weakTopics
  if (Array.isArray(weakTopics) && weakTopics.length > 0) {
    weakTopics.forEach((topic) => {
      items.push({
        id: `topic-${topic}`,
        label: topic,
        text: `Revise core concepts in "${topic}" — your answers on this topic scored below 70%.`,
      })
    })
  }

  // 2. Missed criteria from individual answers
  const missedCriteriaMap = {}
  if (Array.isArray(answers)) {
    answers.forEach((a) => {
      const missed = a.evaluationResult?.pointsMissed
      if (Array.isArray(missed) && missed.length > 0) {
        const topic = a.topic || 'General'
        if (!missedCriteriaMap[topic]) {
          missedCriteriaMap[topic] = new Set()
        }
        missed.forEach((pt) => missedCriteriaMap[topic].add(pt))
      }
    })
  }

  for (const [topic, pts] of Object.entries(missedCriteriaMap)) {
    // Only add if not already covered by weakTopics
    if (!items.find((i) => i.label === topic)) {
      const list = Array.from(pts).slice(0, 3).join('; ')
      items.push({
        id: `criteria-${topic}`,
        label: topic,
        text: `In "${topic}", focus on covering: ${list}${pts.size > 3 ? ', and more.' : '.'}`,
      })
    }
  }

  return items
}

export function ImprovementPlan({ weakTopics, answers }) {
  const recommendations = buildRecommendations(weakTopics, answers)

  if (recommendations.length === 0) {
    // No weak areas identified
    const allStrong = Array.isArray(weakTopics) && weakTopics.length === 0
    if (!allStrong) return null

    return (
      <section aria-labelledby="improvement-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-3">
        <h2 id="improvement-heading" className="text-sm font-bold text-slate-950">
          Improvement Plan
        </h2>
        <p className="text-xs text-slate-600 leading-relaxed">
          Excellent performance across all topics! Keep practicing to maintain consistency and aim for higher depth in answers.
        </p>
      </section>
    )
  }

  return (
    <section aria-labelledby="improvement-heading" className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="space-y-0.5">
        <h2 id="improvement-heading" className="text-sm font-bold text-slate-950">
          Improvement Plan
        </h2>
        <p className="text-2xs text-slate-500 font-medium">
          Based on your evaluation results — focus areas to improve your next interview score.
        </p>
      </div>

      <ol className="space-y-2.5" role="list">
        {recommendations.map((rec, i) => (
          <li key={rec.id} className="flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50 px-3.5 py-3">
            <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-slate-200 text-2xs font-bold text-slate-700 mt-0.5">
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 mb-0.5">{rec.label}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{rec.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3">
        <p className="text-2xs text-slate-600 leading-relaxed">
          <span className="font-bold text-slate-800">General tip:</span> For each weak topic, write a
          structured answer covering definition, examples, trade-offs, and real-world applications.
          Practice under timed conditions to improve response depth and speed.
        </p>
      </div>
    </section>
  )
}

export default ImprovementPlan
