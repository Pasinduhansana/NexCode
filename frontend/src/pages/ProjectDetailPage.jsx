import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import palmLeave from "../../assets/palm-leave.png";
import project_image from "../../assets/project_image.png";
import project_image2_mobile from "../../assets/project_image1_mob.png";
import laptop_mockup from "../../assets/laptop_mockup.png";
import phone_mockup from "../../assets/phone_mockup.png";
import { useTheme } from "../context/ThemeContext";
import { showcaseProjects } from "../data/showcaseProjects";
import api from "../utils/api";
import usePageTitle from "../utils/usePageTitle";

const limitWords = (text, maxWords) => text.split(/\s+/).slice(0, maxWords).join(" ");

function App() {
  const { slug } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      try {
        const res = await api.get("/showcase");
        const match = res.data.data?.find((item) => item.slug === slug);
        if (mounted) setProject(match || null);
      } catch {
        if (mounted) {
          setProject(showcaseProjects.find((item) => item.slug === slug));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProject();

    return () => {
      mounted = false;
    };
  }, [slug]);

  usePageTitle(project ? `${project.name} | Showcase` : "Project Not Found");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!project) {
    return <Navigate to="/showcase" replace />;
  }

  const relatedProjects = (project.relatedSlugs ?? [])
    .map((relatedSlug) => showcaseProjects.find((item) => item.slug === relatedSlug))
    .filter(Boolean);
  const summaryText = limitWords(project.summary, 60);
  const whatIsText = limitWords(project.whatIs, 28);
  const whyDevelopedText = limitWords(project.whyDeveloped, 30);
  const businessValueText = limitWords(project.businessValue, 30);
  const challengeText = limitWords(project.challengeBefore, 30);
  const relatedSummary = (text) => limitWords(text, 28);
  const watermarkColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(17, 24, 39, 0.2)";

  return (
    <div className="flex flex-col h-full">
      {/* Hero Section */}
      <div
        className={`relative w-full min-h-screen bg-hero-gradient text-white overflow-x-hidden overflow-y-visible flex flex-col items-center justify-between py-10 pt-20 px-5 z-10 select-none`}
      >
        {/* Background Watermark Text Layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48%] scale-[0.62] sm:scale-75 lg:scale-100 w-full lg:max-w-[1200px] [@media(min-width:1600px)]:scale-125 flex flex-col items-center justify-center -z-10 pointer-events-none">
          <span
            className={`text-[6rem] md:text-[12rem] font-extrabold tracking-wider leading-[0.95] text-center uppercase`}
            style={{ color: watermarkColor }}
          >
            project
          </span>
          <span
            className={`text-[6rem] md:text-[12rem] font-extrabold tracking-wider leading-[0.95] text-center uppercase`}
            style={{ color: watermarkColor }}
          >
            Overview
          </span>
        </div>

        {/* Brand Header */}
        <header className="text-center mt-10">
          <h1 className="text-4xl font-bold tracking-tight text-text_primary opacity-100">{project.name}</h1>
          <p className="text-[10px] tracking-[4px] mt-1 text-text_muted font-medium opacity-100">WEB ELEMENTS RESOURCE</p>
        </header>

        {/* Central Interactive Content Frame */}
        <main className="flex flex-col items-center w-full">
          <div className="relative mx-auto w-full max-w-[280px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[700px] [@media(min-width:1600px)]:max-w-[1000px] my-5 perspective-[1000px] px-2 sm:px-0">
            {/* Laptop Screen Bezel */}
            <div className="relative">
              <img src={laptop_mockup} alt="Laptop Mockup" className="w-full h-full relative z-20" />
              <div className="absolute overflow-hidden w-[77%]  h-[84%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] ">
                <img
                  src={project_image}
                  alt="Project Screenshot"
                  className="object-coverz-10 transform transition-transform duration-300 hover:scale-105 w-full h-full"
                />
              </div>
            </div>

            {/* Phone Screen */}
            <div className="absolute bottom-0 left-0 w-[92px] sm:w-[120px] h-auto mt-10 z-50">
              <img src={phone_mockup} alt="Phone Mockup" className="w-full  h-full relative z-20" />
              <div className="absolute overflow-hidden bg-background w-[99%] h-[99%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50.5%] rounded-3xl ">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-8 bg-muted rounded-full">
                  <div className="flex justify-between px-3 pt-0">
                    <span className="text-foreground text-[4px] font-semibold">Dialog</span>
                    <div className="flex">
                      <span className="text-foreground text-[4px] mr-1">📶</span>
                      <span className="text-foreground text-[4px] font-semibold">100%</span>
                    </div>
                  </div>
                </div>
                <img
                  src={project_image2_mobile}
                  alt="Project Screenshot"
                  className="object-coverz-10 pt-6 transform transition-transform duration-300 hover:scale-105 w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Presentation Typography */}
          <div className="text-center ">
            <p className="text-[11px] tracking-[5px] text-text_muted mb-3.5 uppercase font-semibold">SELECTED PROJECT DETAILS</p>
            <p className="text-l md:text-[18px] max-w-[800px] font-normal leading-relaxed text-text_primary opacity-95 balance line-clamp-2">
              {project.summary}
            </p>
          </div>
        </main>

        {/* Decorative Overlapping Foreground Botanical Corner Asset - right */}
        <div className="absolute -bottom-5 right-10 hidden sm:block -translate-x-1/5 w-[400px] h-auto mb-[8%] pointer-events-none z-30 transform select-none">
          {/* Adding Shadow for Depth and Visual Interest (sent behind the image) */}
          <div className="absolute bottom-4 left-[43%] z-0 w-20 h-5 bg-black/80 rounded-lg filter blur-lg opacity-70"></div>
          <img src={palmLeave} alt="Decorative Palm Corner Graphic" className="w-full h-auto relative z-20" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full bg-background px-5 py-10 text-foreground">
        <div className="max-w-7xl mx-auto space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5 md:gap-8 items-start">
            <div className="md:col-span-8 flex flex-col gap-6">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase font-semibold mb-3 text-text_muted">Case Study</p>
                <h2 className="text-2xl md:text-3xl font-semibold leading-tight line-clamp-2 text-text_primary">{project.name}</h2>
                <p className="mt-3 text-sm md:text-[15px] text-text_muted leading-relaxed">
                  {isSummaryExpanded ? project.summary : summaryText}
                  {!isSummaryExpanded && summaryText.length < project.summary.length ? (
                    <button
                      type="button"
                      onClick={() => setIsSummaryExpanded(true)}
                      className="ml-2 inline-flex items-center text-foreground font-semibold hover:underline"
                    >
                      Read more
                    </button>
                  ) : null}
                  {isSummaryExpanded ? (
                    <button
                      type="button"
                      onClick={() => setIsSummaryExpanded(false)}
                      className="ml-2 inline-flex items-center text-text_muted font-semibold hover:underline"
                    >
                      Show less
                    </button>
                  ) : null}
                </p>
              </div>

              <div className="py-4">
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">What the project is</p>
                <p className="text-sm md:text-[15px] text-text_muted leading-relaxed">{whatIsText}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 text-text_primary">Why it was developed</p>
                  <p className="text-sm text-text_muted leading-relaxed">{whyDevelopedText}</p>
                </div>
                <div className="rounded-2xl border border-border bg-card p-4">
                  <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 text-text_primary">Business value</p>
                  <p className="text-sm text-text_muted leading-relaxed">{businessValueText}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {project.stack.slice(0, 5).map((tech) => (
                  <span key={tech} className="px-3.5 py-1.5 rounded-full bg-none text-[12px] font-medium text-foreground border border-border_hard">
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-4 min-h-0 grid gap-3.5">
              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">Client challenge</p>
                <p className="text-sm text-text_muted leading-relaxed">{challengeText}</p>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">Project outcomes</p>
                <div className="space-y-2">
                  {project.outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-sm text-text_muted leading-snug">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span>{limitWords(item, 14)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card p-4">
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2.5 text-text_primary">Measured results</p>
                <div className="space-y-2">
                  {project.results.map((result) => (
                    <div key={result} className="flex items-start gap-2.5 text-sm text-text_muted leading-snug">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-accent flex-shrink-0" />
                      <span>{result}</span>
                    </div>
                  ))}
                </div>
              </div>

              <a href="/contact" className="btn-primary">
                Request Similar Solution
              </a>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 md:p-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase text-text_muted font-semibold mb-1">Feature list</p>
                <h3 className="text-lg font-semibold text-text_primary">What this solution includes</h3>
              </div>
              <div className="text-sm text-text_muted">{project.features.length} core capabilities</div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {project.features.map((feature) => (
                <div key={feature} className="rounded-xl border border-border_hard/50 bg-card px-4 py-3 text-sm text-foreground">
                  {feature}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-1 text-text_muted">Related projects</p>
                <h3 className="text-lg font-semibold text-foreground">Explore similar solutions</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedProjects.map((relatedProject) => (
                <Link
                  key={relatedProject.slug}
                  to={`/showcase/${relatedProject.slug}`}
                  className="group overflow-hidden rounded-2xl border border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="aspect-[16/10] overflow-hidden bg-muted">
                    <img
                      src={relatedProject.image}
                      alt={relatedProject.name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4">
                    <div className="text-[11px] tracking-[0.2em] uppercase font-semibold mb-2 text-text_muted">{relatedProject.type}</div>
                    <h4 className="text-base font-semibold text-foreground group-hover:text-primary">{relatedProject.name}</h4>
                    <p className="mt-2 text-sm text-text_muted line-clamp-3">{relatedSummary(relatedProject.summary)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
