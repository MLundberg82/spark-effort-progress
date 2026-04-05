import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      '404 Error: User attempted to access non-existent route:',
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#09090b_0%,_#111113_100%)] px-6 text-white">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center text-center">
        <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-10 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-zinc-500">
            Route error
          </p>
          <h1 className="mt-3 text-5xl font-black">404</h1>
          <p className="mt-4 text-base text-zinc-300">Oops! Page not found</p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-2xl bg-emerald-400 px-5 py-3 font-black text-black"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;