export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <span className="text-lg font-semibold tracking-tight text-foreground">
            ThatAssistant
          </span>
        </div>
        {children}
      </div>
    </div>
  );
}
