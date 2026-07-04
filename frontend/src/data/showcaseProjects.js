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
    slug: "lankacart-commerce-suite",
    name: "LankaCart Commerce Suite",
    type: "E-commerce Platform",
    summary: `LankaCart Commerce Suite is a multi-vendor e-commerce platform built to help retailers scale online without juggling separate tools for products, inventory, orders, and payments. It combines a storefront, vendor portal, and order orchestration layer so teams can manage catalogues, shipping, and settlements from one place. The platform solves the problems of fragmented inventory, slow checkout flows, and inconsistent fulfillment across vendors. It uses React on the frontend, Node.js services in the backend, MongoDB for product data, and Redis for caching and sessions. Stripe and regional gateways handle secure payments, while routing rules and automation reduce manual work across warehouse, vendor, and dropship workflows. The result is a cleaner customer experience, stronger operational control, and a foundation that can grow with the business.
`,
    whatIs: "A multi-vendor e-commerce suite that unifies storefront, vendor, inventory, and checkout operations.",
    whyDeveloped: "To help growing retail businesses manage marketplace complexity without fragmented tools.",
    businessValue: "Increases conversion, improves operational control, and supports scalable omnichannel commerce.",
    challengeBefore: "Retailers were juggling separate systems for vendor catalogues, orders, payments, and fulfillment.",
    features: ["Multi-vendor catalog management", "Smart checkout", "Vendor portal", "Inventory sync", "Order routing", "Payments integration"],
    outcomes: ["Faster checkout", "Higher repeat purchase rate", "Improved fulfillment accuracy"],
    relatedSlugs: ["medflow-clinic-portal", "travelcore-booking-hub"],
    stack: ["React", "Node.js", "MongoDB", "Stripe"],
    results: ["42% faster checkout", "2.4x repeat orders"],
    color: "from-blue-600 to-cyan-500",
    resources: {
      images: [
        { url: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80", caption: "Real-time data dashboard" },
      ],
      videos: [
        {
          url: "https://www.youtube.com/embed/SmartCampBoxVideo",
          thumbnail: "https://img.youtube.com/vi/SmartCampBoxVideo/0.jpg",
          caption: "GPS Fetching using IOT and Disaster Dashboard walkthrough",
        },
      ],
    },
  },
  {
    slug: "medflow-clinic-portal",
    name: "MedFlow Clinic Portal",
    type: "Healthcare Management",
    summary: `MedFlow Clinic Portal is a healthcare management platform designed to reduce admin work and give clinicians faster access to the information they need. Instead of using disconnected records and manual appointment tools, the system centralizes patient profiles, visit history, scheduling, and staff workflows in one secure portal. It helps clinics coordinate appointments, manage queues, and keep patient information organized across different roles such as doctors, nurses, and front-desk staff. Built with React on the frontend, Node.js services in the backend, PostgreSQL for structured data, and Redis for cached lookups, MedFlow balances reliability with speed. Security was a major priority, so the platform includes role-based access, audit logging, and encrypted data handling. In practice, it cuts down administrative delays, improves record retrieval, and makes daily clinic operations far more efficient.
`,
    whatIs: "A healthcare operations portal that centralizes patient records, appointments, and staff workflows.",
    whyDeveloped: "To reduce clinic admin friction and give clinicians better access to patient information.",
    businessValue: "Speeds up patient handling, improves staff productivity, and strengthens record control.",
    challengeBefore: "Clinics relied on disconnected records and manual scheduling, causing delays and missed appointments.",
    features: [
      "Unified patient records",
      "Appointment orchestration",
      "Role-based dashboards",
      "Audit logs",
      "MFA login",
      "Lab/payment integrations",
    ],
    outcomes: ["Lower admin time", "Better record access", "Higher scheduling efficiency"],
    relatedSlugs: ["buildops-erp-lite", "learnedge-lms"],
    stack: ["React", "Express", "PostgreSQL", "Redis"],
    results: ["60% lower admin time", "99.9% uptime"],
    color: "from-cyan-600 to-teal-500",
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
    },  },
  {
    slug: "fleettrack-analytics",
    name: "FleetTrack Analytics",
    type: "Logistics Dashboard",
    summary: `FleetTrack Analytics is a logistics dashboard built to give delivery teams real-time visibility into vehicles, routes, and delivery performance. It turns GPS, telematics, traffic, and event data into actionable insights that help operators reduce fuel usage, improve ETAs, and react faster to delays. Dispatchers can monitor live vehicle positions, review route density, and spot exceptions from a central map-based interface, while managers use reporting views to compare route efficiency and driver performance. The platform uses a streaming backend with Kafka, a time-series store for telemetry, and relational data for business records, making it suitable for both live operations and historical analysis. Predictive ETA models and route recommendations improve customer communication and help teams avoid avoidable detours. Overall, FleetTrack replaces manual fleet tracking with a clearer, data-driven workflow that improves delivery reliability and lowers operating costs.
`,
    whatIs: "A logistics analytics dashboard for monitoring fleet movement, route performance, and live delivery status.",
    whyDeveloped: "To replace manual fleet tracking with live visibility and predictive operational insights.",
    businessValue: "Reduces fuel cost, improves delivery reliability, and gives operations teams actionable routing data.",
    challengeBefore: "Dispatch teams lacked live route visibility and could not react quickly to delays or inefficient routing.",
    features: ["Live route tracking", "Predictive ETA", "Route optimization", "Fleet heatmaps", "Event alerts", "Historical playback"],
    outcomes: ["Fuel savings", "Faster delivery ETAs", "Lower failed delivery rates"],
    relatedSlugs: ["travelcore-booking-hub", "buildops-erp-lite"],
    stack: ["Next.js", "NestJS", "Kafka", "TimescaleDB"],
    results: ["31% fuel savings", "28% faster delivery ETA"],
    color: "from-indigo-600 to-blue-500",
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
    },  },
  {
    slug: "learnedge-lms",
    name: "LearnEdge LMS",
    type: "Education Platform",
    summary: `LearnEdge LMS is a learning management platform built for private institutes and training organizations that need structured courses, assessments, and progress tracking in one place. It gives instructors tools to build lessons, quizzes, and assignments while providing learners with a clean, mobile-friendly dashboard for following courses and checking progress. The platform also supports analytics so staff can identify students who need help and understand where courses lose engagement. Built with React, Node.js, MongoDB, and AWS S3, it balances performance with reliable content delivery. Role-based access keeps instructor, admin, and learner workflows separate, while SSO and integration options make it easier to adopt in institutional environments. LearnEdge helps education providers deliver more organized digital learning, reduce manual administration, and improve course completion without adding complexity to the teaching process.
`,
    whatIs: "A learning platform that helps institutions create, deliver, and analyze online and blended courses.",
    whyDeveloped: "To give private institutes a flexible LMS with learner analytics and instructor productivity tools.",
    businessValue: "Improves course completion, reduces admin effort, and supports scalable digital education.",
    challengeBefore: "Institutes were managing classes, content, and assessments across disconnected tools.",
    features: ["Course builder", "Assessments", "Progress analytics", "Live class links", "SSO support", "Gradebook"],
    outcomes: ["Higher completion rates", "Less grading effort", "Better student engagement"],
    relatedSlugs: ["medflow-clinic-portal", "buildops-erp-lite"],
    stack: ["React", "Node.js", "MongoDB", "AWS S3"],
    results: ["3x course completion", "18k active learners"],
    color: "from-sky-600 to-blue-500",
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
    },  },
  {
    slug: "buildops-erp-lite",
    name: "BuildOps ERP Lite",
    type: "Construction Operations",
    summary: `BuildOps ERP Lite is a construction operations platform for teams that need budgeting, procurement, and workforce scheduling without the complexity of a full enterprise ERP. It helps managers track project costs, purchase orders, materials, and crew allocation in a single workflow that is easier to maintain than spreadsheets. Field staff can log time, verify progress, and keep updates flowing from the job site, while managers get better visibility into budget variance and resource use. The platform uses Vue, Laravel, MySQL, and API-based integrations to connect with accounting and payroll systems. Its lightweight design makes it practical for mid-sized construction teams that want stronger control over purchasing, labor, and reporting without slowing down day-to-day work. BuildOps reduces manual coordination, improves operational clarity, and supports better cost control across active projects.
`,
    whatIs: "An ERP-lite system for construction teams to manage jobs, procurement, labour, and reporting.",
    whyDeveloped: "To replace spreadsheets and disconnected tools with a more controlled operational workflow.",
    businessValue: "Reduces waste, improves budget control, and helps managers schedule crews more accurately.",
    challengeBefore: "Construction teams were tracking budgets, materials, and crews manually across spreadsheets.",
    features: ["Budget tracking", "Purchase orders", "Crew scheduling", "Time entry", "Approvals", "Operational reporting"],
    outcomes: ["Reduced cost leakage", "Faster reporting", "Better procurement control"],
    relatedSlugs: ["fleettrack-analytics", "travelcore-booking-hub"],
    stack: ["Vue", "Laravel", "MySQL", "Docker"],
    results: ["25% cost leakage reduction", "40% faster reporting"],
    color: "from-blue-700 to-indigo-600",
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
    },  },
  {
    slug: "travelcore-booking-hub",
    name: "TravelCore Booking Hub",
    type: "Travel Reservation App",
    summary: `TravelCore Booking Hub is a travel reservation platform created to simplify booking for agencies, tour operators, and travel marketplaces. It brings together package building, supplier coordination, and payment handling so users can create and purchase travel plans in one flow. The system helps operators manage fragmented supplier data, inconsistent inventory, and complex package pricing by centralizing the booking process. Travelers can assemble flights, accommodation, transfers, and activities into a single itinerary with clearer pricing and fewer steps. Built with React, Node.js, and cloud-based media delivery, TravelCore balances fast search experiences with the operational needs of partners and suppliers. The platform also supports payment processing, confirmations, and booking reconciliation, giving teams a more reliable way to sell and manage trips while improving the customer experience and reducing support overhead.
`,
    whatIs: "A travel booking platform for building packages, managing reservations, and coordinating partners.",
    whyDeveloped: "To simplify fragmented travel booking processes and improve conversion through clearer checkout.",
    businessValue: "Increases booking conversion, reduces support load, and makes packaging easier to sell.",
    challengeBefore: "Operators were handling inventory, suppliers, and pricing through disconnected booking tools.",
    features: ["Package builder", "Booking engine", "Payment gateway", "Partner management", "Supplier reconciliation", "Voucher generation"],
    outcomes: ["Higher conversion", "Fewer support tickets", "Cleaner booking operations"],
    relatedSlugs: ["lankacart-commerce-suite", "fleettrack-analytics"],
    stack: ["React", "Express", "MongoDB", "Cloudinary"],
    results: ["2.1x conversion growth", "35% fewer support tickets"],
    color: "from-cyan-500 to-blue-600",
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
    },  },

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
