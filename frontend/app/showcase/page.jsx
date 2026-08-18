import ShowcasePage from "@/src/pages/ShowcasePage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Showcase | NexCode",
  description: "Explore our portfolio of successful projects and software solutions.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <ShowcasePage />
    </PublicSiteLayout>
  );
}
