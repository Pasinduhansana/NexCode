import AdminLayout from "@/src/Admin/components/AdminLayout";

export const metadata = {
  title: "Admin Panel | NexCode",
  description: "NexCode Internal Project Management Platform",
};

export default function Layout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
