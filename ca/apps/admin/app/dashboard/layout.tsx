import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import AdminLayout from "../../components/dashboard/layout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Only allow admin and officer roles
  if (!["admin", "officer"].includes(session.user.role || "")) {
    redirect("/auth/signin");
  }

  return <AdminLayout>{children}</AdminLayout>;
}