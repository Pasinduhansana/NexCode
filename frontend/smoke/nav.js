import * as RR from 'react-router-dom';

export function useRouter() {
  const navigate = RR.useNavigate();
  return {
    push: (h) => navigate(h),
    replace: (h) => navigate(h, { replace: true }),
    back: () => navigate(-1),
    forward: () => navigate(1),
    refresh: () => {},
    prefetch: () => {},
  };
}
export function usePathname() { return RR.useLocation().pathname; }
export function useParams() { return RR.useParams(); }
export function useSearchParams() { return RR.useSearchParams(); }
