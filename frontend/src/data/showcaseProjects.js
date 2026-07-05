import aboutImg from "../../assets/portfolio_project/About_Section.webp";
import aboutDarkImg from "../../assets/portfolio_project/About_Section_dark.webp";
import aboutImg2 from "../../assets/portfolio_project/About_Section_2.webp";
import aboutDarkImg2 from "../../assets/portfolio_project/About_Section_2_dark.webp";
import certificateImg from "../../assets/portfolio_project/Certificate_Section.webp";
import certificateDarkImg from "../../assets/portfolio_project/Certificate_Section_dark.webp";
import experienceImg from "../../assets/portfolio_project/Experience_Section.webp";
import experienceDarkImg from "../../assets/portfolio_project/Experience_Section_dark.webp";
import heroImg from "../../assets/portfolio_project/Hero_Section.webp";
import heroDarkImg from "../../assets/portfolio_project/Hero_Section_dark.webp";
import projectSectionDarkImg from "../../assets/portfolio_project/Project_Section_dark.webp";
import project2DarkImg from "../../assets/portfolio_project/Project_Section_2_dark.webp";
import project3DarkImg from "../../assets/portfolio_project/Project_Section_3_dark.webp";
import project4DarkImg from "../../assets/portfolio_project/Project_Section_4_dark.webp";
import testimonialImg from "../../assets/portfolio_project/Testtimonial_Section.webp";
import testimonialDarkImg from "../../assets/portfolio_project/Testtimonial_Section_dark.webp";
import portfoliovideo from "../../assets/portfolio_project/portfolio-intro.mp4";
import Portfolio_mobile from "../../assets/portfolio_project/Home_mobile_light.webp";
import Portfolio_mobile_dark from "../../assets/portfolio_project/Home_mobile.webp";



export const showcaseProjects = [
  {
    slug: "student-portfolio-showcase",
    name: "Student Portfolio Showcase",
    type: "Personal Portfolio Website",
    summary: `Student Portfolio Showcase is a modern personal branding platform developed by NexCode for university students, fresh graduates, and aspiring professionals. The platform helps individuals present their projects, technical skills, achievements, certifications, and experience in a professional online portfolio. Each portfolio is designed with a strong focus on storytelling, performance, responsive design, and recruiter-friendly presentation, enabling students to stand out during internships, job applications, and freelance opportunities. By combining clean UI/UX with modern web technologies, the platform transforms traditional resumes into interactive digital experiences that effectively showcase technical capability and personal branding.`,
    whatIs: "A modern portfolio website that helps students showcase their skills, projects, achievements, and professional journey.",
    whyDeveloped:
      "To help students build a professional online presence and increase their visibility to recruiters, universities, and potential clients.",
    businessValue:
      "Strengthens personal branding, improves employability, and provides students with a professional platform to showcase their work.",
    challengeBefore:
      "Most students relied on static resumes or generic portfolio templates that failed to effectively demonstrate their technical skills, project experience, and achievements.",
    features: [
      "Modern responsive design",
      "Project showcase",
      "Skills & technology timeline",
      "Experience & achievements",
      "Certification gallery",
      "Research publication section",
      "Interactive animations",
      "Contact & social integration",
      "SEO optimized pages",
      "Performance optimized",
    ],
    outcomes: [
      "Professional personal branding",
      "Higher recruiter engagement",
      "Improved online visibility",
      "Better presentation of technical projects",
    ],
    relatedSlugs: ["travelcore-booking-hub", "disaster-management-platform", "bill-pay-platform"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "GSAP"],
    results: ["Professional digital identity", "Mobile-first experience", "Fast loading performance"],
    color: "from-violet-500 to-fuchsia-600",
    cover: heroImg,
    laptop_mockup: [heroImg,heroDarkImg],
    phone_mockup: [Portfolio_mobile, Portfolio_mobile_dark],
    resources: {
      images: [
        { url: heroDarkImg, caption: "Hero Section (Dark)" },
        { url: aboutDarkImg, caption: "About Section (Dark)" },
        { url: aboutDarkImg2, caption: "About Section" },
        { url: experienceDarkImg, caption: "Experience Section (Dark)" },
        { url: testimonialDarkImg, caption: "Testimonial Section (Dark)" },
        { url: certificateDarkImg, caption: "Certificate Section (Dark)" },
        { url: projectSectionDarkImg, caption: "Project Section (Dark)" },
        { url: project2DarkImg, caption: "Projects Section 2 (Dark)" },
        { url: project3DarkImg, caption: "Projects Section 3 (Dark)" },
        { url: project4DarkImg, caption: "Projects Section 4 (Dark)" },
        { url: heroImg, caption: "Hero Section" },
        { url: aboutImg2, caption: "About Section" },
        { url: aboutImg, caption: "About Section" },
        { url: experienceImg, caption: "Experience Section" },
        { url: certificateImg, caption: "Certificate Section" },
        { url: testimonialImg, caption: "Testimonial Section" },
      ],
      videos: [
        {
          url: portfoliovideo,
          thumbnail: heroDarkImg,
          caption: "Student Portfolio Showcase walkthrough",
        },
      ],
    },
  },
];
