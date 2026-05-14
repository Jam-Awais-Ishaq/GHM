import { MobileNav } from "@/components/layout/MobileNav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <MobileNav />
    </>
  );
}
