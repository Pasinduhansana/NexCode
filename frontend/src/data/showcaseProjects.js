export const showcaseProjects = [
  {
    slug: 'lankacart-commerce-suite',
    name: 'LankaCart Commerce Suite',
    type: 'E-commerce Platform',
    summary: `LankaCart Commerce Suite is a comprehensive, enterprise-capable e-commerce platform purpose-built to help retailers, marketplaces, and brands scale online with confidence. Designed from the ground up for multi-vendor operations, LankaCart combines a modern storefront experience with deep operational features: vendor onboarding and management, flexible product catalogs, advanced pricing rules, inventory orchestration, order lifecycle automation, and integrated payments and tax handling. The project focused on solving real-world pain points for growing retailers — fragmented inventory across suppliers, slow checkout flows, and the operational overhead of reconciling orders, shipping, and returns across multiple partners.

On the frontend, LankaCart delivers a responsive, conversion-optimized storefront built with component-driven React, delivering fast product discovery, faceted search, and personalized merchandising. The design emphasizes clarity and trust: high-fidelity product imagery, streamlined product detail pages, persistent cart previews, and a one‑page checkout optimized for mobile. For vendor experiences, the platform provides secure portals that let merchants manage listings, inventory, shipments, and settlements with role-based access and audit trails. The architecture separates storefront concerns from fulfillment and vendor operations to enable independent scaling of high-traffic catalog reads and transactional write workloads.

Under the hood, the backend is a modular Node.js service layer with REST and GraphQL endpoints that orchestrate inventory state, pricing, promotions, and order workflows. MongoDB serves as the primary document store for product and vendor data, with carefully designed indices and denormalization strategies for fast category and SKU retrieval. Redis is used for high-performance caching and session management, while background workers process tasks such as order routing, payment capture retries, notifications, and vendor settlements. Payment integrations (Stripe and regional gateways) were built with secure PCI-compliant flows and webhooks that reconcile payment events into the order state machine.

Operationally, LankaCart introduced intelligent routing rules to map orders to the appropriate fulfillment source (warehouse, vendor, dropshipper) and to split line items when needed. The system supports configurable shipping rules, label printing workflows, and returns management integrated with the customer portal. Observability was a priority: centralized logging, distributed tracing, and dashboards were added so product, ops, and support teams can quickly triage issues and monitor key metrics like checkout conversion, AOV, and vendor punctuality.

Security, privacy, and compliance were implemented throughout: encryption at rest and in transit, least-privilege service accounts, auditing, and secure vendor onboarding. The platform was deployed in a cloud environment with autoscaling groups and CI/CD pipelines to enable safe releases and blue/green deployments.

In pilot rollouts, LankaCart reduced end-to-end checkout latency and increased repeat purchase rates through faster flows and clearer vendor SLAs, leading to measurable business improvements: faster checkout times, improved fulfillment accuracy, and streamlined vendor reconciliation. The platform’s extensible modular design positions it well for future enhancements like internationalization, marketplace analytics, and advanced merchandising AI features.
`,
    stack: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    results: ['42% faster checkout', '2.4x repeat orders'],
    color: 'from-blue-600 to-cyan-500',
    image: 'https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80'
  },
  {
    slug: 'medflow-clinic-portal',
    name: 'MedFlow Clinic Portal',
    type: 'Healthcare Management',
    summary: `MedFlow Clinic Portal is a secure, clinician-focused healthcare management platform designed to simplify administrative overhead while improving patient care coordination and clinical workflows. The project addressed the fragmented nature of clinic operations— disparate records, manual appointment scheduling, and lack of actionable clinical dashboards—by building an integrated system that centralizes patient records, automates appointment orchestration, and provides role‑based clinical and administrative interfaces.

At the core, MedFlow implements a unified patient record that aggregates demographics, encounter notes, diagnostic history, medications, and attachments such as lab reports and imaging. Clinicians access longitudinal views of each patient with quick pathways for note-taking, prescription management, and referral creation. Appointment orchestration includes an availability-based booking engine, waitlist management, automated reminders (SMS/email), and rules for appointment types and durations. The scheduling module was crafted to minimize administrative friction and reduce no‑shows through confirmations and two‑way rescheduling.

The portal features role-based dashboards: physicians, nurses, front-desk staff, and managers each get contextual workflows and KPIs. Physicians see daily schedules, triage queues, and patient summaries; managers access utilization metrics and appointment throughput data. From a technical perspective, the frontend uses a responsive React SPA with client-side state management tuned for low-latency navigation. The backend is a RESTful Node.js service with PostgreSQL for reliable transactional storage and strong relational modeling for encounters and billing entities. Redis caches frequently accessed schedules and lookup tables to reduce load.

Security and compliance were fundamental design constraints: data encryption, secure authentication (OAuth + MFA for staff), granular access controls, audit logging for record access and edits, and support for exportable audit trails for regulatory requirements. The architecture is deployable across private or public clouds with containerized services, automated backups, and monitoring for uptime and performance.

Integrations were built for labs, imaging vendors, and payment processors to support online payments for co‑pays and invoices. Automated reporting capabilities surface key compliance reports, clinical KPIs, and financial summaries. During pilot deployments at several small clinic networks, MedFlow reduced administrative time for appointment management by over half and improved record retrieval times significantly, enabling clinicians to spend more time with patients. The extensible platform roadmap includes telehealth integrations, patient portal enhancements, and advanced analytics to surface population health insights.
`,
    stack: ['React', 'Express', 'PostgreSQL', 'Redis'],
    results: ['60% lower admin time', '99.9% uptime'],
    color: 'from-cyan-600 to-teal-500',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80'
  },
  {
    slug: 'fleettrack-analytics',
    name: 'FleetTrack Analytics',
    type: 'Logistics Dashboard',
    summary: `FleetTrack Analytics is a data-driven logistics and fleet optimization platform created to provide real-time visibility, predictive ETA modeling, and operational analytics for last‑mile delivery operations. The project’s goal was to transform dispersed telematics data, route information, and delivery events into actionable insights that reduce fuel consumption, improve on‑time delivery, and lower delivery costs for fleet operators.

FleetTrack ingests vehicle telemetry from GPS and telematics devices, driver-reported events, and external data such as traffic and weather. A streaming ingestion pipeline normalizes and enriches events in real time, feeding an event store and time-series database optimized for queries across routes and fleet aggregates. On top of that, the platform runs predictive models that estimate ETAs using historical performance, live traffic patterns, and probabilistic route variance, enabling more accurate customer notifications and dynamic rerouting when incidents occur.

The UX offers dispatchers and operations managers a multi-layered map interface: live vehicle locations, heatmaps of delivery density, and an incident feed for delays or exceptions. Fleet managers use route optimization dashboards to identify suboptimal routing, balance load across drivers, and analyze stop sequencing to reduce idle miles. Drivers receive simplified, turn-by-turn instructions with automated proof-of-delivery capture handled through mobile apps that sync to the central system.

Architecturally, FleetTrack uses a microservices pattern with stream processors (Kafka) for event-driven workflows, a time-series store for telemetry, and a relational store for business entities. Analytical workloads run on a separate analytics cluster to allow complex aggregations without impacting operational latency. Key features include geofencing, geocoding normalization, live ETA predictions, historical journey playback, and cost analytics by route and driver.

Operational tooling emphasizes observability—distributed tracing for event flows, dashboards for throughput and latency, and alerting for device dropouts and abnormal route deviations. Security best practices include secure device provisioning, encrypted communication channels, and access controls for sensitive location data.

Pilot deployments demonstrated measurable improvements: optimized routing reduced fuel usage and emissions, dynamic ETA models increased customer trust, and better exception management lowered failed delivery rates. The platform’s modular design makes it easy to onboard additional data sources, add predictive features like demand forecasting, or integrate with warehouse and order management systems for end-to-end supply chain visibility.
`,
    stack: ['Next.js', 'NestJS', 'Kafka', 'TimescaleDB'],
    results: ['31% fuel savings', '28% faster delivery ETA'],
    color: 'from-indigo-600 to-blue-500',
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80'
  },
  {
    slug: 'learnedge-lms',
    name: 'LearnEdge LMS',
    type: 'Education Platform',
    summary: `LearnEdge LMS is a modern learning management platform tailored for private educational institutes and training organizations seeking to combine instructor-led experiences with rich digital learning content and robust analytics. The platform addresses the complexity of delivering structured courses, tracking learner progress, and providing instructors with actionable insights to improve outcomes.

At its core, LearnEdge supports flexible course structures — modular lessons, quizzes, assignments, and multimedia content. Instructors can author curricula using an intuitive builder, reuse modules across courses, and schedule synchronous sessions alongside asynchronous content. Assessment workflows include auto-graded quizzes, instructor-graded assignments, and rubric-based feedback, with gradebooks and progress trackers that map to custom learning objectives.

For learners, the platform delivers personalized learning paths, progress dashboards, and social features such as discussion boards and peer review. Adaptive sequencing dynamically suggests remedial modules when learners struggle, while badges and achievement systems help motivation and retention. The mobile-friendly interface ensures learners can engage from any device, and offline content syncing keeps progress safe when network connectivity fluctuates.

From a technology standpoint, LearnEdge uses a React frontend for a responsive, accessible interface and a Node.js backend with MongoDB for content and user data. AWS S3 stores media assets with a CDN for performant delivery. Analytics pipelines capture event data—time-on-task, quiz attempts, engagement metrics—and feed into dashboards for instructors and administrators to identify at-risk students, course drop-off points, and content gaps. Role-based access controls secure instructor, admin, and learner scopes, while Single Sign-On (SSO) options support institutional deployments.

Integration capabilities include LMS interoperability (LTI), payment gateways for course purchases, calendar sync for scheduled sessions, and video conferencing links for live classes. The platform emphasizes data privacy and compliance, especially for educational data protections and local requirements.

In pilot programs, LearnEdge improved course completion rates and instructor efficiency by automating grading and surfacing students needing intervention. The design balances pedagogical flexibility with operational workflows—enabling institutes to scale offerings, monetize premium content, and continuously iterate on curriculum using measured engagement data. Future plans include expanded adaptive learning features, deeper analytics for competency-based education, and stronger integrations with accreditation systems.
`,
    stack: ['React', 'Node.js', 'MongoDB', 'AWS S3'],
    results: ['3x course completion', '18k active learners'],
    color: 'from-sky-600 to-blue-500',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    slug: 'buildops-erp-lite',
    name: 'BuildOps ERP Lite',
    type: 'Construction Operations',
    summary: `BuildOps ERP Lite is a streamlined operations platform designed to bring core ERP capabilities to mid-sized construction teams without the complexity and heavy overhead of full enterprise suites. The project was driven by the need for practical construction tools: reliable project budgeting, procurement tracking, resource scheduling, and simple reporting that construction managers and field supervisors can use daily.

The solution focuses on workflows that matter most on construction sites. Project budgeting is itemized at the task level with baseline estimates, committed costs, and change order tracking to prevent scope creep. Procurement workflows include vendor catalogs, purchase orders, receipt confirmations, and three‑way matching against invoices and deliveries. The system also tracks materials consumption relative to plans, helping identify variances early and reduce waste.

Workforce scheduling provides a visual crew planner, shift assignments, and skill tagging to ensure the right technicians are assigned to tasks. Mobile check-ins and timesheets allow field workers to report hours against tasks, upload photos for progress verification, and surface issues from the site. These mobile workflows were designed with low-bandwidth environments in mind and sync reliably when connectivity is restored.

Architecturally, BuildOps ERP Lite uses a pragmatic stack: a Vue.js frontend for responsive operations dashboards and a Laravel backend with MySQL for transactional reliability. APIs expose data for integrations with accounting systems, payroll providers, and supplier portals. Reporting is built around common construction KPIs—cost to complete, schedule variance, and productivity by crew—presented in concise dashboards for project managers and executives.

Operational controls include role-based permissions, approvals for purchase orders and change orders, and audit trails for compliance. Security and data integrity were emphasized so that financial controls and procurement approvals can be enforced.

In early deployments, BuildOps ERP Lite helped teams reduce procurement cycle times by making purchase requests and approvals more transparent, cut material over-ordering through consumption tracking, and improved labor planning with clearer crew visibility. The platform is purposely lightweight and extensible: teams can adopt the core features quickly and incrementally add modules like equipment tracking, subcontractor portals, or deeper financial integrations as they scale.
`,
    stack: ['Vue', 'Laravel', 'MySQL', 'Docker'],
    results: ['25% cost leakage reduction', '40% faster reporting'],
    color: 'from-blue-700 to-indigo-600',
    image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80'
  },
  {
    slug: 'travelcore-booking-hub',
    name: 'TravelCore Booking Hub',
    type: 'Travel Reservation App',
    summary: `TravelCore Booking Hub is a unified reservation platform built to modernize travel bookings for agencies, tour operators, and travel marketplaces. The project solves the typical fragmentation in travel systems—multiple suppliers, inconsistent inventories, and complex package pricing—by providing a coherent package builder, unified booking flow, and partner management capabilities that enable both direct consumers and distribution partners to transact seamlessly.

At the user experience level, TravelCore focuses on simplicity and clarity. Travelers can assemble multi-component itineraries—flights, accommodation, transfers, and activities—into a single package with transparent pricing and optional add-ons. The checkout flow consolidates supplier rules, taxes, and fees into a single, understandable total while offering flexible payment options, including split payments and deposits. The consumer-facing UI emphasizes trust signals, clear cancellation policies, and instant confirmation where supported.

Operationally, the platform includes a robust partner management layer: inventory connectors, rate rules, and commission structures that let operators onboard hotels, activity providers, and third-party distributors. A package builder supports conditional rules (e.g., minimum stay, seasonal pricing) and bundling discounts. The booking engine handles complex fulfillment scenarios, including supplier rebooking, fallback suppliers, and automated voucher generation.

From a technical perspective, TravelCore uses React on the frontend for responsive search and booking flows and Node.js services for orchestration. It employs a mix of real-time API connectors and cached inventories to balance freshness with performance. Cloud storage and CDNs serve media assets, while event-driven workers handle long-running tasks like supplier confirmations, ticketing, and notification dispatch.

The platform emphasizes reliability and observability: retries for flaky supplier APIs, reconciliation jobs to match supplier confirmations with bookings, and dashboards for monitoring booking success rates and partner SLAs. Security best practices cover payment PCI compliance, secure partner API credentials, and rate-limiting to protect supplier endpoints.

Pilot implementations with regional operators showed increased conversion rates due to clearer package pricing and fewer booking drop-offs. TravelCore’s modular design allows operators to adopt core search and booking features quickly and expand into loyalty programs, dynamic packaging, and multi-currency pricing as they grow.
`,
    stack: ['React', 'Express', 'MongoDB', 'Cloudinary'],
    results: ['2.1x conversion growth', '35% fewer support tickets'],
    color: 'from-cyan-500 to-blue-600',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
  }
];
