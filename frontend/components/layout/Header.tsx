import Link from "next/link";

const navigationItems = [
  { href: "/", label: "Trang chu" },
  { href: "/products", label: "San pham" },
  { href: "/cart", label: "Gio hang" },
  { href: "/profile", label: "Tai khoan" },
];

export function Header() {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-6 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-950">
          Sneaker Atelier
        </Link>

        <nav className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
          {navigationItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition-colors hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}

          <Link
            href="/admin"
            className="rounded-full bg-slate-950 px-4 py-2 font-medium text-white transition-colors hover:bg-slate-800"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
