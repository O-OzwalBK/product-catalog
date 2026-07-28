import Link from "next/link";

export function Footer() {
  return (
    <footer className="hidden border-t bg-white py-6 md:block">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 text-sm text-gray-500">
        <p>© {new Date().getFullYear()} ShopCo. All rights reserved.</p>
        <div className="flex gap-6">
          <Link href="/privacy" className="hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:underline">
            Terms
          </Link>
          <Link href="/support" className="hover:underline">
            Support
          </Link>
        </div>
      </div>
    </footer>
  );
}
