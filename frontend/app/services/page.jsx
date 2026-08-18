import ServicesPage from "@/src/pages/ServicesPage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Services | NexCode",
  description: "Comprehensive software development services from custom web apps to enterprise solutions.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <ServicesPage />
    </PublicSiteLayout>
  );
}
