const progressItems = [
  { label: 'DSA', value: 72, color: 'bg-primary-700' },
  { label: 'Aptitude', value: 58, color: 'bg-slate-700' },
  { label: 'Core CS', value: 46, color: 'bg-slate-400' },
]

const summaryItems = [
  { label: 'Questions solved', value: '128' },
  { label: 'Mock tests', value: '08' },
  { label: 'Average score', value: '76%' },
]

function ProgressBar({ label, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
        <span>{label}</span>
        <span className="text-slate-900">{value}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_20px_55px_-28px_rgba(15,23,42,0.45)]">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary-700 text-xs font-bold text-white">P</span>
          <span className="text-sm font-semibold text-slate-900">Student overview</span>
        </div>
        <span className="rounded-full bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Preview</span>
      </div>

      <div className="space-y-4 bg-slate-50/70 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="col-span-2 rounded-lg border border-slate-200 bg-white p-3 sm:col-span-1">
            <p className="text-[11px] font-medium text-slate-500">Overall progress</p>
            <div className="mt-2 flex items-end gap-1.5">
              <span className="text-2xl font-semibold tracking-tight text-slate-950">64%</span>
              <span className="mb-1 text-[10px] font-medium text-primary-700">on track</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-[64%] rounded-full bg-primary-700" />
            </div>
          </div>
          {summaryItems.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[11px] font-medium leading-tight text-slate-500">{item.label}</p>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Preparation areas</h3>
              <span className="text-[11px] text-slate-400">This month</span>
            </div>
            <div className="space-y-4">
              {progressItems.map((item) => (
                <ProgressBar key={item.label} {...item} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Next focus</h3>
              <span className="text-xs text-primary-700">Today</span>
            </div>
            <div className="mt-4 rounded-md border border-primary-100 bg-primary-50/60 p-3">
              <p className="text-xs font-semibold text-slate-900">Arrays &amp; hashing</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Complete 5 practice questions to keep your streak.</p>
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-semibold text-primary-700">
                <span className="h-1.5 w-1.5 rounded-full bg-primary-700" />
                Recommended next
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="overflow-hidden border-b border-slate-100" aria-labelledby="hero-heading">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-16 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-24">
        <div className="motion-safe:animate-[hero-rise_300ms_ease-out_both]">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">PLACEMENT PREPARATION PLATFORM</p>
          <h1 id="hero-heading" className="max-w-xl text-4xl font-semibold leading-[1.08] tracking-[-0.03em] text-slate-950 sm:text-5xl lg:text-6xl">
            Prepare smarter.
            <span className="block text-slate-700">Get placement ready.</span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Practice DSA, aptitude and core CS, take mock tests, analyze your resume and track your preparation—all in one place.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="#get-started"
              className="btn-primary"
            >
              Start Preparing
            </a>
            <a
              href="#features"
              className="btn-secondary"
            >
              Explore Platform
            </a>
          </div>
        </div>

        <div className="motion-safe:animate-[hero-rise_300ms_120ms_ease-out_both]">
          <DashboardPreview />
          <p className="mt-3 text-center text-[11px] text-slate-400">Illustrative preview data for the PrepMate student experience.</p>
        </div>
      </div>
    </section>
  )
}

export default Hero
