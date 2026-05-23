import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import palmLeave from '../../assets/palm-leave.png';
import { showcaseProjects } from '../data/showcaseProjects';
import project_image from '../../assets/project_image.png';
import project_image2_mobile from '../../assets/project_image1_mob.png';
import laptop_mockup from '../../assets/laptop_mockup.png';
import phone_mockup from '../../assets/phone_mockup.png';

function App() {
  const { slug } = useParams();
  const project = showcaseProjects.find((item) => item.slug === slug);

  if (!project) {
    return <Navigate to="/showcase" replace />;
  }

  return (
    <div className='flex flex-col h-full bg-[#f5f5f7]'>
      <div className="relative w-full min-h-screen bg-[#54b2e6] text-white overflow-x-hidden overflow-y-visible flex flex-col items-center justify-between py-10 pt-20 px-5 z-10 select-none">
        
        {/* Background Watermark Text Layer */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[48%] w-full max-w-[1200px] flex flex-col items-center justify-center -z-10 pointer-events-none">
          <span className="text-[6rem] md:text-[12rem] font-extrabold text-black/20 tracking-wider leading-[0.95] text-center uppercase">
            project
          </span>
                  <span className="text-[6rem] md:text-[12rem] font-extrabold text-black/20 tracking-wider leading-[0.95] text-center uppercase">
            Overview
          </span>
        </div>

        {/* Brand Header */}
        <header className="text-center mt-2">
          <h1 className="text-4xl font-bold tracking-tight">{project.name}</h1>
          <p className="text-[10px] tracking-[4px] mt-1 text-white/80 font-medium">WEB ELEMENTS RESOURCE</p>
        </header>

        {/* Central Interactive Content Frame */}
        <main className="flex flex-col items-center w-full">
          <div className="relative w-[400px] md:w-[700px] max-w-[90vw] my-5 perspective-[1000px]">
            
            {/* Laptop Screen Bezel */}
            <div className='relative'>
              <img src={laptop_mockup} alt="Laptop Mockup" className="w-full h-full relative z-20" />
                <div className="absolute overflow-hidden w-[77%]  h-[84%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] ">
                <img src={project_image} alt="Project Screenshot" className="object-coverz-10 transform transition-transform duration-300 hover:scale-105 w-full h-full" />
                </div>
            </div>

            {/* Phone Screen */}
            <div className='absolute bottom-0 left-0  w-[120px] h-auto mt-10 z-50'>
              <img src={phone_mockup} alt="Phone Mockup" className="w-full  h-full relative z-20" />
                <div className="absolute overflow-hidden bg-white w-[99%] h-[99%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50.5%] rounded-3xl ">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-8 bg-gray-100 rounded-full">
                <div className="flex justify-between px-3 pt-0">
                  <span className='text-black text-[4px] font-semibold'>Dialog</span>
                  <div className="flex">
                  <span className='text-black text-[4px] mr-1'>📶</span>
                  <span className='text-black text-[4px] font-semibold'>100%</span></div>
                </div>
                </div>
                <img src={project_image2_mobile} alt="Project Screenshot" className="object-coverz-10 pt-6 transform transition-transform duration-300 hover:scale-105 w-full h-full" />
                </div>
            </div>

          </div>

          {/* Dynamic Presentation Typography */}
          <div className="text-center ">
            <p className="text-[11px] tracking-[5px] text-white/60 mb-3.5 uppercase font-semibold">
              SELECTED PROJECT DETAILS
            </p>
            <p className="text-l md:text-xl max-w-[800px] font-normal leading-relaxed text-white/95 balance line-clamp-2">
              {project.summary}
            </p>
          </div>
        </main>

        {/* Decorative Overlapping Foreground Botanical Corner Asset - right */}
        <div className="absolute -bottom-5 right-10 -translate-x-1/5 w-[400px] h-auto mb-[8%] pointer-events-none z-30 transform select-none">
          {/* Adding Shadow for Depth and Visual Interest (sent behind the image) */}
          <div className="absolute bottom-4 left-[43%] z-0 w-20 h-5 bg-black/80 rounded-lg filter blur-lg opacity-70"></div>
          <img src={palmLeave} alt="Decorative Palm Corner Graphic" className="w-full h-auto relative z-20" />
        </div>
      </div>

      <div className="w-full h-[400px] bg-white flex justify-center py-6 text-slate-900">
          <div className="h-full grid grid-cols-1 max-w-7xl md:grid-cols-12 gap-5 md:gap-8 items-stretch">
            <div className="md:col-span-7 flex flex-col justify-between min-h-0">
              <div>
                <p className="text-[11px] tracking-[0.22em] uppercase text-slate-500 font-semibold mb-3">Case Study</p>
                <h2 className="text-2xl md:text-3xl font-semibold text-[#1d1d1f] leading-tight line-clamp-2">{project.name}</h2>
                <p className="mt-3 text-sm md:text-[15px] text-slate-600 leading-relaxed line-clamp-[6]">{project.summary}</p>
              </div>

              <div className="mt-2 flex flex-wrap gap-2.5">
                {project.stack.slice(0, 5).map((tech) => (
                  <span
                    key={tech}
                    className="px-3.5 py-1.5 rounded-full  bg-[#f7f7fa] text-[12px] font-medium text-slate-700"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div className="md:col-span-5 min-h-0 grid grid-rows-[1fr_auto] gap-3.5">
              <div className="rounded-2xl border border-[#ececf1] bg-[#fafafc] p-4 min-h-0">
                <p className="text-[11px] tracking-[0.2em] uppercase text-slate-500 font-semibold mb-2.5">Impact</p>
                <div className="space-y-2">
                  {project.results.slice(0, 2).map((result) => (
                    <div key={result} className="flex items-start gap-2.5 text-sm text-slate-700 leading-snug">
                      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                      <span className="line-clamp-2">{result}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#ececf1] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Type</p>
                  <p className="mt-1 text-sm font-semibold text-[#1d1d1f] line-clamp-1">{project.type}</p>
                </div>
                <div className="rounded-xl border border-[#ececf1] bg-white p-3">
                  <p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Tech Count</p>
                  <p className="mt-1 text-sm font-semibold text-[#1d1d1f]">{project.stack.length}</p>
                </div>
              </div>
            </div>
          </div>
      </div>


    </div>
  );
}

export default App;