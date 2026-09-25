const capabilities = [
  {
    title: 'Structured Preparation',
    description: 'Follow a focused path across the core placement areas.',
  },
  {
    title: 'Multiple Practice Areas',
    description: 'Practice DSA, aptitude, Core CS and interview preparation.',
  },
  {
    title: 'Mock Test System',
    description: 'Test your preparation with timed placement-style assessments.',
  },
  {
    title: 'Personalized Progress',
    description: 'Track your performance and identify areas that need improvement.',
  },
]

function QuickStats() {
  return (
    <section className="border-b border-slate-100 bg-white" aria-label="Platform capabilities">
      <div className="mx-auto grid max-w-7xl grid-cols-1 px-5 py-6 sm:grid-cols-2 sm:px-8 sm:py-8 lg:grid-cols-4 lg:px-10 lg:py-9">
        {capabilities.map((capability, index) => (
          <article
            key={capability.title}
            className={`motion-safe:animate-[hero-rise_300ms_ease-out_both] px-0 py-4 sm:px-5 sm:py-2 lg:px-6 ${
              index > 0 ? 'border-t border-slate-200 sm:border-t-0 sm:border-l' : ''
            }`}
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary-700" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-semibold text-slate-900">{capability.title}</h2>
                <p className="mt-1.5 max-w-xs text-sm leading-6 text-slate-500">{capability.description}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default QuickStats
