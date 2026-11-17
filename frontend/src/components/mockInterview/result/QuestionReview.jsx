/**
 * QuestionReview
 * Renders each answer item from result.answers[]:
 *   questionText, type, topic, difficulty, userAnswer, score, evaluationResult
 *
 * Shows evaluationResult.feedback, pointsCovered, pointsMissed.
 * Does NOT display expectedAnswer (backend includes it in result, but we deliberately omit it
 * to keep focus on evaluation feedback rather than showing the model answer).
 */
import { useState } from 'react'

function ScorePill({ score }) {
  const s = Number(score) || 0
  let cls
  if (s >= 85) cls = 'bg-slate-950 text-white'
  else if (s >= 70) cls = 'bg-slate-700 text-white'
  else if (s >= 50) cls = 'bg-slate-200 text-slate-800'
  else cls = 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-2xs font-bold tabular-nums ${cls}`}>
      {s}/100
    </span>
  )
}

function QuestionCard({ item, index }) {
  const [expanded, setExpanded] = useState(false)

  const evalResult = item.evaluationResult || {}
  const hasFeedback = Boolean(evalResult.feedback)
  const pointsCovered = Array.isArray(evalResult.pointsCovered) ? evalResult.pointsCovered : []
  const pointsMissed = Array.isArray(evalResult.pointsMissed) ? evalResult.pointsMissed : []
  const hasEvalDetail = pointsCovered.length > 0 || pointsMissed.length > 0

  return (
    <article className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-slate-50 transition-colors duration-150 focus:outline-none cursor-pointer"
      >
        <div className="flex items-start gap-3 min-w-0">
          <span className="shrink-0 flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-2xs font-bold text-slate-700 mt-0.5">
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-semibold text-slate-950 leading-snug line-clamp-2 text-left">
              {item.questionText || '—'}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {item.type && (
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-2xs font-semibold uppercase tracking-wider text-slate-600">
                  {item.type}
                </span>
              )}
              {item.topic && (
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-2xs font-medium text-slate-600">
                  {item.topic}
                </span>
              )}
              {item.difficulty && (
                <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-2xs font-medium text-slate-600">
                  {item.difficulty}
                </span>
              )}
              {!item.isAnswered && (
                <span className="text-2xs font-semibold text-slate-400">Unanswered</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ScorePill score={item.score} />
          <svg
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          {/* User answer */}
          <div className="space-y-1">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-500">Your Answer</h4>
            {item.userAnswer && item.userAnswer.trim() ? (
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap rounded-lg bg-slate-50 border border-slate-100 p-3">
                {item.userAnswer}
              </p>
            ) : (
              <p className="text-xs text-slate-400 italic">No answer was provided.</p>
            )}
          </div>

          {/* Evaluation feedback */}
          {hasFeedback && (
            <div className="space-y-1">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-500">Feedback</h4>
              <p className="text-xs text-slate-700 leading-relaxed">{evalResult.feedback}</p>
            </div>
          )}

          {/* Points covered */}
          {pointsCovered.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-500">Criteria Met</h4>
              <ul className="space-y-1">
                {pointsCovered.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                    <svg className="w-3.5 h-3.5 text-slate-950 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Points missed */}
          {pointsMissed.length > 0 && (
            <div className="space-y-1.5">
              <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-500">Criteria Missed</h4>
              <ul className="space-y-1">
                {pointsMissed.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <svg className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Keyword match rate if available */}
          {typeof evalResult.keywordMatchRate === 'number' && (
            <p className="text-2xs text-slate-500 font-medium">
              Keyword match rate: {evalResult.keywordMatchRate}%
            </p>
          )}

          {!hasFeedback && !hasEvalDetail && (
            <p className="text-xs text-slate-400 italic">No evaluation detail available for this question.</p>
          )}
        </div>
      )}
    </article>
  )
}

export function QuestionReview({ answers }) {
  const [showAll, setShowAll] = useState(false)

  if (!Array.isArray(answers) || answers.length === 0) return null

  const displayed = showAll ? answers : answers.slice(0, 5)

  return (
    <section aria-labelledby="question-review-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 id="question-review-heading" className="text-sm font-bold text-slate-950">
          Question Review
        </h2>
        <span className="text-2xs font-medium text-slate-500">
          {answers.length} question{answers.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-2">
        {displayed.map((item, i) => (
          <QuestionCard key={item.question || i} item={item} index={i} />
        ))}
      </div>

      {answers.length > 5 && (
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="w-full rounded-xl border border-dashed border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-950 transition-colors duration-150 focus:outline-none cursor-pointer"
        >
          {showAll ? 'Show fewer questions' : `Show all ${answers.length} questions`}
        </button>
      )}
    </section>
  )
}

export default QuestionReview
