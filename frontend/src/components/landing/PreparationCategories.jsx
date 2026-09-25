const categories = [
  {
    title: 'DSA',
    description: 'Strengthen problem-solving skills with structured practice across essential data structures and algorithms.',
    action: 'Explore DSA',
    accent: 'bg-primary-700',
  },
  {
    title: 'Aptitude',
    description: 'Practice quantitative, logical reasoning and verbal ability for placement assessments.',
    action: 'Explore Aptitude',
    accent: 'bg-slate-700',
  },
  {
    title: 'Core CS',
    description: 'Revise DBMS, Operating Systems, Computer Networks, OOP and other essential CS concepts.',
    action: 'Explore Core CS',
    accent: 'bg-slate-500',
  },
  {
    title: 'Interview',
    description: 'Prepare for technical and behavioral interviews with focused practice and feedback.',
    action: 'Explore Interview',
    accent: 'bg-slate-400',
  },
]

function CategoryMark({ accent }) {
  return (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50" aria-hidden="true">
      <span className={`h-4 w-4 rounded-sm ${accent}`} />
    </span>
  )
}

function PreparationCategories() {
  return (
    <section id="preparation" className="border-b border-slate-100 bg-slate-50/45" aria-labelledby="preparation-categories-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">PREPARE YOUR WAY</p>
          <h2 id="preparation-categories-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            Focus on what your placement needs
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Build strong fundamentals across the areas that matter most in technical and placement assessments.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {categories.map((category, index) => (
            <article
              key={category.title}
              className="motion-safe:animate-[hero-rise_300ms_ease-out_both] rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md sm:p-6"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <CategoryMark accent={category.accent} />
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{category.title}</h3>
              <p className="mt-2 min-h-[96px] text-sm leading-6 text-slate-600">{category.description}</p>
              <button
                type="button"
                className="btn-secondary mt-5 min-h-10 px-3.5"
                aria-label={`${category.action} (preview only)`}
                title="Destination available in a future module"
              >
                {category.action}
                <span className="ml-2 text-primary-700" aria-hidden="true">-&gt;</span>
              </button>
              <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">Preview only</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PreparationCategories
