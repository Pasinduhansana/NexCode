// ── NEW FILE: src/components/FeaturedProjects.jsx ─────────────────────────
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { HiSparkles, HiArrowRight, HiCheckCircle } from "react-icons/hi";
import { showcaseProjects } from "../data/showcaseProjects";
import Button from "./Button";
import SectionLabel from "./SectionLabel";

function FeaturedProjectCard({ project, idx, onNavigate }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
      onClick={() => onNavigate(`/showcase/${project.slug}`)}
      className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden cursor-pointer
                 transition-all duration-300 hover:shadow-2xl hover:border-primary/40"
    >
      {/* glow on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(79,123,255,0.10) 0%, transparent 70%)" }}
      />

      {/* media */}
      <div className="relative h-44 sm:h-52 overflow-hidden bg-background">
        <img
          src={project.cover}
          alt={project.name}
          loading="lazy"
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/0 to-black/0" />

        <div
          className="absolute top-3.5 left-3.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
                     text-[9px] font-extrabold uppercase tracking-wider bg-card/90 text-foreground
                     backdrop-blur border border-border/40 shadow-sm"
        >
          <HiSparkles className="text-primary text-[10px]" />
          {project.type}
        </div>

        {project.results?.[0] && (
          <div
            className="absolute bottom-3.5 right-3.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg
                       text-[11px] font-black bg-gradient-to-r from-primary/90 to-blue-500/90 text-white
                       backdrop-blur shadow-md"
          >
            {project.results[0]}
          </div>
        )}
      </div>

      {/* body */}
      <div className="relative z-20 p-5 flex flex-col flex-1">
        <h3 className="font-extrabold text-[15px] text-foreground mb-1.5 group-hover:text-primary transition-colors duration-200 line-clamp-1">
          {project.name}
        </h3>
        <p className="text-xs text-foreground leading-relaxed mb-4 line-clamp-2 flex-1">{project.summary}</p>

        <div className="flex items-center justify-between pt-3.5 border-t border-border mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.slice(0, 2).map((s) => (
              <span
                key={s}
                className="text-[8.5px] font-bold px-2 py-0.5 rounded-md bg-background border border-border
                           text-muted-foreground uppercase tracking-wider"
              >
                {s}
              </span>
            ))}
          </div>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-background border border-border
                       text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary
                       transition-colors duration-300 flex-shrink-0"
          >
            <HiArrowRight size={13} />
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function FeaturedProjects() {
  const navigate = useNavigate();
  const featured = showcaseProjects.filter((p) => p.featured).slice(0, 3);

  return (
    <section className="relative bg-background lg:py-24 overflow-hidden">
      {/* ambient glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(79,123,255,0.08) 0%, transparent 70%)", filter: "blur(60px)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col ">
        {/* header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6 mb-10 md:mb-14">
          <div className="text-center">
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <SectionLabel icon={HiCheckCircle} content="Featured Work" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.05 }}
              className="section-title mb-4 text-center"
            >
              Our Selected
              <br className="hidden lg:block" /> <span className="gradient-text">Projects</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: 0.1 }}
              className="section-subtitle mx-auto max-w-md"
            >
             A curated showcase of the platforms, dashboards, and digital products we've designed, developed, and delivered from concept to completion.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="hidden md:block flex-shrink-0"
          ></motion.div>
        </div>

        {/* cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured.map((project, idx) => (
            <FeaturedProjectCard key={project.slug} project={project} idx={idx} onNavigate={navigate} />
          ))}
        </div>

        <div className="mt-10 text-center md:mt-12 md:flex hidden">
          <div className="mx-auto w-full sm:w-auto">
            <Button variant="outline" size="sm" to="/showcase" rightIcon={<HiArrowRight size={15} className="w-fit" />}>
              Explore More
            </Button>
          </div>
        </div>

        {/* mobile CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex md:hidden justify-center mt-8 mb-10"
        >
          <Button variant="outline" size="sm" to="/showcase" rightIcon={<HiArrowRight size={15} />} className="w-full">
            Explore More
          </Button>
        </motion.div>
      </div>
    </section>
  );
}
