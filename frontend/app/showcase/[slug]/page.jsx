import ProjectDetailPage from "@/src/sitePages/ProjectDetailPage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Project Detail | NexCode",
  description: "Detailed view of project architecture and results.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <ProjectDetailPage />
    </PublicSiteLayout>
  );
}
