import { ObjectId } from "mongodb";
import { createProject } from "./projects.js";
import { createTask } from "./tasks.js";
import { getCollection } from "./mongodb.js";

export class ProjectPlanError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "ProjectPlanError";
    this.status = status;
    this.expose = true;
  }
}

const CURRENCY = "LKR";

// ---------------------------------------------------------------------------
// Pricing configuration — single source of truth for estimates. All amounts
// are in LKR. Gemini never invents prices; it only supplies the scope
// (pages/features/complexity/timeline) and the service computes numbers.
// ---------------------------------------------------------------------------

export const PRICING_CONFIG = {
  currency: CURRENCY,
  standardPageCost: 12000,
  defaultFeatureCost: 15000,
  complexityMultipliers: { low: 1, medium: 1.25, high: 1.6 },
  rushMultiplier: 1.12,
  pageCosts: {
    homepage: 20000,
    landing: 14000,
    "product-listing": 18000,
    "product-detail": 16000,
    cart: 14000,
    checkout: 16000,
    blog: 15000,
    portfolio: 15000,
    gallery: 14000,
    services: 12000,
    about: 8000,
    contact: 8000,
    menu: 10000,
    team: 8000,
    testimonials: 8000,
    faq: 8000,
    privacy: 4000,
    terms: 4000,
    search: 10000,
    booking: 14000,
    schedule: 12000,
    courses: 14000,
    listings: 16000,
    events: 12000,
    news: 14000,
    locations: 10000,
  },
  pageEffortDays: {
    homepage: 1.5,
    landing: 1,
    "product-listing": 1.5,
    "product-detail": 1,
    cart: 1,
    checkout: 1.5,
    blog: 1.5,
    portfolio: 1.25,
    gallery: 1,
    services: 1,
    about: 0.75,
    contact: 0.75,
    menu: 0.75,
    team: 0.75,
    testimonials: 0.75,
    faq: 0.75,
    privacy: 0.25,
    terms: 0.25,
    search: 1,
    booking: 1.25,
    schedule: 1,
    courses: 1.25,
    listings: 1.25,
    events: 1,
    news: 1.25,
    locations: 0.75,
  },
};

export const FEATURE_LIBRARY = {
  "responsive-mobile": { name: "Responsive / mobile-first design", cost: 0, effortDays: 0, reason: "Essential — every NexCode site is built mobile-first." },
  "seo-basics": { name: "SEO basics", cost: 8000, effortDays: 0.75, reason: "Meta tags, sitemap and structured data so the site is findable on Google." },
  "google-maps": { name: "Google Maps integration", cost: 6000, effortDays: 0.5, reason: "Helps customers find and reach the physical location." },
  "whatsapp-contact": { name: "WhatsApp contact button", cost: 4000, effortDays: 0.25, reason: "Sri Lankan customers expect quick WhatsApp communication." },
  "social-links": { name: "Social media links", cost: 4000, effortDays: 0.25, reason: "Connects the site to the brand's social channels." },
  testimonials: { name: "Testimonials / reviews", cost: 8000, effortDays: 0.5, reason: "Social proof builds trust and improves conversion." },
  gallery: { name: "Photo / video gallery", cost: 10000, effortDays: 0.75, reason: "Showcases products, food, spaces or work in an attractive way." },
  "opening-hours": { name: "Opening hours section", cost: 3000, effortDays: 0.25, reason: "Reduces enquiries about basic operational information." },
  reservation: { name: "Online reservation / booking", cost: 30000, effortDays: 2, reason: "Lets customers reserve tables or slots without a phone call." },
  "online-ordering": { name: "Online ordering", cost: 45000, effortDays: 3, reason: "Allows customers to order online and can grow revenue." },
  "payment-gateway": { name: "Payment gateway", cost: 35000, effortDays: 2, reason: "Enables online payments for orders, bookings or purchases." },
  "auth-login": { name: "User login / authentication", cost: 30000, effortDays: 2, reason: "Needed for accounts, orders, or private content." },
  "cms-admin": { name: "CMS / admin panel", cost: 60000, effortDays: 4, reason: "Lets the client update content without developer help." },
  "blog-cms": { name: "Blog / news management", cost: 25000, effortDays: 1.5, reason: "Keeps content fresh and improves SEO." },
  newsletter: { name: "Newsletter signup", cost: 12000, effortDays: 0.75, reason: "Builds a repeat-customer mailing list." },
  "multi-language": { name: "Multi-language support", cost: 30000, effortDays: 2, reason: "Reaches a wider audience (e.g. Sinhala, Tamil, English)." },
  "live-chat": { name: "Live chat widget", cost: 20000, effortDays: 1, reason: "Answers customer questions in real time." },
  animations: { name: "Custom animations", cost: 20000, effortDays: 1.5, reason: "Adds polish and a premium feel when used sparingly." },
  "video-integration": { name: "Video integration", cost: 10000, effortDays: 0.5, reason: "Embedded tours, demos or promotional videos." },
  "contact-form": { name: "Contact / enquiry form", cost: 6000, effortDays: 0.5, reason: "A clean way to capture enquiries (with spam protection)." },
  search: { name: "Site search", cost: 12000, effortDays: 1, reason: "Helps visitors find products or content quickly." },
  "newsletter-cta": { name: "Newsletter call-to-action", cost: 8000, effortDays: 0.5, reason: "Encourages signups from key pages." },
  "delivery-tracking": { name: "Order / delivery tracking", cost: 25000, effortDays: 1.5, reason: "Keeps customers informed after purchase." },
  "inventory-admin": { name: "Inventory / product admin", cost: 35000, effortDays: 2.5, reason: "Manage products, stock and pricing." },
};

// Map of synonyms -> canonical feature id. Unknown features fall back to a
// default custom feature cost so the plan still covers them.
const FEATURE_ALIASES = {
  "responsive": "responsive-mobile",
  "mobile": "responsive-mobile",
  "responsive design": "responsive-mobile",
  "mobile friendly": "responsive-mobile",
  "seo": "seo-basics",
  "search engine optimization": "seo-basics",
  "google seo": "seo-basics",
  "maps": "google-maps",
  "google map": "google-maps",
  "location map": "google-maps",
  "whatsapp": "whatsapp-contact",
  "whatsapp button": "whatsapp-contact",
  "social media": "social-links",
  "social links": "social-links",
  "social": "social-links",
  "testimonial": "testimonials",
  "reviews": "testimonials",
  "review": "testimonials",
  "gallery": "gallery",
  "photo gallery": "gallery",
  "image gallery": "gallery",
  "opening hours": "opening-hours",
  "working hours": "opening-hours",
  "reservation": "reservation",
  "booking": "reservation",
  "reservations": "reservation",
  "bookings": "reservation",
  "table booking": "reservation",
  "online reservation": "reservation",
  "online ordering": "online-ordering",
  "online order": "online-ordering",
  "ordering": "online-ordering",
  "order online": "online-ordering",
  "delivery": "delivery-tracking",
  "payment gateway": "payment-gateway",
  "online payment": "payment-gateway",
  "card payment": "payment-gateway",
  "pay online": "payment-gateway",
  "login": "auth-login",
  "authentication": "auth-login",
  "user accounts": "auth-login",
  "user account": "auth-login",
  "cms": "cms-admin",
  "admin panel": "cms-admin",
  "admin": "cms-admin",
  "content management": "cms-admin",
  "blog": "blog-cms",
  "news blog": "blog-cms",
  "newsletter": "newsletter",
  "mailing list": "newsletter",
  "multi language": "multi-language",
  "multi-language": "multi-language",
  "bilingual": "multi-language",
  "sinhala": "multi-language",
  "tamil": "multi-language",
  "chat": "live-chat",
  "live chat": "live-chat",
  "chat widget": "live-chat",
  "animation": "animations",
  "animations": "animations",
  "video": "video-integration",
  "contact form": "contact-form",
  "enquiry form": "contact-form",
  "inquiry form": "contact-form",
  "search": "search",
  "site search": "search",
  "inventory": "inventory-admin",
  "product admin": "inventory-admin",
  "order tracking": "delivery-tracking",
};

const EXPENSE_CATEGORY = {
  domain: "Infrastructure",
  hosting: "Infrastructure",
  storage: "Storage",
  email: "Services",
  ssl: "Infrastructure",
  maps: "Third-party APIs",
  payments: "Third-party APIs",
  integrations: "Third-party APIs",
  backup: "Infrastructure",
};

// Estimated planned expenses (LKR). These are estimates shown in the plan and
// stored as PLANNED expenses — never as actual recorded expenses.
export const EXPENSES_CONFIG = {
  domain: { item: "Domain name", cost: 4500, frequency: "per year", category: EXPENSE_CATEGORY.domain, notes: "e.g. .com / .lk registration." },
  hosting: { item: "Web hosting", cost: 12000, frequency: "per year", category: EXPENSE_CATEGORY.hosting, notes: "Shared/VPS hosting with SSL certificate included." },
  hostingComplex: { item: "Web hosting (e-commerce / high traffic)", cost: 24000, frequency: "per year", category: EXPENSE_CATEGORY.hosting, notes: "Higher-tier plan with more resources." },
  email: { item: "Business email service", cost: 5000, frequency: "per year", category: EXPENSE_CATEGORY.email, notes: "Professional email at the client's domain." },
  ssl: { item: "SSL certificate", cost: 0, frequency: "per year", category: EXPENSE_CATEGORY.ssl, notes: "Included with hosting." },
  storage: { item: "Image / cloud storage", cost: 6000, frequency: "per year", category: EXPENSE_CATEGORY.storage, notes: "Storage and CDN for images/videos." },
  maps: { item: "Google Maps API", cost: 6000, frequency: "per year", category: EXPENSE_CATEGORY.maps, notes: "Only if the site uses Maps." },
  payments: { item: "Payment gateway", cost: 0, frequency: "per year", category: EXPENSE_CATEGORY.payments, notes: "Setup may be free; per-transaction fees apply (e.g. 2–3%)." },
  integrations: { item: "Third-party API subscriptions", cost: 8000, frequency: "per year", category: EXPENSE_CATEGORY.integrations, notes: "Newsletter, chat, booking or automation tools." },
  backup: { item: "Backup & monitoring", cost: 3000, frequency: "per year", category: EXPENSE_CATEGORY.backup, notes: "Scheduled backups and uptime monitoring." },
};

// ---------------------------------------------------------------------------
// Industry knowledge — keyword detection -> recommended/optional scope
// ---------------------------------------------------------------------------

export const INDUSTRY_KNOWLEDGE = {
  "coffee-shop": {
    name: "Coffee Shop / Restaurant",
    keywords: ["coffee", "cafe", "café", "restaurant", "bakery", "pizza", "food", "menu", "dining", "takeaway", "juice", "tea", "dessert"],
    recommendedPages: ["gallery", "testimonials", "locations"],
    recommendedFeatures: ["reservation", "google-maps", "whatsapp-contact", "opening-hours", "social-links", "seo-basics"],
    optionalFeatures: ["online-ordering", "payment-gateway", "delivery-tracking", "multi-language", "animations"],
  },
  "ecommerce": {
    name: "E-commerce / Online Store",
    keywords: ["shop", "store", "ecommerce", "e-commerce", "commerce", "sell", "product", "shopping", "online store", "retail"],
    recommendedPages: ["product-listing", "product-detail", "cart", "checkout", "blog"],
    recommendedFeatures: ["payment-gateway", "inventory-admin", "newsletter", "whatsapp-contact", "seo-basics", "search"],
    optionalFeatures: ["auth-login", "delivery-tracking", "multi-language", "animations", "cms-admin"],
  },
  "portfolio": {
    name: "Portfolio / Creative",
    keywords: ["portfolio", "photographer", "artist", "designer", "creative", "freelance", "showcase", "photography"],
    recommendedPages: ["gallery", "about", "testimonials", "blog"],
    recommendedFeatures: ["gallery", "seo-basics", "social-links", "whatsapp-contact", "animations"],
    optionalFeatures: ["multi-language", "video-integration", "blog-cms"],
  },
  "corporate": {
    name: "Corporate / Business",
    keywords: ["corporate", "business", "company", "agency", "firm", "services", "consulting", "professional", "b2b"],
    recommendedPages: ["services", "about", "team", "testimonials", "blog"],
    recommendedFeatures: ["contact-form", "google-maps", "seo-basics", "whatsapp-contact", "social-links"],
    optionalFeatures: ["cms-admin", "multi-language", "live-chat", "blog-cms"],
  },
  "real-estate": {
    name: "Real Estate",
    keywords: ["real estate", "property", "apartment", "villa", "house", "estate", "land", "agent", "rent"],
    recommendedPages: ["listings", "gallery", "about", "locations"],
    recommendedFeatures: ["search", "google-maps", "contact-form", "whatsapp-contact", "testimonials", "seo-basics"],
    optionalFeatures: ["multi-language", "video-integration", "animations"],
  },
  "education": {
    name: "Education / Training",
    keywords: ["school", "academy", "institute", "training", "course", "education", "tuition", "class", "learning"],
    recommendedPages: ["courses", "about", "testimonials", "blog"],
    recommendedFeatures: ["contact-form", "whatsapp-contact", "seo-basics", "social-links", "newsletter"],
    optionalFeatures: ["payment-gateway", "auth-login", "multi-language", "cms-admin"],
  },
  "health": {
    name: "Health / Wellness",
    keywords: ["clinic", "doctor", "hospital", "dental", "physio", "physiotherapy", "ayurveda", "wellness", "spa", "salon", "medical", "beauty"],
    recommendedPages: ["services", "team", "testimonials", "locations"],
    recommendedFeatures: ["booking", "google-maps", "whatsapp-contact", "seo-basics", "opening-hours"],
    optionalFeatures: ["payment-gateway", "auth-login", "multi-language"],
  },
  "blog": {
    name: "Blog / News",
    keywords: ["blog", "news", "magazine", "article", "content", "write", "journal"],
    recommendedPages: ["blog", "about", "news"],
    recommendedFeatures: ["blog-cms", "newsletter", "seo-basics", "social-links"],
    optionalFeatures: ["auth-login", "multi-language", "search"],
  },
  "event": {
    name: "Events / Entertainment",
    keywords: ["event", "wedding", "concert", "festival", "party", "dj", "entertainment", "ticket", "function"],
    recommendedPages: ["events", "gallery", "testimonials", "booking"],
    recommendedFeatures: ["booking", "gallery", "google-maps", "whatsapp-contact", "social-links"],
    optionalFeatures: ["payment-gateway", "video-integration", "multi-language"],
  },
  "fitness": {
    name: "Fitness / Gym",
    keywords: ["gym", "fitness", "yoga", "trainer", "workout", "health club", "pilates"],
    recommendedPages: ["schedule", "gallery", "testimonials", "about"],
    recommendedFeatures: ["schedule", "booking", "whatsapp-contact", "google-maps", "seo-basics"],
    optionalFeatures: ["payment-gateway", "auth-login", "multi-language"],
  },
  "travel": {
    name: "Travel / Tourism",
    keywords: ["travel", "tour", "hotel", "resort", "tourism", "holiday", "vacation", "backpacker", "homestay", "tourist"],
    recommendedPages: ["listings", "gallery", "testimonials", "booking"],
    recommendedFeatures: ["booking", "google-maps", "whatsapp-contact", "multi-language", "seo-basics"],
    optionalFeatures: ["payment-gateway", "reviews", "video-integration"],
  },
  "generic": {
    name: "Website",
    keywords: [],
    recommendedPages: ["about", "gallery", "testimonials", "contact"],
    recommendedFeatures: ["contact-form", "google-maps", "whatsapp-contact", "seo-basics"],
    optionalFeatures: ["cms-admin", "animations", "multi-language"],
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const PAGE_NAME_ALIASES = {
  home: "homepage",
  homepage: "homepage",
  "home page": "homepage",
  "main page": "homepage",
  landing: "landing",
  "landing page": "landing",
  about: "about",
  "about us": "about",
  "about-us": "about",
  contact: "contact",
  "contact us": "contact",
  "contact-us": "contact",
  menu: "menu",
  "menu section": "menu",
  "food menu": "menu",
  gallery: "gallery",
  "photo gallery": "gallery",
  "image gallery": "gallery",
  services: "services",
  "services page": "services",
  portfolio: "portfolio",
  "our work": "portfolio",
  work: "portfolio",
  "case studies": "portfolio",
  blog: "blog",
  news: "news",
  "news page": "news",
  testimonials: "testimonials",
  reviews: "testimonials",
  team: "team",
  "our team": "team",
  faq: "faq",
  "faqs": "faq",
  "frequently asked questions": "faq",
  privacy: "privacy",
  "privacy policy": "privacy",
  terms: "terms",
  "terms of service": "terms",
  search: "search",
  "search page": "search",
  products: "product-listing",
  "product listing": "product-listing",
  shop: "product-listing",
  "product page": "product-detail",
  cart: "cart",
  "shopping cart": "cart",
  checkout: "checkout",
  "checkout page": "checkout",
  booking: "booking",
  reservations: "booking",
  "reservation page": "booking",
  schedule: "schedule",
  "class schedule": "schedule",
  "timetable": "schedule",
  courses: "courses",
  "courses page": "courses",
  programs: "courses",
  listings: "listings",
  properties: "listings",
  "property listings": "listings",
  locations: "locations",
  "our locations": "locations",
  "find us": "locations",
  events: "events",
  "events page": "events",
  store: "product-listing",
  "online store": "product-listing",
};

const PAGE_DISPLAY = {
  homepage: "Homepage",
  landing: "Landing page",
  about: "About Us",
  contact: "Contact Us",
  menu: "Menu",
  gallery: "Gallery",
  services: "Services",
  portfolio: "Portfolio",
  blog: "Blog",
  news: "News",
  testimonials: "Testimonials",
  team: "Team",
  faq: "FAQ",
  privacy: "Privacy Policy",
  terms: "Terms of Service",
  search: "Search",
  "product-listing": "Product Listing",
  "product-detail": "Product Detail",
  cart: "Cart",
  checkout: "Checkout",
  booking: "Booking",
  schedule: "Schedule",
  courses: "Courses",
  listings: "Listings",
  locations: "Locations",
  events: "Events",
};

export function detectIndustryType(idea) {
  const text = normalize(idea);
  let best = null;
  let bestScore = 0;
  for (const [key, industry] of Object.entries(INDUSTRY_KNOWLEDGE)) {
    if (key === "generic") continue;
    let score = 0;
    for (const keyword of industry.keywords) {
      const kw = normalize(keyword);
      if (text.includes(kw)) score += kw.split(" ").length > 1 ? 2 : 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = key;
    }
  }
  return best || "generic";
}

// Pages safe to auto-detect from the idea text (high-signal words only).
const AUTO_SCAN_PAGES = new Set([
  "homepage",
  "landing",
  "about",
  "contact",
  "menu",
  "gallery",
  "services",
  "portfolio",
  "blog",
  "news",
  "testimonials",
  "team",
  "faq",
  "privacy",
  "terms",
  "cart",
  "checkout",
  "booking",
  "schedule",
  "courses",
  "events",
  "locations",
  "search",
]);

export function extractRequestedPages(idea, requestedPages = []) {
  const pages = new Set();
  for (const raw of Array.isArray(requestedPages) ? requestedPages : []) {
    const key = PAGE_NAME_ALIASES[normalize(raw)] || normalize(raw);
    if (key) pages.add(key);
  }
  const text = ` ${normalize(idea)} `;
  for (const [alias, key] of Object.entries(PAGE_NAME_ALIASES)) {
    if (AUTO_SCAN_PAGES.has(key) && alias.split(" ").length === 1 && text.includes(` ${alias} `)) pages.add(key);
  }
  return [...pages];
}

export function deriveProjectName(idea, industryType) {
  let text = String(idea || "").replace(/\s+/g, " ").trim();
  const sentenceEnd = text.search(/[.;:!?]| with | and it | that | which | in \d| for /i);
  if (sentenceEnd > 0) text = text.slice(0, sentenceEnd);
  text = text
    .replace(/^(i|we|you|they)\s+(need|want|would\s+like|need\s+to|would\s+love|plan|are\s+looking)\s+(to\s+)?/i, "")
    .replace(/^(please\s+)?(create|build|make|develop|design|set\s+up|start)\s+(a\s+|an\s+|the\s+)?/i, "")
    .replace(/^(a|an|the)\s+/i, "")
    .replace(/\s+(website|web\s+site|webpage|site|app|application)\s*$/i, "")
    .trim();
  const words = text.split(" ").filter(Boolean).slice(0, 5);
  const base = words.length ? words.join(" ") : INDUSTRY_KNOWLEDGE[industryType]?.name || "New Website";
  const capitalized = base
    .split(" ")
    .map((w) => (w.length > 2 || ["us", "i"].includes(w.toLowerCase()) ? w.charAt(0).toUpperCase() + w.slice(1) : w))
    .join(" ");
  return /website|site|web$/i.test(capitalized) ? capitalized : `${capitalized} Website`;
}

function pageKey(raw) {
  return PAGE_NAME_ALIASES[normalize(raw)] || normalize(raw) || "homepage";
}

function pageDisplay(key) {
  return PAGE_DISPLAY[key] || key.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function pageCost(key, complexityMultiplier) {
  const base = PRICING_CONFIG.pageCosts[key] || PRICING_CONFIG.standardPageCost;
  return Math.round(base * complexityMultiplier);
}

function pageEffort(key) {
  return PRICING_CONFIG.pageEffortDays[key] ?? 1;
}

function featureById(id) {
  return FEATURE_LIBRARY[id] || null;
}

function resolveFeature(name) {
  const norm = normalize(name);
  const direct = FEATURE_LIBRARY[norm];
  if (direct) return { id: norm, ...direct };
  const aliased = FEATURE_ALIASES[norm];
  if (aliased) return { id: aliased, ...FEATURE_LIBRARY[aliased] };
  return {
    id: `custom-${norm || "feature"}`,
    name: String(name || "Custom feature").trim(),
    cost: PRICING_CONFIG.defaultFeatureCost,
    effortDays: 1,
    reason: "Custom feature as requested.",
  };
}

function toTitleCase(value) {
  return String(value || "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatLKR(amount) {
  return `LKR ${Number(amount || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;
}

// ---------------------------------------------------------------------------
// Feature / scope recommendation
// ---------------------------------------------------------------------------

export function recommendFeatures(industryType, requestedPages = [], requestedFeatures = []) {
  const industry = INDUSTRY_KNOWLEDGE[industryType] || INDUSTRY_KNOWLEDGE.generic;
  const requestedFeatureIds = new Set();
  for (const raw of Array.isArray(requestedFeatures) ? requestedFeatures : []) {
    const resolved = resolveFeature(raw);
    requestedFeatureIds.add(resolved.id);
  }

  const recommendedPages = [];
  const pageSet = new Set(requestedPages);
  for (const key of industry.recommendedPages) {
    if (!pageSet.has(key) && !recommendedPages.some((p) => p.key === key)) {
      recommendedPages.push({ key, name: pageDisplay(key), reason: recommendationReason(key) });
    }
  }

  const recommendedFeatures = [];
  const recommendedFeaturesSet = new Set();
  for (const id of industry.recommendedFeatures) {
    const feature = featureById(id);
    if (!feature || requestedFeatureIds.has(id) || recommendedFeaturesSet.has(id)) continue;
    recommendedFeaturesSet.add(id);
    recommendedFeatures.push({ id, name: feature.name, cost: feature.cost, effortDays: feature.effortDays, reason: feature.reason });
  }

  const optionalFeatures = [];
  for (const id of industry.optionalFeatures) {
    const feature = featureById(id);
    if (!feature || requestedFeatureIds.has(id) || recommendedFeaturesSet.has(id)) continue;
    optionalFeatures.push({ id, name: feature.name, cost: feature.cost, effortDays: feature.effortDays, reason: feature.reason });
  }

  return { recommendedPages, recommendedFeatures, optionalFeatures };
}

function recommendationReason(pageKey) {
  const reasons = {
    gallery: "Visual proof of your product, food or work sells better than text.",
    testimonials: "Customer reviews build trust and improve conversion.",
    locations: "Shows exactly where customers can find you.",
    about: "Tells your story and builds a personal connection.",
    blog: "Fresh content improves SEO and keeps the site alive.",
    services: "Clearly explains what you offer and how.",
    team: "People trust businesses they can see.",
    faq: "Answers common questions and reduces enquiries.",
    contact: "A clear path for customers to reach you.",
    "product-listing": "Organized way to browse products.",
    "product-detail": "Deep product information that drives purchases.",
    cart: "Essential for any online purchase flow.",
    checkout: "Converts browsing into paying customers.",
    news: "Keeps visitors updated and improves SEO.",
    portfolio: "Shows past work to win new clients.",
    search: "Lets visitors find content or products fast.",
    privacy: "Legally expected on most websites.",
    terms: "Legally expected on most websites.",
    booking: "Lets customers reserve without a phone call.",
    schedule: "Shows availability at a glance.",
    courses: "Presents programs clearly to prospective students.",
    listings: "Organized way to present properties or packages.",
    events: "Publicizes upcoming dates and activities.",
  };
  return reasons[pageKey] || "A valuable addition for this type of business.";
}

// ---------------------------------------------------------------------------
// Pricing
// ---------------------------------------------------------------------------

export function estimatePricing({ pages = [], features = [], complexity = "medium", timelineDays, estimatedDays }) {
  const multiplier = PRICING_CONFIG.complexityMultipliers[complexity] || PRICING_CONFIG.complexityMultipliers.medium;
  const pageBreakdown = pages.map((p) => ({ name: pageDisplay(p), cost: pageCost(p, multiplier) }));
  const basePrice = pageBreakdown.reduce((sum, p) => sum + p.cost, 0);

  const featureBreakdown = features.map((f) => ({ name: f.name, cost: f.cost }));
  const featureCost = featureBreakdown.reduce((sum, f) => sum + f.cost, 0);

  const optionalCost = (features.filter((f) => f.id && f.id.startsWith("optional-"))).reduce((sum, f) => sum + f.cost, 0);

  const rushed = Number.isFinite(timelineDays) && Number.isFinite(estimatedDays) && timelineDays > 0 && timelineDays < estimatedDays;
  const rushAdjustment = rushed ? Math.round((basePrice + featureCost) * (PRICING_CONFIG.rushMultiplier - 1)) : 0;
  const total = basePrice + featureCost + rushAdjustment;

  return {
    currency: CURRENCY,
    complexity,
    basePrice,
    featureCost,
    rushAdjustment,
    total,
    pageBreakdown,
    featureBreakdown,
    optionalCost,
    rushed,
  };
}

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export function estimateExpenses({ industryType, features = [], pages = [] }) {
  const expenses = [];
  const hasStore = industryType === "ecommerce" || features.some((f) => ["payment-gateway", "inventory-admin", "online-ordering"].includes(f.id));
  const hasMaps = features.some((f) => f.id === "google-maps") || pages.some((p) => p === "locations");
  const hasIntegrations = features.some((f) => ["newsletter", "live-chat", "reservation", "online-ordering", "booking", "delivery-tracking"].includes(f.id));

  const push = (key, cost = EXPENSES_CONFIG[key].cost) => {
    const cfg = EXPENSES_CONFIG[key];
    expenses.push({ item: cfg.item, category: cfg.category, estimatedCost: cost, frequency: cfg.frequency, notes: cfg.notes });
  };

  push("domain");
  push(hasStore ? "hostingComplex" : "hosting");
  push("ssl");
  push("email");
  push("storage");
  if (hasMaps) push("maps");
  if (hasIntegrations) push("integrations");
  if (hasStore) push("payments");
  push("backup");

  return expenses;
}

// ---------------------------------------------------------------------------
// Task generation
// ---------------------------------------------------------------------------

export function generateTasks({ approvedPages = [], approvedFeatures = [] }) {
  const tasks = [];
  let order = 0;
  const add = (title, description, phase, priority, effortDays, estimatedHours) => {
    tasks.push({ title, description, phase, priority, effortDays, estimatedHours, order: order++ });
  };

  add("Requirements analysis", "Clarify goals, content and success criteria with the client.", "Planning", "high", 0.5, 4);
  add("Sitemap & page structure", "Define the sitemap, navigation and page hierarchy.", "Planning", "high", 0.5, 4);
  add("UI/UX design", "Design the visual style, layouts and mobile experience.", "Design", "high", 2, 16);

  for (const key of approvedPages) {
    add(`Build ${pageDisplay(key)} page`, `Develop the ${pageDisplay(key)} with responsive layout and content blocks.`, "Development", "high", pageEffort(key), Math.max(4, Math.round(pageEffort(key) * 8)));
  }

  for (const feature of approvedFeatures) {
    if (feature.id === "responsive-mobile") continue;
    const hours = Math.max(2, Math.round(feature.effortDays * 8));
    add(`Implement ${feature.name}`, `${feature.reason}`, "Development", feature.effortDays >= 2 ? "high" : "medium", feature.effortDays, hours);
  }

  add("Responsive optimization", "Test and polish the layout across phones, tablets and desktops.", "Polish", "high", 0.75, 6);
  add("SEO setup", "Meta tags, sitemap, structured data and basic keyword optimization.", "Polish", "medium", 0.75, 6);
  add("Content & copy polish", "Finalize on-page text, images and calls-to-action.", "Polish", "medium", 0.5, 4);
  add("Testing & QA", "Functional, cross-browser and mobile testing; fix defects.", "QA", "high", 1, 8);
  add("Client review & revisions", "Show the client, collect feedback and apply revisions.", "Delivery", "high", 1, 8);
  add("Deployment & handover", "Deploy to production, configure the domain/email and hand over.", "Delivery", "high", 0.75, 6);

  return tasks;
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export function buildTimeline(tasks, timelineDays) {
  const totalEffort = tasks.reduce((sum, t) => sum + (Number(t.effortDays) || 0), 0);
  const scale = Number.isFinite(timelineDays) && timelineDays > 0 ? timelineDays / Math.max(totalEffort, 0.001) : 1;
  const estimatedDays = Math.max(1, Math.ceil(totalEffort));
  const providedDays = Number.isFinite(timelineDays) && timelineDays > 0 ? Math.round(timelineDays) : null;
  const unrealistic = providedDays !== null && providedDays < estimatedDays;

  // Place each task sequentially (start..end in day units).
  const placed = [];
  let cursor = 1;
  for (const task of tasks) {
    const span = Math.max((Number(task.effortDays) || 0) * scale, 0.35);
    const start = cursor;
    const end = cursor + span;
    placed.push({ task, start, end });
    cursor = end;
  }

  // Group consecutive tasks by phase into day ranges (Planning → Design →
  // Development → Polish → QA → Delivery) so the timeline reads as phases.
  const ranges = [];
  for (const item of placed) {
    const startDay = Math.max(1, Math.ceil(item.start));
    const endDay = Math.max(startDay, Math.ceil(item.end));
    const last = ranges[ranges.length - 1];
    if (last && last.phase === item.task.phase) {
      last.startDay = Math.min(last.startDay, startDay);
      last.endDay = Math.max(last.endDay, endDay);
      last.items.push(item.task);
    } else {
      ranges.push({ phase: item.task.phase, startDay, endDay, items: [item.task] });
    }
  }

  const clamp = providedDays && providedDays >= 1 ? providedDays : Infinity;
  const days = ranges.map((r) => {
    const startDay = Math.max(1, Math.min(r.startDay, clamp));
    const endDay = Math.max(startDay, Math.min(r.endDay, clamp));
    return {
      phase: r.phase,
      dayLabel: startDay === endDay ? `Day ${startDay}` : `Day ${startDay}–${endDay}`,
      dayStart: startDay,
      dayEnd: endDay,
      tasks: r.items.map((t) => ({ title: t.title, phase: t.phase, priority: t.priority, order: t.order })),
      taskCount: r.items.length,
    };
  });

  const warning = unrealistic
    ? `This scope is likely too large for ${providedDays} day${providedDays === 1 ? "" : "s"}. I recommend extending the timeline to at least ${estimatedDays} days, or reducing scope (for example removing optional features).`
    : "";

  // Attach day ranges to tasks for creation
  for (const r of ranges) {
    const startDay = Math.max(1, Math.min(r.startDay, clamp));
    const endDay = Math.max(startDay, Math.min(r.endDay, clamp));
    for (const t of r.items) {
      t.dayStart = startDay;
      t.dayEnd = endDay;
    }
  }

  return {
    providedDays,
    estimatedDays,
    unrealistic,
    warning,
    days,
  };
}

// ---------------------------------------------------------------------------
// Plan assembly
// ---------------------------------------------------------------------------

const ASSUMPTIONS = [
  "Prices are estimates based on the current NexCode pricing configuration and can change with scope.",
  "Expenses are annual estimates; actual costs depend on the providers chosen.",
  "Timeline assumes one developer; more people can shorten the build.",
  "Content, copy and final images are provided by the client unless agreed otherwise.",
  "Recommended features are included in the total; optional features are listed separately.",
];

function cleanStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v).trim()).filter(Boolean);
}

export function buildProjectPlan(input = {}) {
  const src = input && typeof input === "object" ? input : {};
  const idea = String(src.idea || "").trim();
  if (!idea) {
    throw new ProjectPlanError("Please describe your project idea so I can plan it.", 400);
  }
  if (idea.length > 3000) {
    throw new ProjectPlanError("Your project description is too long. Please keep it under 3000 characters.", 400);
  }

  const client = String(src.client || "").trim();
  const requestedPagesRaw = cleanStringArray(src.requestedPages);
  const requestedFeaturesRaw = cleanStringArray(src.requestedFeatures);
  const technologies = cleanStringArray(src.technologies);
  const deadline = typeof src.deadline === "string" && src.deadline.trim() ? src.deadline.trim() : "";
  const timelineDays = Number.isFinite(Number(src.timelineDays)) && Number(src.timelineDays) > 0 ? Math.round(Number(src.timelineDays)) : null;
  const complexity = ["low", "medium", "high"].includes(src.complexity) ? src.complexity : "medium";

  const industryType = detectIndustryType(idea);
  const requestedPages = extractRequestedPages(idea, requestedPagesRaw);
  const requestedFeatureObjs = requestedFeaturesRaw.map(resolveFeature);

  const { recommendedPages, recommendedFeatures, optionalFeatures } = recommendFeatures(industryType, requestedPages, requestedFeaturesRaw);

  const approvedPages = requestedPages.concat(recommendedPages.map((p) => p.key));
  const approvedFeatures = requestedFeatureObjs.concat(recommendedFeatures);

  // Mark optional features (informational; not auto-included).
  const optionalFeatureObjs = optionalFeatures.map((f) => ({ ...f, id: `optional-${f.id}` }));

  const pricing = estimatePricing({
    pages: approvedPages,
    features: approvedFeatures,
    complexity,
    timelineDays,
    estimatedDays: estimateNominalDays(approvedPages, approvedFeatures),
  });

  const tasks = generateTasks({ approvedPages, approvedFeatures });
  const timeline = buildTimeline(tasks, timelineDays);
  const expenses = estimateExpenses({ industryType, features: approvedFeatures, pages: approvedPages });

  const recommendations = buildRecommendations(industryType, recommendedPages, recommendedFeatures, optionalFeatures, timeline, pricing);

  return {
    name: deriveProjectName(idea, industryType),
    description: idea,
    client,
    industryType,
    industryName: INDUSTRY_KNOWLEDGE[industryType]?.name || "Website",
    technologies,
    deadline,
    complexity,
    scope: {
      requestedPages: requestedPages.map((p) => ({ name: pageDisplay(p), key: p })),
      recommendedPages,
      requestedFeatures: requestedFeatureObjs.map((f) => ({ name: f.name, id: f.id, cost: f.cost })),
      recommendedFeatures,
      optionalFeatures: optionalFeatureObjs,
      approvedPages,
      approvedFeatures: approvedFeatures.map((f) => f.name),
    },
    pricing,
    expenses,
    tasks: tasks.map(({ dayStart, dayEnd, ...rest }) => ({ ...rest, dayStart, dayEnd })),
    timeline,
    recommendations,
    assumptions: [...ASSUMPTIONS],
  };
}

function estimateNominalDays(pages, features) {
  let days = 0;
  for (const p of pages) days += pageEffort(p);
  for (const f of features) days += f.effortDays || 0;
  return Math.max(1, Math.ceil(days + 4));
}

function buildRecommendations(industryType, recommendedPages, recommendedFeatures, optionalFeatures, timeline, pricing) {
  const items = [];
  if (industryType !== "generic") {
    items.push(`Your idea fits a ${INDUSTRY_KNOWLEDGE[industryType].name} project — I've tailored the recommendations below to that.`);
  }
  if (recommendedPages.length > 0) {
    items.push(`I recommend ${recommendedPages.length} additional page${recommendedPages.length === 1 ? "" : "s"}: ${recommendedPages.map((p) => p.name).join(", ")}.`);
  }
  if (recommendedFeatures.length > 0) {
    items.push(`Recommended features: ${recommendedFeatures.map((f) => f.name).join(", ")}.`);
  }
  if (optionalFeatures.length > 0) {
    const list = optionalFeatures.map((f) => `${f.name} (+${formatLKR(f.cost)})`).join(", ");
    items.push(`Optional (can increase cost/time — discuss before including): ${list}.`);
  }
  if (timeline.unrealistic) {
    items.push(timeline.warning);
  }
  if (pricing.rushed) {
    items.push(`Because the timeline is tight, I applied a ${Math.round((PRICING_CONFIG.rushMultiplier - 1) * 100)}% rush adjustment to the estimate.`);
  }
  items.push("I won't create anything yet — review the plan and let me know if you'd like changes or if I should create it.");
  return items;
}

// ---------------------------------------------------------------------------
// Creation (only runs after explicit confirmation)
// ---------------------------------------------------------------------------

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function cleanupPartial(projectId) {
  try {
    const tasks = await getCollection("tasks");
    await tasks.deleteMany({ projectId });
  } catch (err) {
    /* best-effort */
  }
  try {
    const planned = await getCollection("plannedexpenses");
    await planned.deleteMany({ projectId });
  } catch (err) {
    /* best-effort */
  }
  try {
    const projects = await getCollection("projects");
    await projects.deleteOne({ _id: new ObjectId(String(projectId)) });
  } catch (err) {
    /* best-effort */
  }
}

export async function createProjectFromPlan(input = {}, user) {
  const plan = buildProjectPlan(input);

  const dueDays = plan.timeline.providedDays || plan.timeline.estimatedDays;
  const projectSummary =
    `AI-planned ${plan.industryName} project. Estimated price ${formatLKR(plan.pricing.total)} over ${plan.timeline.providedDays || plan.timeline.estimatedDays} days. ` +
    `${plan.tasks.length} tasks. ${plan.expenses.length} planned expenses.`;

  let project;
  try {
    project = await createProject(
      {
        name: plan.name,
        client: plan.client || undefined,
        description: plan.description,
        status: "planning",
        priority: plan.timeline.unrealistic ? "high" : "medium",
        startDate: startOfToday().toISOString(),
        dueDate: addDays(startOfToday(), dueDays - 1).toISOString(),
        budget: plan.pricing.total,
        features: plan.scope.approvedPages.map(pageDisplay).concat(plan.scope.approvedFeatures),
        notes: projectSummary,
        tags: [plan.industryType, "ai-planned"],
        color: "#3699f3",
      },
      user
    );
  } catch (err) {
    throw new ProjectPlanError(err?.message || "Could not create the project.", 500);
  }

  const createdId = String(project._id || project.id);
  try {
    for (const task of plan.tasks) {
      await createTask(
        {
          projectId: createdId,
          title: task.title,
          description: task.description,
          status: "todo",
          priority: task.priority,
          startDate: addDays(startOfToday(), (task.dayStart || 1) - 1).toISOString(),
          endDate: addDays(startOfToday(), (task.dayEnd || task.dayStart || 1) - 1).toISOString(),
          estimatedHours: task.estimatedHours,
          notes: `Phase: ${task.phase}`,
        },
        user
      );
    }
  } catch (err) {
    await cleanupPartial(createdId);
    throw new ProjectPlanError("The plan was approved but creating the tasks failed. Nothing was saved — please try again.", 500);
  }

  try {
    const col = await getCollection("plannedexpenses");
    const now = new Date();
    const docs = plan.expenses.map((e) => ({
      projectId: createdId,
      projectName: plan.name,
      item: e.item,
      category: e.category,
      estimatedCost: e.estimatedCost,
      frequency: e.frequency,
      notes: e.notes,
      createdBy: String(user?.uid || user?.id || user?.name || "anon"),
      createdAt: now,
    }));
    if (docs.length > 0) await col.insertMany(docs);
  } catch (err) {
    await cleanupPartial(createdId);
    throw new ProjectPlanError("The project and tasks were created, but saving planned expenses failed. Nothing was saved — please try again.", 500);
  }

  return {
    projectId: createdId,
    projectName: plan.name,
    taskCount: plan.tasks.length,
    plannedExpenseCount: plan.expenses.length,
  };
}

export async function listPlannedExpenses(projectId) {
  const col = await getCollection("plannedexpenses");
  return col.find({ projectId }).sort({ category: 1 }).toArray();
}

export async function deletePlannedExpenses(projectId) {
  const col = await getCollection("plannedexpenses");
  return col.deleteMany({ projectId });
}