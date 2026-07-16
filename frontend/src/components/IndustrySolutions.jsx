import { motion } from "framer-motion";
import { Utensils, Hotel, Truck, GraduationCap, ShoppingBag, Building2, ArrowRight } from "lucide-react";
//IMport images
import Cafe from "../../assets/Industry_Images/Cafe.webp";
import Hostitality from "../../assets/Industry_Images/Hostitality.webp";
import Logistics from "../../assets/Industry_Images/Logistic.webp";
import Education from "../../assets/Industry_Images/Education.webp";
import Retail from "../../assets/Industry_Images/Retail.webp";
import Office from "../../assets/Industry_Images/Office.webp";

const industries = [
  {
    icon: Utensils,
    title: "Restaurants & Cafés",
    description: "Modern POS systems, order management, inventory tracking, and digital solutions designed for Sri Lankan food businesses.",
    solutions: ["POS Systems", "Inventory Management", "Sales Analytics"],
    image: Cafe,
  },
  {
    icon: Hotel,
    title: "Tourism & Hospitality",
    description: "Booking platforms and digital experiences that help hotels, villas, and tour operators attract more customers.",
    solutions: ["Booking Platforms", "Villa Websites", "Travel Management"],
    image: Hostitality, // villa pool, unmistakably hospitality
  },
  {
    icon: Truck,
    title: "Logistics & Distribution",
    description: "Custom systems that simplify inventory, transportation, delivery tracking, and daily business operations.",
    solutions: ["Inventory Systems", "Fleet Management", "Business Dashboards"],
    image: Logistics,
  },
  {
    icon: GraduationCap,
    title: "Education & Institutes",
    description: "Digital platforms for tuition classes and educational organizations to manage students efficiently.",
    solutions: ["Student Management", "Attendance Tracking", "Payment Systems"],
    image: Education, // classroom/students
  },
  {
    icon: ShoppingBag,
    title: "Retail & E-Commerce",
    description: "Scalable online stores and management systems built for growing Sri Lankan businesses.",
    solutions: ["E-Commerce Platforms", "Customer Management", "Order Processing"],
    image: Retail, // retail checkout / shopping
  },
  {
    icon: Building2,
    title: "SME Business Solutions",
    description: "Custom software solutions that automate workflows and improve productivity for businesses.",
    solutions: ["ERP Systems", "Custom Applications", "Reporting Dashboards"],
    image: Office, // modern office team
  },
];

export default function IndustrySolutions() {
  return (
    <section className="relative w-full overflow-hidden py-16 md:py-28 bg-background">
      {/* Background glow */}
      <div
        className="
        absolute top-20 left-1/2 -translate-x-1/2
        w-[500px] h-[300px] rounded-full
        bg-primary/10 blur-[120px] pointer-events-none
        "
      />

      <div className="relative z-10 max-w-7xl mx-auto px-5 md:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <p className="uppercase tracking-[0.25em] text-primary text-xs font-semibold mb-4">
            Solutions For Every Industry
          </p>

          <h2
            className="section-title mb-4"
            style={{ fontFamily: "'Syne',sans-serif" }}
          >
            Technology Built Around<br className="hidden sm:block" />
            <span className="text-primary"> Your Business</span>
          </h2>

          <p className="section-subtitle mx-auto max-w-2xl">
            From Sri Lankan startups to established businesses, NexCode creates custom digital solutions
            that automate operations, improve efficiency, and help companies grow.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" >
          {industries.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -6 }}
                className="
                group relative rounded-3xl overflow-hidden
                border border-border/60 bg-card
                transition-all duration-500
                hover:border-primary/40
                hover:shadow-2xl hover:shadow-primary/10
                "
              >
                {/* IMAGE ZONE — fully visible, clearly readable */}
                <div className="relative h-48 md:h-52 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="
                    absolute inset-0 w-full h-full object-cover
                    scale-100 group-hover:scale-108
                    transition-transform duration-700 ease-out
                    "
                  />

                  {/* Faint bottom fade only — just enough to seat the icon badge, image stays legible */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/10" />

                  {/* Icon badge, anchored over the image */}
                  <div
                    className="
                    absolute bottom-4 left-5
                    w-11 h-11 rounded-xl
                    flex items-center justify-center
                    bg-white/15 backdrop-blur-md
                    border border-white/25
                    transition-colors duration-300
                    group-hover:bg-primary/25 group-hover:border-primary/50
                    "
                  >
                    <Icon size={20} className="text-white" />
                  </div>
                </div>

                {/* CONTENT ZONE — solid panel, high readability */}
                <div className="relative p-6">
                  <h3
                    className="text-xl font-bold text-foreground tracking-tight"
                    style={{ fontFamily: "'Syne',sans-serif" }}
                  >
                    {item.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>

                  {/* Solution tags */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {item.solutions.map((solution) => (
                      <span
                        key={solution}
                        className="
                        text-[11px] font-medium
                        px-2.5 py-1 rounded-full
                        bg-primary/8 border border-primary/15
                        text-foreground/80
                        "
                      >
                        {solution}
                      </span>
                    ))}
                  </div>

                  {/* CTA */}
                  <div
                    className="
                    hidden mt-5 pt-4 border-t border-border/50
                    items-center justify-between
                    "
                  >
                    <span className="text-sm font-medium text-primary flex items-center gap-2">
                      Explore Solutions
                      <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>

                {/* Subtle hover ring */}
                <div
                  className="
                  pointer-events-none absolute inset-0 rounded-3xl
                  ring-1 ring-inset ring-transparent
                  group-hover:ring-primary/30
                  transition-all duration-500
                  "
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}