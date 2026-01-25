import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

interface AdminLayoutProps {
  children: ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  const role = cookieStore.get("role")?.value;

  if (!token) redirect("/login");
  if (role !== "admin") redirect("/");

  return <>{children}</>;
}
