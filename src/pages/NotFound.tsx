import { useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error('404 Error: User attempted to access non-existent route:', location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/[0.04] p-8 text-center">
        <div className="text-[11px] font-black uppercase tracking-[0.2em] text-lime-300/80">
          Not found
        </div>

        <h1 className="mt-3 text-5xl font-black tracking-tight">404</h1>
        <p className="mt-3 text-sm leading-6 text-white/65">
          Oops! Page not found
        </p>

        <Link
          to="/"
          className="mt-6 inline-flex min-h-[52px] items-center justify-center rounded-[22px] bg-lime-300 px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-black transition hover:brightness-105"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;