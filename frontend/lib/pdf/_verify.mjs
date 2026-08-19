import { buildReportPdf } from "./buildReportPdf.js";

function countPages(buf) {
  const s = buf.toString("latin1");
  // Page objects are exactly "/Type /Page " (not /Pages)
  const m = s.match(/\/Type \/Page /g);
  return m ? m.length : 0;
}

const quotation = {
  documentType: "quotation",
  docNumber: "Q-2024-001",
  content: {
    title: "Web Application Development",
    subtitle: "Prepared by NexCode Digital Innovations",
    documentMeta: {
      docNumber: "Q-2024-001",
      date: "Jan 15, 2024",
      validUntil: "Feb 15, 2024",
      preparedBy: "NexCode Team",
      approvedBy: "NexCode",
    },
    client: { name: "Acme Corporation", company: "Acme Pvt Ltd" },
    project: { name: "NexPortal Dashboard" },
    introduction:
      "We propose to design and develop a modern web application tailored to your operational needs, including responsive UI, authentication, and an admin dashboard with reporting.",
    features: [
      "Responsive front-end built with React and Tailwind CSS",
      "Secure authentication with role-based access control",
      "REST API backend with PostgreSQL persistence",
      "Admin dashboard with analytics and exportable reports",
      "Deployment pipeline with CI/CD and monitoring",
    ],
    items: [
      { description: "Discovery & UX design", qty: 1, unitPrice: 120000, amount: 120000 },
      { description: "Front-end development", qty: 1, unitPrice: 350000, amount: 350000 },
      { description: "Back-end API & database", qty: 1, unitPrice: 400000, amount: 400000 },
      { description: "Admin dashboard", qty: 1, unitPrice: 220000, amount: 220000 },
      { description: "QA, deployment & training", qty: 1, unitPrice: 150000, amount: 150000 },
    ],
    pricing: { subtotal: 1240000, discount: 40000, taxes: 0, total: 1200000 },
    notes: [
      "Prices are exclusive of applicable taxes.",
      "Payment schedule: 50% on commencement, 50% on delivery.",
      "Valid for 30 days from the date of issue.",
    ],
  },
};

const invoice = {
  documentType: "invoice",
  docNumber: "INV-2024-001",
  content: {
    title: "Payment Invoice",
    documentMeta: {
      docNumber: "INV-2024-001",
      invoiceDate: "Jan 20, 2024",
      dueDate: "Feb 20, 2024",
      preparedBy: "NexCode Team",
      approvedBy: "NexCode",
    },
    client: { name: "Acme Corporation", company: "Acme Pvt Ltd" },
    project: { name: "NexPortal Dashboard" },
    items: [
      { description: "Web application development", qty: 1, unitPrice: 1200000, amount: 1200000 },
    ],
    pricing: { subtotal: 1200000, discount: 0, taxes: 0, total: 1200000, paid: 600000, balance: 600000 },
    notes: ["Thank you for your business."],
  },
};

const qBuf = buildReportPdf(quotation);
const iBuf = buildReportPdf(invoice);

console.log("Quotation pages:", countPages(qBuf));
console.log("Invoice pages:", countPages(iBuf));
