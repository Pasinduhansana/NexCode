import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { HiArrowLeft, HiArrowRight } from 'react-icons/hi';
import usePageTitle from '../utils/usePageTitle';
import { showcaseProjects } from '../data/showcaseProjects';
import api from '../utils/api';

export default function ProjectDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProject = async () => {
      try {
        const res = await api.get('/showcase');
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

  usePageTitle(project ? `${project.name} | Showcase` : 'Project Not Found');

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

  return (
    <div className="min-h-screen bg-[#73d2f6] text-slate-900">
      <section className="relative min-h-[92vh] overflow-hidden pt-16">
        <button
          type="button"
          onClick={() => navigate('/showcase')}
          className="absolute top-5 left-5 z-30 inline-flex items-center gap-2 rounded-full bg-black/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur hover:bg-black/35 transition-colors"
        >
          <HiArrowLeft size={18} />
          Back
        </button>

        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-36 left-1/2 -translate-x-1/2 text-[18vw] md:text-[11rem] leading-[0.83] font-black tracking-tight uppercase text-slate-900/85 text-center">
            showcase
            <br />
            presentation
          </div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 pt-6 text-center">
          <div className="text-white">
            <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">{project.name}</h1>
            <p className="mt-2 text-xs md:text-sm uppercase tracking-[0.45em] text-white/85">{project.type}</p>
          </div>

          <div className="mt-8 md:mt-10 mx-auto max-w-4xl rounded-[1.8rem] bg-slate-100 border-8 border-slate-100 shadow-[0_26px_45px_rgba(2,18,40,0.34)]">
            <div className="rounded-[1.2rem] overflow-hidden border border-slate-300 bg-white">
              <div className="h-9 bg-slate-900 text-white text-[10px] uppercase tracking-[0.2em] flex items-center justify-center">
                Project Showcase Preview
              </div>

              <div className="grid grid-cols-12 min-h-[320px]">
                <div className="col-span-8 bg-[#efbe79] p-5 md:p-7 text-left">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-700 font-semibold">Showcase Presentation</div>
                  <h2 className="mt-4 text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{project.name}</h2>
                  <p className="mt-3 text-sm text-slate-700 max-w-md">{project.summary}</p>
                </div>
                <div className="col-span-4 bg-slate-100 p-4 md:p-6 border-l border-slate-200 text-left">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Stack</div>
                  <ul className="mt-3 space-y-2">
                    {project.stack.slice(0, 4).map((item) => (
                      <li key={item} className="text-sm text-slate-700">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="h-5 mx-auto w-[16rem] md:w-[22rem] rounded-b-[999px] bg-slate-100/80" />
          </div>

          <p className="mt-12 text-white text-2xl md:text-4xl max-w-3xl mx-auto leading-tight font-medium">
            Easily adapt the project architecture and presentation style to your business need.
          </p>
        </div>

        <div className="absolute -bottom-16 -right-14 w-72 h-72 md:w-[24rem] md:h-[24rem] opacity-90 pointer-events-none">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-green-300 to-green-600 blur-3xl opacity-35" />
          <div className="absolute right-7 top-2 w-48 h-48 md:w-64 md:h-64 rounded-full border-l-[12px] border-b-[12px] border-green-700/80 rotate-[-22deg]" />
          <div className="absolute right-16 top-12 w-44 h-44 md:w-56 md:h-56 rounded-full border-r-[10px] border-t-[10px] border-green-500/80 rotate-[14deg]" />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 rounded-2xl border border-slate-200 p-6">
              <h3 className="font-display text-2xl font-bold text-slate-900 mb-3">Project Overview</h3>
              <p className="text-slate-600 leading-relaxed">{project.summary}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-6">
              <h3 className="font-display text-xl font-bold text-slate-900 mb-3">Key Results</h3>
              <ul className="space-y-2">
                {project.results.map((item) => (
                  <li key={item} className="text-sm text-slate-700 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link to="/start-project" className="btn-primary px-8 py-4">Start Similar Project</Link>
            <Link to="/showcase" className="btn-secondary px-8 py-4 inline-flex items-center gap-2">
              View Other Projects <HiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
