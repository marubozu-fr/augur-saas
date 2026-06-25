import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "./Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Defense-in-depth auth check alongside middleware.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/sign-in");
  }

  const userEmail = user.email ?? "";

  return (
    <div className="grid md:grid-cols-[248px_1fr] min-h-screen">
      <Sidebar userEmail={userEmail} />
      <div className="flex flex-col min-w-0">{children}</div>
    </div>
  );
}
