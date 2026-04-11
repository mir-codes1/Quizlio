import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded transition-colors ${
      isActive
        ? 'bg-indigo-600 text-white'
        : 'text-slate-400 hover:text-white hover:bg-slate-700'
    }`;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      <header className="border-b border-slate-700/80 bg-slate-800 shadow-sm">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-3 flex items-center justify-between">
          <NavLink to="/" className="text-base font-bold tracking-tight text-white">
            Quizlio
          </NavLink>
          <nav className="flex gap-1">
            <NavLink to="/" end className={navClass}>
              Library
            </NavLink>
            <NavLink to="/import" className={navClass}>
              Import
            </NavLink>
            <NavLink to="/how-it-works" className={navClass}>
              How it works
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
