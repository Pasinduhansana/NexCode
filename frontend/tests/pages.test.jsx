import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

vi.mock("../src/context/ThemeContext", () => ({
  ThemeProvider: ({ children }) => children,
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
}));

vi.mock("../src/utils/useThemeClasses", () => ({
  useThemeClasses: () => ({
    bg: "bg-white",
    text: "text-gray-900",
    card: "bg-white",
    border: "border-gray-200",
    muted: "text-gray-500",
  }),
}));

vi.mock("../src/utils/usePageTitle", () => ({
  default: () => {},
}));

vi.mock("gsap", () => {
  const chainable = { fromTo: vi.fn(function() { return chainable; }), to: vi.fn(function() { return chainable; }), play: vi.fn(), pause: vi.fn() };
  const timeline = vi.fn(() => chainable);
  return {
    __esModule: true,
    default: { registerPlugin: vi.fn(), fromTo: vi.fn(), to: vi.fn(), timeline },
    registerPlugin: vi.fn(),
    fromTo: vi.fn(),
    to: vi.fn(),
    timeline,
    utils: { toArray: vi.fn(() => []) },
  };
});

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { create: vi.fn(), refresh: vi.fn(), getAll: vi.fn(() => []) },
}));

vi.mock("framer-motion", () => {
  const motionHandler = (tag) => (props) => {
    const { initial, animate, whileInView, viewport, transition, variants, whileHover, ...rest } = props;
    const { createElement } = require("react");
    return createElement(tag, rest);
  };
  return {
    motion: new Proxy({}, { get: (_, tag) => motionHandler(tag) }),
    AnimatePresence: ({ children }) => children,
    useMotionValue: () => ({ get: vi.fn(), set: vi.fn() }),
    useTransform: () => 0,
    useSpring: () => ({ get: vi.fn(), set: vi.fn() }),
    useAnimation: () => ({ start: vi.fn(), stop: vi.fn(), set: vi.fn() }),
    useInView: () => true,
  };
});

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

vi.mock("@formspree/react", () => ({
  useForm: () => [{ succeeded: false, submitting: false }, vi.fn()],
  ValidationError: () => null,
}));

vi.mock("@vercel/analytics/react", () => ({
  Analytics: () => null,
}));

vi.mock("react-icons/hi", async (importOriginal) => {
  const actual = await importOriginal();
  const stub = () => null;
  const stubbed = {};
  for (const key of Object.keys(actual)) {
    stubbed[key] = stub;
  }
  return stubbed;
});

vi.mock("react-icons/fa", async (importOriginal) => {
  const actual = await importOriginal();
  const stub = () => null;
  const stubbed = {};
  for (const key of Object.keys(actual)) {
    stubbed[key] = stub;
  }
  return stubbed;
});

vi.mock("react-icons/fa6", async (importOriginal) => {
  const actual = await importOriginal();
  const stub = () => null;
  const stubbed = {};
  for (const key of Object.keys(actual)) {
    stubbed[key] = stub;
  }
  return stubbed;
});

vi.mock("react-icons/lucide", async (importOriginal) => {
  const actual = await importOriginal();
  const stub = () => null;
  const stubbed = {};
  for (const key of Object.keys(actual)) {
    stubbed[key] = stub;
  }
  return stubbed;
});

vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  LineChart: ({ children }) => <div>{children}</div>,
  Line: () => null,
  BarChart: ({ children }) => <div>{children}</div>,
  Bar: () => null,
  PieChart: ({ children }) => <div>{children}</div>,
  Pie: () => null,
  Cell: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

vi.mock("../src/components/AdModal", () => ({ default: () => null }));
vi.mock("../src/components/WhatsAppFloat", () => ({ default: () => null }));
vi.mock("../src/components/Navbar", () => ({ default: () => <nav data-testid="navbar" /> }));
vi.mock("../src/components/Footer", () => ({ default: () => <footer data-testid="footer" /> }));
vi.mock("../src/components/ScrollToTop", () => ({ default: () => null }));
vi.mock("../src/hooks/useAdModal", () => ({
  default: () => ({ open: false, setOpen: vi.fn(), startIndex: 0 }),
}));

import HomePage from "../src/sitePages/HomePage";
import ServicesPage from "../src/sitePages/ServicesPage";
import AboutPage from "../src/sitePages/AboutPage";
import ContactPage from "../src/sitePages/ContactPage";
import ShowcasePage from "../src/sitePages/ShowcasePage";
import ProjectDetailPage from "../src/sitePages/ProjectDetailPage";
import ProjectRequestPage from "../src/sitePages/ProjectRequestPage";
import PrivacyPolicyPage from "../src/sitePages/PrivacyPolicyPage";
import TermsOfServicePage from "../src/sitePages/TermsOfServicePage";

function renderAt(ui, route = "/") {
  return render(
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
  );
}

describe("Public site pages — no runtime errors", () => {
  it("renders HomePage without crashing", () => {
    const { container } = renderAt(<HomePage />);
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders ServicesPage without crashing", () => {
    const { container } = renderAt(<ServicesPage />);
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders AboutPage without crashing", () => {
    const { container } = renderAt(<AboutPage />);
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders ContactPage without crashing", () => {
    renderAt(<ContactPage />, "/contact");
    expect(screen.getByPlaceholderText("John Doe")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("john@example.com")).toBeInTheDocument();
  });

  it("renders ShowcasePage without crashing", () => {
    const { container } = renderAt(<ShowcasePage />, "/showcase");
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders ShowcasePage with category filter", () => {
    const { container } = renderAt(<ShowcasePage />, "/showcase?category=web-development");
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders ProjectRequestPage without crashing", () => {
    const { container } = renderAt(<ProjectRequestPage />, "/start-project");
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders PrivacyPolicyPage without crashing", () => {
    const { container } = renderAt(<PrivacyPolicyPage />, "/privacy-policy");
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders TermsOfServicePage without crashing", () => {
    const { container } = renderAt(<TermsOfServicePage />, "/terms-of-service");
    expect(container.innerHTML).toBeTruthy();
  });
});

describe("ProjectDetailPage — slug routing (useParams fix)", () => {
  it("renders with a valid slug param without ReferenceError", () => {
    const { container } = renderAt(<ProjectDetailPage />, "/showcase/test-project");
    expect(container.innerHTML).toBeTruthy();
  });

  it("renders not-found fallback for invalid slug without crashing", () => {
    const { container } = renderAt(
      <ProjectDetailPage />,
      "/showcase/nonexistent-slug-xyz"
    );
    expect(container.innerHTML).toBeTruthy();
  });
});

describe("Full route coverage — every route renders without runtime error", () => {
  const pageRoutes = [
    { path: "/", Page: HomePage, name: "Home" },
    { path: "/services", Page: ServicesPage, name: "Services" },
    { path: "/showcase", Page: ShowcasePage, name: "Showcase" },
    { path: "/showcase/:slug", Page: ProjectDetailPage, name: "ProjectDetail" },
    { path: "/about", Page: AboutPage, name: "About" },
    { path: "/contact", Page: ContactPage, name: "Contact" },
    { path: "/start-project", Page: ProjectRequestPage, name: "ProjectRequest" },
    { path: "/privacy-policy", Page: PrivacyPolicyPage, name: "PrivacyPolicy" },
    { path: "/terms-of-service", Page: TermsOfServicePage, name: "TermsOfService" },
  ];

  pageRoutes.forEach(({ path, Page, name }) => {
    it(`${name} (${path}) renders without runtime error`, () => {
      const initialPath = path.includes(":slug") ? "/showcase/test-slug" : path;
      const { container } = render(
        <MemoryRouter initialEntries={[initialPath]}>
          <Routes>
            {pageRoutes.map((r) => (
              <Route key={r.path} path={r.path} element={<r.Page />} />
            ))}
            <Route path="*" element={<div>Redirect</div>} />
          </Routes>
        </MemoryRouter>
      );
      expect(container.innerHTML).toBeTruthy();
    });
  });
});
