import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-2 bg-background px-4 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Page not found</h1>
      <p className="text-muted-foreground">
        It doesn&apos;t exist, or you don&apos;t have access to it.
      </p>
      <Link href="/" className="mt-2 text-sm font-medium underline underline-offset-4">
        Go home
      </Link>
    </div>
  );
}
