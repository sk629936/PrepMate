const QUESTION_COUNTS = [5, 10, 15, 20]

export function QuestionCountSelector({ selectedCount, onSelect }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Questions
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUESTION_COUNTS.map((count) => {
          const isSelected = Number(selectedCount) === count

          return (
            <button
              key={count}
              type="button"
              onClick={() => onSelect(count)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1 active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {count}
            </button>
          )
        })}
      </div>

      <p className="text-2xs text-slate-500 pt-0.5">
        Choose the interview length.
      </p>
    </div>
  )
}

export default QuestionCountSelector
