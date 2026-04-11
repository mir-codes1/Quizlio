import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-grape-500/12 text-grape-600 shadow-[inset_0_1px_2px_rgba(156,82,139,0.12)]'
        : 'text-blueslate-600 hover:text-shadow hover:bg-white/70'
    }`;

  return (
    <div className="min-h-screen bg-base text-shadow font-body">
      {/* Floating liquid glass navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 p-3 pointer-events-none">
        <div className="pointer-events-auto mx-auto max-w-5xl navbar-glass rounded-2xl">
          <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
            <NavLink to="/" className="text-xl font-bold tracking-tight font-display text-grape-500">
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
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 pt-28 pb-8 animate-fade-in">
        <Outlet />
      </main>
    </div>
  );
}
