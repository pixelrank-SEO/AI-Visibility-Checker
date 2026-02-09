import Link from "next/link";
import { Eye } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <Eye className="h-5 w-5 text-primary" />
          <span>AI Visibility Checker</span>
        </Link>
        <nav className="ml-auto flex items-center gap-4 text-sm">
          <Link
            href="/history"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            History
          </Link>
        </nav>
      </div>
    </header>
  );
}
