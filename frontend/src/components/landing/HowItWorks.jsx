const steps = [
  {
    number: '01',
    title: 'Create Profile',
    description: 'Set up your profile, education details and target role so your preparation can stay focused.',
  },
  {
    number: '02',
    title: 'Choose Your Preparation',
    description: 'Pick the areas you want to work on, from DSA and aptitude to Core CS and interviews.',
  },
  {
    number: '03',
    title: 'Practice & Test',
    description: 'Solve questions, take mock tests and build consistency with regular practice.',
  },
  {
    number: '04',
    title: 'Analyze & Improve',
    description: 'Review your performance, identify weak areas and focus your next preparation session.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-b border-slate-100 bg-white" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">HOW IT WORKS</p>
          <h2 id="how-it-works-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            From preparation to placement, one step at a time
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Build your profile, choose what to prepare, practice consistently, and use your results to improve.
          </p>
        </div>

        <div className="relative mt-12 lg:mt-16">
          <div className="pointer-events-none absolute bottom-8 left-8 top-8 w-px bg-slate-200 lg:bottom-auto lg:left-[12.5%] lg:right-[12.5%] lg:top-8 lg:h-px lg:w-auto" aria-hidden="true" />
          <div className="grid gap-8 lg:grid-cols-4 lg:gap-6">
            {steps.map((step, index) => (
              <article
                key={step.number}
                className="relative flex gap-4 motion-safe:animate-[hero-rise_300ms_ease-out_both] lg:block lg:text-center"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <div className="relative z-10 flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-primary-200 bg-white text-sm font-semibold tracking-[0.08em] text-primary-700 shadow-sm lg:mx-auto">
                  {step.number}
                </div>
                <div className="pt-1 lg:pt-6">
                  <h3 className="text-base font-semibold text-slate-950">{step.title}</h3>
                  <p className="mt-2 max-w-xs text-sm leading-6 text-slate-600 lg:mx-auto">{step.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default HowItWorks
