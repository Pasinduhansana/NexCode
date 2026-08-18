import ShowcasePage from "@/src/sitePages/ShowcasePage";
import PublicSiteLayout from "@/components/layouts/PublicSiteLayout";
import { Suspense } from "react";

export const metadata = {
  title: "Showcase | NexCode",
  description: "Explore our portfolio of successful projects and software solutions.",
};

export default function Page() {
  return (
    <PublicSiteLayout>
      <Suspense fallback={null}>
        <ShowcasePage />
      </Suspense>
    </PublicSiteLayout>
  );
}
