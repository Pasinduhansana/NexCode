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
import velmoraVideo from "../../assets/velmora_travels/Velmora Travels Intro.mp4";
import velmoraHomefullImg from "../../assets/velmora_travels/homepage_fullscreen.webp";

//Importing Employee Transport Management System assets
import transportHeroImg from "../../assets/transport_powerBi/Seat_allocation.webp";
import transportDataImg from "../../assets/transport_powerBi/dataset.webp";
import transportwindowImg from "../../assets/transport_powerBi/allocation_window.webp";
import transportMobileImg from "../../assets/transport_powerBi/mobile_view.webp";
import transportVideo from "../../assets/transport_powerBi/Transport Intro.mp4";

//Importing LogiManage assets
import logisticDashboardImg from "../../assets/Logistic_project/logistic_Dashboard.webp";
import gateCheckImg from "../../assets/Logistic_project/GateCheck.webp";
import inspectionHistoryImg from "../../assets/Logistic_project/Inspection_History.webp";
import manageOrdersImg from "../../assets/Logistic_project/Manage_Orders.webp";
import newOrderImg from "../../assets/Logistic_project/New_order.webp";
import notificationsImg from "../../assets/Logistic_project/Notifications.webp";
import orderHistoryImg from "../../assets/Logistic_project/Order_History.webp";
import orderTransferImg from "../../assets/Logistic_project/Order_Transfer.webp";
import qualityDashboardImg from "../../assets/Logistic_project/Quality_Dashboard.webp";
import qualityInspectionImg from "../../assets/Logistic_project/Quality_inspection.webp";
import reportExportImg from "../../assets/Logistic_project/Report_export.webp";
import securityCheckImg from "../../assets/Logistic_project/Security_Check.webp";
import securityDashboardImg from "../../assets/Logistic_project/Security_Dashboard.webp";
import userProfileImg from "../../assets/Logistic_project/User_profile.webp";
import mobileCoverImg from "../../assets/Logistic_project/Mobile_Cover.webp";
import laptopCoverImg from "../../assets/Logistic_project/coverpage.webp";
import LogimanageVideo from "../../assets/Logistic_project/LogiManage_intro.mp4";

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

    laptop_mockup: [velmoraHomeImg , velmoraHomeImg],

    phone_mockup: [velmoraMobileImg, velmoraMobileImg],

    resources: {
      images: [
        { url: velmoraHomeImg, caption: "Tourism website Landing page" },
        { url: velmoraAboutImg, caption: "AboutUs Section" },
        { url: velmoraTestimonialImg, caption: "Testimonials" },
        { url: velmoraPackageDetailsImg, caption: "Tour Packages" },
        { url: velmoraFaqImg, caption: "FAQ Section" },
        { url: velmoraPackagesImg, caption: "Tour Packages" },
        { url: velmoraPricesImg, caption: "Pricing Section" },
        { url: velmoraGalleryImg, caption: "Image Gallery" },
        { url: velmoraOffersImg, caption: "Special Offers" },
        { url: velmoraHomefullImg, caption: "Home Page Full Screen Walkthrough" },
        { url: velmoraToursImg, caption: "Tours Section" },
        { url: velmoraContactImg, caption: "Contact Section" },
      ],

      videos: [
        {
          url: velmoraVideo,
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
    whatIs:
      "A modern portfolio website that helps students showcase their skills, projects, achievements, and professional journey.",
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
  {
    slug: "transport-management-powerbi",
    name: "Employee Transport Management System",
    type: "Power BI Business Intelligence Solution",
    summary: `Employee Transport Management System is an enterprise Power BI solution developed by NexCode to streamline employee transportation operations within an organization. The platform centralizes employee records, transport routes, vehicles, drivers, and seat allocations into a unified reporting environment. Interactive dashboards provide real-time visibility into transport utilization, route efficiency, employee assignments, and operational performance. Designed for internal organizational use, the solution enables transport administrators and management teams to make informed decisions through data-driven insights while simplifying day-to-day transport administration.`,

    whatIs:
      "A Power BI solution that manages employee transportation, vehicle assignments, routes, seat allocations, and operational reporting through interactive dashboards.",

    whyDeveloped:
      "To replace manual transport management processes with a centralized, data-driven platform that improves operational efficiency, reporting accuracy, and decision-making.",

    businessValue:
      "Improves transport resource utilization, reduces administrative workload, provides real-time operational insights, and supports informed management decisions.",

    challengeBefore:
      "Employee transport information was managed across multiple spreadsheets and manual processes, making it difficult to track seat allocations, route utilization, employee assignments, and generate reliable management reports.",

    features: [
      "Interactive Power BI dashboards",
      "Employee transport management",
      "Vehicle and driver management",
      "Transport route monitoring",
      "Static employee-to-transport assignment model",
      "Seat allocation tracking",
      "Capacity utilization reporting",
      "Department-wise transport analysis",
      "Operational KPI dashboards",
      "Exportable management reports",
    ],

    outcomes: [
      "Centralized transport data management",
      "Improved reporting accuracy",
      "Faster operational decision-making",
      "Better transport resource utilization",
    ],

    relatedSlugs: ["velmora-travels", "student-portfolio-showcase"],

    stack: [
      "Power BI",
      "Power Query",
      "DAX",
      "SQL",
      "Microsoft Excel",
      "HTML/CSS for embedded dashboards",
    ],

    results: [
      "Automated transport reporting",
      "Centralized employee assignments",
      "Interactive management dashboards",
    ],

    color: "from-blue-600 to-cyan-500",

    cover: transportHeroImg,

    laptop_mockup: [transportHeroImg,transportHeroImg],

    phone_mockup: [transportMobileImg,transportMobileImg],

    resources: {
      images: [
        {
          url: transportHeroImg,
          caption: "Transport Management Dashboard",
        },

        {
          url: transportDataImg,
          caption: "Transport Data Visualization",
        },

        {
          url: transportwindowImg,
          caption: "Power BI Workspace for Seat Allocation",
        },
      ],

      videos: [
        {
          url: transportVideo,
          thumbnail: transportHeroImg,
          caption: "Employee Transport Management System walkthrough",
        },
      ],
    },
  },
  {
    slug: "logimanage",
    name: "LogiManage",
    type: "Logistics Management System",

    summary: `LogiManage is a comprehensive logistics management system developed to streamline shipment operations through a centralized digital platform. The system enables Security Officers, Logistics Officers, and Quality Officers to collaborate efficiently using role-based access control. It manages the complete shipment lifecycle, from request creation and verification to quality inspection and final dispatch. Built with a modern, responsive interface and secure authentication, LogiManage improves operational efficiency, minimizes paperwork, enhances shipment visibility, and ensures seamless coordination between departments.`,

    whatIs:
      "A role-based logistics management system that digitizes shipment management, security verification, and quality inspection through dedicated officer portals.",

    whyDeveloped:
      "To replace manual logistics processes with a centralized digital platform that improves coordination between departments, enhances shipment tracking, and increases operational efficiency.",

    businessValue:
      "Reduces manual paperwork, improves shipment visibility, strengthens security and quality control, increases operational efficiency, and enables faster decision-making through centralized logistics management.",

    challengeBefore:
      "Logistics operations relied heavily on manual records and disconnected workflows, making it difficult to track shipments, coordinate between departments, maintain quality inspections, and ensure secure dispatch processes.",

    features: [
      "Role-based authentication & authorization",
      "Dedicated Security Officer dashboard",
      "Dedicated Logistics Officer dashboard",
      "Dedicated Quality Officer dashboard",
      "Shipment creation and management",
      "Real-time shipment status tracking",
      "Security verification workflow",
      "Quality inspection and approval process",
      "Interactive logistics dashboard",
      "Responsive modern user interface",
      "Secure user management",
      "Notification and status updates",
      "Search and filtering capabilities",
      "Activity history and audit tracking",
    ],

    outcomes: [
      "Improved logistics workflow efficiency",
      "Reduced manual documentation",
      "Enhanced collaboration between departments",
      "Better shipment visibility and tracking",
      "Improved security and quality compliance",
      "Faster shipment processing and approvals",
    ],
    relatedSlugs: ["velmora-travels", "student-portfolio-showcase"],

    stack: ["Power BI", "Power Query", "DAX", "SQL", "Microsoft Excel", "HTML/CSS for embedded dashboards"],

    results: ["Automated transport reporting", "Centralized employee assignments", "Interactive management dashboards"],

    color: "from-blue-600 to-cyan-500",

    cover: laptopCoverImg,

    laptop_mockup: [laptopCoverImg,laptopCoverImg],

    phone_mockup: [mobileCoverImg, mobileCoverImg],

    resources: {
      images: [
        {
          url: logisticDashboardImg,
          caption: "Logistic_dashboard - Logistic Dashboard",
        },
        {
          url: gateCheckImg,
          caption: "Logistic_dashboard - Gate Check",
        },
        {
          url: securityCheckImg,
          caption: "Logistic_dashboard - Security Check",
        },
        {
          url: securityDashboardImg,
          caption: "Logistic_dashboard - Security Dashboard",
        },
        {
          url: manageOrdersImg,
          caption: "Logistic_dashboard - Manage Orders",
        },
        {
          url: newOrderImg,
          caption: "Logistic_dashboard - New Order",
        },
        {
          url: orderHistoryImg,
          caption: "Logistic_dashboard - Order History",
        },
        {
          url: orderTransferImg,
          caption: "Logistic_dashboard - Order Transfer",
        },
        {
          url: notificationsImg,
          caption: "Logistic_dashboard - Notifications",
        },
        {
          url: inspectionHistoryImg,
          caption: "Logistic_dashboard - Inspection History",
        },
        {
          url: qualityDashboardImg,
          caption: "Logistic_dashboard - Quality Dashboard",
        },
        {
          url: qualityInspectionImg,
          caption: "Logistic_dashboard - Quality Inspection",
        },
        {
          url: reportExportImg,
          caption: "Logistic_dashboard - Report Export",
        },
        {
          url: userProfileImg,
          caption: "Logistic_dashboard - User Profile",
        },
      ],

      videos: [
        {
          url: LogimanageVideo,
          thumbnail: laptopCoverImg,
          caption: "LogiManage walkthrough",
        },
      ],
    },
  },
];

