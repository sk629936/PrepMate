const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed']

export function DifficultySelector({ selectedDifficulty, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Difficulty
      </label>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {DIFFICULTIES.map((diff) => {
          const isSelected = selectedDifficulty === diff

          return (
            <button
              key={diff}
              type="button"
              onClick={() => onSelect(diff)}
              className={`py-2 px-3 rounded-lg text-xs font-semibold border text-center transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1 active:scale-[0.98] cursor-pointer ${
                isSelected
                  ? 'bg-slate-950 text-white border-slate-950 shadow-2xs'
                  : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              {diff}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default DifficultySelector
