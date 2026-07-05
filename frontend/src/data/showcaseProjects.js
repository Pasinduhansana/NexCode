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

//Importing Velmora Travels assets
import velmoraHomeImg from "../../assets/velmora_travels/homepage.webp";
import velmoraAboutImg from "../../assets/velmora_travels/AboutUsPage.webp";
import velmoraFaqImg from "../../assets/velmora_travels/Faq.webp";
import velmoraTestimonialImg from "../../assets/velmora_travels/testimonial.webp";
import velmoraPackageDetailsImg from "../../assets/velmora_travels/packageDetails.webp";
import velmoraPackagesImg from "../../assets/velmora_travels/packages.webp";
import velmoraPricesImg from "../../assets/velmora_travels/prices.webp";
import velmoraGalleryImg from "../../assets/velmora_travels/gallery.webp";
import velmoraOffersImg from "../../assets/velmora_travels/offers.webp";
import velmoraToursImg from "../../assets/velmora_travels/tours.webp";
import velmoraContactImg from "../../assets/velmora_travels/Contact_form.webp";
import velmoraMobileImg from "../../assets/velmora_travels/mobile.webp";

export const showcaseProjects = [
  {
    slug: "velmora-travels",
    name: "Velmora Travels",
    type: "Travel Agency Website",
    summary: `Velmora Travels is a premium travel agency website developed by NexCode to deliver a modern digital experience for travelers seeking unforgettable journeys. The platform showcases curated tour packages, popular destinations, travel experiences, and personalized travel services through a visually immersive interface. Designed with cinematic animations, responsive layouts, and high-performance architecture, the website focuses on inspiring visitors while simplifying the journey from destination discovery to booking inquiries. By combining elegant UI/UX with modern web technologies, Velmora Travels strengthens the agency's online presence, increases customer engagement, and provides a seamless experience across desktop and mobile devices.`,

    whatIs:
      "A premium travel agency website designed to showcase destinations, tour packages, and travel services while generating customer inquiries.",

    whyDeveloped:
      "To establish a strong digital presence for the travel agency, improve customer engagement, and provide an inspiring platform where visitors can easily explore and inquire about travel experiences.",

    businessValue:
      "Increases travel inquiries, strengthens brand credibility, showcases travel services professionally, and improves customer conversion through a modern digital experience.",

    challengeBefore:
      "The travel agency lacked a modern online platform capable of effectively showcasing destinations, tour packages, and travel experiences, making it difficult to engage visitors and convert them into customers.",

    features: [
      "SEO optimized pages",
      "Performance optimized with Next.js",
      "Mobile-first responsive experience",
      "Modern luxury-inspired responsive design",
      "Interactive destination showcase",
      "Curated tour package listings",
      "Immersive hero experience",
      "Travel experience highlights",
      "Customer inquiry & booking forms",
      "Service showcase",
      "Image-rich destination galleries",
      "Smooth page transitions & animations",
    ],

    outcomes: [
      "Improved online brand presence",
      "Higher visitor engagement",
      "Simplified customer inquiry process",
      "Professional presentation of travel services",
    ],

    relatedSlugs: ["student-portfolio-showcase"],

    stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Framer Motion"],

    results: [
      "Luxury digital brand experience",
      "Fast-loading responsive website",
      "Improved customer engagement",
      "Higher inquiry conversion potential",
    ],

    color: "from-sky-500 to-cyan-600",

    cover: velmoraHomeImg,

    laptop_mockup: [velmoraHomeImg],

    phone_mockup: [velmoraMobileImg],

    resources: {
      images: [
        { url: velmoraHomeImg, caption: "Tourism website Landing page" },
        { url: velmoraAboutImg, caption: "AboutUs Section" },
        { url: velmoraTestimonialImg, caption: "Testimonials" },
        { url: velmoraFaqImg, caption: "FAQ Section" },
        { url: velmoraPackageDetailsImg, caption: "Tour Packages" },
        { url: velmoraPackagesImg, caption: "Tour Packages" },
        { url: velmoraPricesImg, caption: "Pricing Section" },
        { url: velmoraGalleryImg, caption: "Image Gallery" },
        { url: velmoraOffersImg, caption: "Special Offers" },
        { url: velmoraToursImg, caption: "Tours Section" },
        { url: velmoraContactImg, caption: "Contact Section" },
      ],

      videos: [
        {
          url: "",
          thumbnail: velmoraHomeImg,
          caption: "Velmora Travels website walkthrough",
        },
      ],
    },
  },
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
    relatedSlugs: ["velmora-travels"],
    stack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    results: ["Professional digital identity", "Mobile-first experience", "Fast loading performance"],
    color: "from-violet-500 to-fuchsia-600",
    cover: heroImg,
    laptop_mockup: [heroImg, heroDarkImg],
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
