import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Если пользователь уже авторизован, сразу кидаем в админку
  if (user) {
    redirect("/orders"); // Перенаправляем на заказы по-умолчанию
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center">
            <ShoppingBag className="h-8 w-8 text-primary" />
          </div>
        </div>

        <h1 className="text-3xl font-bold font-display tracking-tight">
          Admin Panel
        </h1>

        <p className="text-muted-foreground">
          Welcome to the E-commerce Administration System.
          Please sign in to manage your store.
        </p>

        <div className="flex flex-col gap-4 pt-4">
          <Link
            href="/login"
            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
