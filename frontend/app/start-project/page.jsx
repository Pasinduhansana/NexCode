import ProjectRequestPage from "@/src/pages/ProjectRequestPage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Start a Project | NexCode",
  description: "Submit a project inquiry and request a consultation with NexCode.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <ProjectRequestPage />
    </PublicSiteLayout>
  );
}
