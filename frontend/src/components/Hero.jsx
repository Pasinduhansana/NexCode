import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HiChevronDown } from "react-icons/hi";
import { FaRocket } from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import lightBg from "../../assets/hero_light_bg.png";
import darkBg from "../../assets/hero_dark_bg.png";
import primaryBg from "../../assets/hero_primary_bg.png";
import circle_image from "../../assets/circle.png";
import palmLeave from "../../assets/palm-leave.png";
import project_image from "../../assets/project_image.png";
import project_image2_mobile from "../../assets/project_image1_mob.png";
import laptop_mockup from "../../assets/laptop_mockup.png";
import phone_mockup from "../../assets/phone_mockup.png";
export default function Hero({ stats = [] }) {
  const { theme } = useTheme();

  const bgImage = theme === "dark" ? darkBg : theme === "light" ? lightBg : primaryBg;
  const watermarkColor = theme === "dark" ? "rgba(255, 255, 255, 0.1)" : "rgba(17, 24, 39, 0.2)";

  return (
    <section
      className="relative min-h-screen dark-grid m-auto flex flex-col items-start overflow-hidden h-full bg-background"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-hero-gradient opacity-80 pointer-events-none" />

      <div className="absolute left-1/2 -bottom-10 -translate-x-1/2 scale-100 w-full pointer-events-none">
        {/* Hero Section */}
        <div className="relative w-full min-h-screen text-white overflow-x-hidden overflow-y-visible flex flex-col items-center justify-between py-10 pt-20 px-5 z-10 select-none">
          {/* Background Watermark Text Layer */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[40%] lg:scale-100 w-full lg:max-w-[1200px] [@media(min-width:1600px)]:scale-125 flex flex-col items-center justify-center -z-10 pointer-events-none">
            <span
              className={`text-[6rem] md:text-[12rem] font-extrabold tracking-wider leading-[0.95] text-center uppercase`}
              style={{ color: watermarkColor }}
            >
              Digital
            </span>
            <span
              className={`text-[6rem] md:text-[12rem] font-extrabold tracking-wider leading-[0.95] text-center uppercase`}
              style={{ color: watermarkColor }}
            >
              SOLUTIONS
            </span>
          </div>

          {/* Brand Header */}

          {/* Central Interactive Content Frame */}
          <main className="flex flex-col items-center w-full mt-32  h-full">
            <div className="relative mx-auto w-full max-w-[320px] h-full sm:max-w-[420px] md:max-w-[500px] lg:max-w-[600px] [@media(min-width:1600px)]:max-w-[800px] my-5 perspective-[1000px] px-2 sm:px-0">
              {/* Laptop Screen Bezel */}
              <div className="relative">
                <img src={laptop_mockup} alt="Laptop Mockup" className="w-full h-full relative z-20" />
                <div className="absolute overflow-hidden w-[77%]  h-[84%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[52%] ">
                  <img
                    src={project_image}
                    alt="Project Screenshot"
                    className="object-cover z-10 transform transition-transform duration-300 hover:scale-105 w-full h-full"
                  />
                </div>
              </div>

              {/* Phone Screen */}
              <div className="absolute bottom-0 left-0  w-[120px] h-auto mt-10 z-50">
                <img src={phone_mockup} alt="Phone Mockup" className="w-full  h-full relative z-20" />
                <div className="absolute overflow-hidden bg-card w-[99%] h-[99%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-[50.5%] rounded-3xl ">
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
                    className="object-cover z-10 pt-6 transform transition-transform duration-300 hover:scale-105 w-full h-full"
                  />
                </div>
              </div>
            </div>
          </main>

          {/* Decorative Overlapping Foreground Botanical Corner Asset - right */}
          <div className="absolute -bottom-5 right-12 -translate-x-1/5 w-[350px] h-auto mb-[10%] pointer-events-none z-30 transform select-none">
            {/* Adding Shadow for Depth and Visual Interest (sent behind the image) */}
            <div className="absolute bottom-4 left-[43%] z-0 w-20 h-5 bg-black/80 rounded-lg filter blur-lg opacity-70"></div>
            <img src={palmLeave} alt="Decorative Palm Corner Graphic" className="w-full h-auto relative z-20" />
          </div>
        </div>
      </div>

      <div className="relative w-full mx-auto px-4 sm:px-6 lg:px-8 h-full flex-1 ">
        <div className="w-full mx-auto text-center h-full pt-24 ">
          <header className="text-center mt-4">
            <h1 className="text-4xl font-semibold tracking-tight text-foreground opacity-100">Empower Digital Growth</h1>
            <p className="text-[12px] tracking-[3px] mt-3 text-text_muted font-medium opacity-100">Newest Tech Trends · Software Development</p>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Link
              to="/start-project"
              className="inline-flex gap-4 items-center justify-center px-4 py-2 my-5 rounded-lg text-xs font-semibold bg-legacyPrimary-500 duration-200 transition-all text-white/80 hover:bg-legacyPrimary-600 shadow-sm"
            >
              <FaRocket size={14} />
              Build Your Next Project
            </Link>
          </motion.div>

          {/* Stats card 1*/}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute bottom-[45%] right-[10%] -translate-x-1/2 grid grid-cols-2 md:grid-cols-2 gap-2 px-6 py-4 rounded-2xl  bg-card/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] w-[95%] md:w-auto"
          >
            {stats.slice(0, 2).map((s, i) => (
              <div key={i} className="text-center px-4 relative">
                <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>

                <div className="text-xs text-text_muted mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Stats card 2*/}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="absolute bottom-[25%] left-[5%] -translate-x-1/2 grid grid-cols-2 md:grid-cols-2 gap-2 px-6 py-4 rounded-2xl  bg-card/60 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] w-[95%] md:w-auto"
          >
            {stats.slice(2, 4).map((s, i) => (
              <div key={i} className="text-center px-4 relative">
                <div className="font-display text-2xl font-bold text-foreground">{s.value}</div>

                <div className="text-xs text-text_muted mt-1 tracking-wide">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="flex justify-between px-5 items-center  w-full">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm w-full md:text-[14px] my-8 max-w-xl mx-10 !text-left text-text_secondary leading-relaxed"
        >
          Build What Matters,
          <br />
          <span className="text-[30px] font-semibold"> Build your solutions today</span>
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-sm w-full md:text-[14px] my-8 max-w-xl mx-10 !text-right text-text_muted leading-relaxed"
        >
          Unlock your business's full potential with NexCode. <br />
          From sleek websites to powerful enterprise systems.
        </motion.p>
      </div>
    </section>
  );
}
