import TermsOfServicePage from "@/src/pages/TermsOfServicePage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Terms of Service | NexCode",
  description: "NexCode Terms of Service.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <TermsOfServicePage />
    </PublicSiteLayout>
  );
}
