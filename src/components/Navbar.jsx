function Navbar({ currentUser, onLogout, setView }) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">
        <button onClick={() => setView('home')} className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-lg font-bold text-white shadow-lg">S</div>
          <div className="text-left">
            <p className="text-lg font-semibold text-slate-900">StudyBuddy</p>
            <p className="text-xs text-slate-500">Nearby learning community</p>
          </div>
        </button>
        <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
          {!currentUser ? (
            <>
              <button onClick={() => setView('login')} className="rounded-full px-4 py-2 hover:bg-slate-100">Log In</button>
              <button onClick={() => setView('signup')} className="rounded-full bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Sign Up</button>
            </>
          ) : (
            <>
              <button onClick={() => setView('dashboard')} className="rounded-full px-4 py-2 hover:bg-slate-100">Dashboard</button>
              <button onClick={onLogout} className="rounded-full border border-slate-200 px-4 py-2 hover:bg-slate-100">Logout</button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
