const metrics = [
  { label: 'Overall progress', value: '64%', detail: 'Steady progress' },
  { label: 'Questions solved', value: '128', detail: 'Practice activity' },
  { label: 'Mock tests', value: '08', detail: 'Completed attempts' },
  { label: 'Average score', value: '76%', detail: 'Recent attempts' },
]

const subjects = [
  { name: 'DSA', value: 68, color: 'bg-primary-700' },
  { name: 'Aptitude', value: 54, color: 'bg-slate-700' },
  { name: 'Core CS', value: 72, color: 'bg-slate-400' },
]

const activity = [
  { day: 'Mon', value: 45 },
  { day: 'Tue', value: 70 },
  { day: 'Wed', value: 35 },
  { day: 'Thu', value: 82 },
  { day: 'Fri', value: 58 },
  { day: 'Sat', value: 66 },
  { day: 'Sun', value: 22 },
]

function PreviewMetric({ label, value, detail }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-3 sm:p-4">
      <p className="truncate text-[11px] font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] text-slate-400">{detail}</p>
    </div>
  )
}

function SubjectProgress({ name, value, color }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-medium">
        <span className="text-slate-700">{name}</span>
        <span className="text-slate-950">{value}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${name} demo progress`}
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={value}
      >
        <div className={`h-full rounded-full motion-safe:animate-[progress-fill_400ms_ease-out_both] ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  )
}

function ActivityChart() {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-950">Weekly activity</h3>
          <p className="mt-1 text-xs text-slate-500">Practice sessions this week</p>
        </div>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] font-medium text-slate-500">Demo</span>
      </div>
      <div className="mt-5 flex h-28 items-end justify-between gap-2" aria-label="Demo weekly activity chart">
        {activity.map((item) => (
          <div key={item.day} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full items-end" title={`${item.day}: ${item.value}% activity`}>
              <div className="w-3 rounded-t-sm bg-primary-200 motion-safe:animate-[progress-fill_400ms_ease-out_both] sm:w-4" style={{ height: `${item.value}%` }} />
            </div>
            <span className="text-[10px] text-slate-400">{item.day}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecommendedNext() {
  return (
    <div className="rounded-md border border-primary-100 bg-primary-50/60 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-950">Recommended next</h3>
        <span className="h-2 w-2 rounded-full bg-primary-700" aria-hidden="true" />
      </div>
      <p className="mt-4 text-base font-semibold text-slate-900">Practice Linked List</p>
      <p className="mt-1.5 text-sm leading-6 text-slate-600">Based on your recent preparation activity.</p>
      <button
        type="button"
        className="btn-primary mt-4 min-h-10 px-4 text-xs"
      >
        Continue Practice
      </button>
    </div>
  )
}

function DashboardPreview() {
  return (
    <section id="dashboard-preview" className="border-b border-slate-100 bg-white" aria-labelledby="dashboard-preview-heading">
      <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">YOUR PREPARATION, AT A GLANCE</p>
          <h2 id="dashboard-preview-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            Know where you stand. Know what to do next.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Keep your preparation organized with a clear view of your progress, practice activity and performance.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-[0_20px_55px_-30px_rgba(15,23,42,0.42)] motion-safe:animate-[hero-rise_300ms_ease-out_both] lg:mt-14">
          <div className="flex flex-col gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <p className="text-base font-semibold text-slate-950">Good morning, Alex</p>
              <p className="mt-1 text-xs text-slate-500">Here&apos;s a quick look at your preparation.</p>
            </div>
            <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">Demo Student · Demo Preview</span>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metrics.map((metric) => (
                <PreviewMetric key={metric.label} {...metric} />
              ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-md border border-slate-200 bg-white p-4 sm:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950">Subject progress</h3>
                    <p className="mt-1 text-xs text-slate-500">Demo values for the student view</p>
                  </div>
                  <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">Areas</span>
                </div>
                <div className="mt-6 space-y-5">
                  {subjects.map((subject) => (
                    <SubjectProgress key={subject.name} {...subject} />
                  ))}
                </div>
              </div>

              <ActivityChart />
            </div>

            <RecommendedNext />
          </div>
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400">Illustrative interface only. Values shown are sample data, not live student activity.</p>
      </div>
    </section>
  )
}

export default DashboardPreview
