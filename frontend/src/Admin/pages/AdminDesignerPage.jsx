import { HiOutlineSparkles } from "react-icons/hi";
import usePageTitle from "../../utils/usePageTitle";

export default function AdminDesignerPage() {
  usePageTitle("Designer");

  return (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <HiOutlineSparkles size={28} className="text-primary" />
      </div>
      <h1 className="mt-5 font-display text-xl font-extrabold text-foreground">Designer</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-text_secondary">
        This page is under construction. Content and tools will be added here soon.
      </p>
    </div>
  );
}
