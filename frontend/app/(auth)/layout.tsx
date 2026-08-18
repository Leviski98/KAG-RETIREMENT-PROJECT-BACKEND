import Image from "next/image";
import Link from "next/link";

import { Toaster } from "@/components/ui/sonner";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4 py-10">
      <Link
        href="/"
        className="mb-6 flex flex-col items-center gap-3 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Image
          src="/images/logo.png"
          alt="Kenya Assemblies of God"
          width={64}
          height={64}
          priority
          className="size-16 object-contain"
        />
        <span className="text-sm font-semibold tracking-tight text-foreground">
          KAG Retirement
        </span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
      <Toaster />
    </div>
  );
}
