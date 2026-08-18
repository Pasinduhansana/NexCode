import PrivacyPolicyPage from "@/src/sitePages/PrivacyPolicyPage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";

export const metadata = {
  title: "Privacy Policy | NexCode",
  description: "NexCode Privacy Policy and data protection details.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <PrivacyPolicyPage />
    </PublicSiteLayout>
  );
}
