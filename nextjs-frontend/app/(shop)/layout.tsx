import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import Navbar from "@/components/layout/Navbar";

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>
      <Footer />
      <MobileBottomNav />
    </>
  );
}
