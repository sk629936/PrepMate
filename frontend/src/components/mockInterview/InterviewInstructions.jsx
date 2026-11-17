export function InterviewInstructions() {
  return (
    <section
      aria-labelledby="instructions-heading"
      className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 sm:p-4.5 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h2 id="instructions-heading" className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          Interview Guidelines &amp; Evaluation
        </h2>
        <span className="rounded bg-white border border-slate-200 px-1.5 py-0.5 text-2xs font-semibold text-slate-700">
          Placement Rubric
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
        <div className="rounded-lg border border-slate-200/90 bg-white p-3 space-y-1 shadow-2xs hover:border-slate-300 transition-colors duration-150">
          <div className="font-bold text-slate-950 flex items-center gap-1.5 text-xs">
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-100 text-2xs font-bold text-slate-800">
              1
            </span>
            Technical Answers
          </div>
          <p className="text-2xs sm:text-xs text-slate-600 leading-relaxed">
            Cover key principles, trade-offs, internal mechanics, and practical implementations.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200/90 bg-white p-3 space-y-1 shadow-2xs hover:border-slate-300 transition-colors duration-150">
          <div className="font-bold text-slate-950 flex items-center gap-1.5 text-xs">
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-100 text-2xs font-bold text-slate-800">
              2
            </span>
            Behavioral / HR
          </div>
          <p className="text-2xs sm:text-xs text-slate-600 leading-relaxed">
            Use the <strong>STAR Method</strong> (Situation, Task, Action, Result) for structured responses.
          </p>
        </div>

        <div className="rounded-lg border border-slate-200/90 bg-white p-3 space-y-1 shadow-2xs hover:border-slate-300 transition-colors duration-150">
          <div className="font-bold text-slate-950 flex items-center gap-1.5 text-xs">
            <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-slate-100 text-2xs font-bold text-slate-800">
              3
            </span>
            Objective Scoring
          </div>
          <p className="text-2xs sm:text-xs text-slate-600 leading-relaxed">
            Answers are objectively evaluated against rubric criteria, key terms, and depth.
          </p>
        </div>
      </div>
    </section>
  )
}

export default InterviewInstructions
