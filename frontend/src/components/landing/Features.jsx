const features = [
  {
    title: 'DSA Practice',
    description: 'Build problem-solving skills with structured DSA practice across important interview topics.',
  },
  {
    title: 'Aptitude',
    description: 'Strengthen quantitative, logical reasoning and verbal ability for placement assessments.',
  },
  {
    title: 'Core CS',
    description: 'Revise DBMS, Operating Systems, Computer Networks, OOP and other essential CS concepts.',
  },
  {
    title: 'Mock Tests',
    description: 'Take timed placement-style tests and understand your performance after every attempt.',
  },
  {
    title: 'AI Interview',
    description: 'Practice role-specific interview questions and receive structured feedback on your answers.',
  },
  {
    title: 'Resume Analyzer',
    description: 'Get practical feedback on your resume, projects, skills and placement relevance.',
  },
  {
    title: 'Skill Gap',
    description: 'Compare your current skills with the requirements of your target role.',
  },
  {
    title: 'Progress Tracking',
    description: 'Track preparation activity, performance, accuracy and areas that need more attention.',
  },
]

function FeatureMark() {
  return (
    <span className="grid h-9 w-9 shrink-0 grid-cols-2 gap-1 rounded-md border border-primary-100 bg-primary-50 p-2" aria-hidden="true">
      <span className="rounded-[2px] bg-primary-700" />
      <span className="rounded-[2px] bg-primary-300" />
      <span className="rounded-[2px] bg-primary-300" />
      <span className="rounded-[2px] bg-primary-700" />
    </span>
  )
}

function Features() {
  return (
    <section id="features" className="border-b border-slate-100 bg-slate-50/45" aria-labelledby="features-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">EVERYTHING YOU NEED</p>
          <h2 id="features-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            One platform for your placement preparation
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Prepare across technical and aptitude areas, practice with realistic tests, and understand where you need to improve.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-14 lg:grid-cols-4">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className="motion-safe:animate-[hero-rise_300ms_ease-out_both] rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-primary-200 hover:shadow-md sm:p-6"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <FeatureMark />
              <h3 className="mt-5 text-base font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Features
