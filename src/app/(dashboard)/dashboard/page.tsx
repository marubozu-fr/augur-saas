import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/(auth)/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-muted-foreground mb-8">
        Signed in as <span className="font-medium text-foreground">{user?.email}</span>
      </p>

      <form action={signOut}>
        <button
          type="submit"
          className="h-9 px-4 rounded-md border border-input text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
