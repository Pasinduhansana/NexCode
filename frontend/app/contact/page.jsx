import ContactPage from "@/src/sitePages/ContactPage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Contact Us | NexCode",
  description: "Get in touch with NexCode for project inquiries and support.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <ContactPage />
    </PublicSiteLayout>
  );
}
