"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NO_PERSIST_COOKIE } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";

export async function signIn(formData: FormData): Promise<void> {
  const remember = formData.get("remember") === "on";
  const supabase = await createClient(remember);

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/sign-in?error=${encodeURIComponent(error.message)}`);
  }

  // Persist the user's choice so the middleware can honor it on every refresh.
  const cookieStore = await cookies();
  if (remember) {
    cookieStore.delete(NO_PERSIST_COOKIE);
  } else {
    cookieStore.set(NO_PERSIST_COOKIE, "1", { path: "/" });
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signUp(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/sign-up?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  // Clear the "no persist" marker so a later sign-in starts from a clean
  // slate rather than inheriting a stale session-scoping preference.
  const cookieStore = await cookies();
  cookieStore.delete(NO_PERSIST_COOKIE);
  revalidatePath("/", "layout");
  redirect("/sign-in");
}

export async function resetPassword(formData: FormData): Promise<void> {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    redirect(`/forgot-password?error=${encodeURIComponent(error.message)}`);
  }

  redirect(`/forgot-password?sent=1&email=${encodeURIComponent(email)}`);
}
