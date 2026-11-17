const INTERVIEW_TYPES = [
  {
    id: 'technical',
    title: 'Technical',
    description: 'Programming, Web Development, DBMS, OS, CN and OOP.',
  },
  {
    id: 'hr',
    title: 'HR',
    description: 'Behavioral, communication, teamwork and career questions.',
  },
  {
    id: 'mixed',
    title: 'Mixed',
    description: 'Technical + HR in one interview.',
  },
]

export function InterviewTypeSelector({ selectedType, onSelect }) {
  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
        Interview Type
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {INTERVIEW_TYPES.map((type) => {
          const isSelected = selectedType === type.id

          return (
            <button
              key={type.id}
              type="button"
              onClick={() => onSelect(type.id)}
              className={`group relative text-left p-3 rounded-lg border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-1 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-slate-950 bg-slate-50/80 shadow-2xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/40'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-slate-950">
                  {type.title}
                </span>

                <div
                  className={`h-3.5 w-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors duration-150 ${
                    isSelected
                      ? 'border-slate-950 bg-slate-950'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>

              <p className="text-2xs text-slate-600 leading-normal">
                {type.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default InterviewTypeSelector
