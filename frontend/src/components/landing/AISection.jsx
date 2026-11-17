
const capabilities = [
  {
    title: 'AI Interview',
    description: 'Practice role-specific interview questions and receive structured feedback on your answers.',
    visual: 'interview',
  },
  {
    title: 'Resume Analysis',
    description: 'Get practical feedback on your resume, projects, skills and placement relevance.',
    visual: 'resume',
  },
  {
    title: 'Skill Gap',
    description: 'Compare your current skills with the requirements of your target role and focus on what matters next.',
    visual: 'skills',
  },
]

function CapabilityMark() {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-primary-100 bg-primary-50" aria-hidden="true">
      <span className="h-2.5 w-2.5 rounded-full border-2 border-primary-700" />
    </span>
  )
}

function SampleView({ type }) {
  if (type === 'interview') {
    return (
      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-500">Sample interview review</span>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-500">Demo</span>
        </div>
        <p className="font-medium leading-5 text-slate-800">Explain how you would approach a slow API response.</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border border-emerald-100 bg-emerald-50 px-2.5 py-2">
            <p className="font-semibold text-emerald-800">Strength</p>
            <p className="mt-1 leading-4 text-emerald-700">Clear problem breakdown</p>
          </div>
          <div className="rounded border border-amber-100 bg-amber-50 px-2.5 py-2">
            <p className="font-semibold text-amber-800">Next step</p>
            <p className="mt-1 leading-4 text-amber-700">Add a concrete example</p>
          </div>
        </div>
      </div>
    )
  }

  if (type === 'resume') {
    return (
      <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-500">Sample resume review</span>
          <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-500">Demo</span>
        </div>
        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="h-1.5 w-20 rounded-full bg-slate-300" />
          <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-100" />
          <div className="mt-4 flex items-start gap-2 border-t border-slate-100 pt-3">
            <span className="mt-1 h-2 w-2 rounded-full bg-primary-700" />
            <div>
              <p className="font-semibold text-slate-800">Project descriptions</p>
              <p className="mt-1 leading-4 text-slate-500">Add measurable outcomes where possible.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-slate-500">Sample skill comparison</span>
        <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-slate-500">Demo</span>
      </div>
      <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
        <div className="flex items-center justify-between">
          <span className="text-slate-700">JavaScript</span>
          <span className="font-medium text-emerald-700">Ready</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-700">Testing</span>
          <span className="font-medium text-amber-700">Focus next</span>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <span className="text-slate-700">Docker</span>
          <span className="font-medium text-slate-500">Recommended</span>
        </div>
      </div>
    </div>
  )
}

function AISection() {
  return (
    <section id="ai" className="border-b border-slate-100 bg-slate-50/45" aria-labelledby="ai-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">SMARTER PREPARATION</p>
          <h2 id="ai-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            A smarter way to prepare
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Get personalized insights based on your preparation, skills and goals.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
          {capabilities.map((capability, index) => (
            <article
              key={capability.title}
              className="motion-safe:animate-[hero-rise_300ms_ease-out_both] rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md sm:p-6"
              style={{ animationDelay: `${index * 70}ms` }}
            >
              <div className="flex items-start gap-3">
                <CapabilityMark />
                <div>
                  <h3 className="text-base font-semibold text-slate-950">{capability.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{capability.description}</p>
                </div>
              </div>
              <div className="mt-6">
                <SampleView type={capability.visual} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AISection
