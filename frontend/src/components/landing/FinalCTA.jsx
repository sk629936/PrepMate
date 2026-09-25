function FinalCTA() {
  return (
    <section id="get-started" className="border-b border-slate-100 bg-primary-50/45" aria-labelledby="final-cta-heading">
      <div className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 sm:py-20 lg:py-24">
        <div className="motion-safe:animate-[hero-rise_300ms_ease-out_both]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">START PREPARING</p>
          <h2 id="final-cta-heading" className="mt-4 text-3xl font-semibold leading-tight tracking-[-0.025em] text-slate-950 sm:text-4xl">
            Ready to start your preparation?
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
            Build consistency. Track your progress. Prepare with purpose.
          </p>
          <a
            href="#top"
            className="btn-primary mt-8"
          >
            Start Preparing
          </a>
        </div>
      </div>
    </section>
  )
}

export default FinalCTA
