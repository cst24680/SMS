function Home({ setView }) {
  return (
    <section id="home" className="hero-shell px-6 py-20 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="hero-badge">Trusted by 500+ students</span>
          <h1 className="mt-4 text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">
            Find your next study partner with confidence.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-emerald-50/90">
            Meet local learners, build accountability, and turn your study sessions into focused, successful milestones.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <button onClick={() => setView('signup')} className="btn btn-primary">Get Started</button>
            <button onClick={() => setView('login')} className="btn btn-secondary">Log In</button>
          </div>
        </div>

        <div className="hero-card rounded-3xl p-6 shadow-2xl sm:p-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">Live match preview</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">Ready for your next session?</h2>
            </div>
            <div className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">New</div>
          </div>
          <div className="mt-6 space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Ava • Mathematics</p>
                  <p className="text-sm text-slate-500">Online • Exam prep</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">Match</span>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-900">Noah • Programming</p>
                  <p className="text-sm text-slate-500">Offline • Project sprint</p>
                </div>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">Match</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
