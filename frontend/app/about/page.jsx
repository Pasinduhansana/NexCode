import AboutPage from "@/src/pages/AboutPage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "About Us | NexCode",
  description: "Learn more about NexCode engineering culture, mission, and team.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <AboutPage />
    </PublicSiteLayout>
  );
}
