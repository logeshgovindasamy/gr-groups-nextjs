"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, LogOut, ArrowLeftRight, BookOpen } from "lucide-react";
import { useEffect } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  // Basic client-side logout just clears cookie and redirects
  const handleLogout = () => {
    document.cookie = "auth-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products & Stock", icon: Package },
    { href: "/admin/inventory", label: "Receiving", icon: ArrowLeftRight },
    { href: "/admin/orders", label: "Sales & Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Customers", icon: Users },
    { href: "/admin/story", label: "Our Story", icon: BookOpen },
  ];

  return (
    <div className="flex h-screen bg-[#f6f6f7] text-[#1a1d1f]">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-e border-[#e1e3e5] hidden md:flex flex-col">
        {/* Brand/Logo Section */}
        <div className="h-14 flex items-center px-5 border-b border-[#e1e3e5]">
          <Link href="/" className="flex items-center gap-2 font-bold text-sm tracking-wide text-[#1a1d1f]">
            <span className="w-6 h-6 rounded-md bg-[#008060] flex items-center justify-center text-white text-xs font-black">G</span>
            <span>GR Groups <span className="text-[#6d7175] font-normal">Admin</span></span>
          </Link>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== "/admin");
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${isActive
                      ? "bg-[#f1f2f4] text-[#1a1d1f] font-bold"
                      : "text-[#6d7175] hover:bg-[#f6f6f7] hover:text-[#1a1d1f]"
                      }`}
                  >
                    <Icon size={16} className={isActive ? "text-[#008060]" : "text-[#6d7175]"} />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Sidebar Bottom (User/Logout) */}
        <div className="p-3 border-t border-[#e1e3e5]">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-[#fff0f0] rounded-lg transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-[#e1e3e5] flex items-center px-6 justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-bold tracking-tight text-[#1a1d1f] md:block hidden">
              {pathname === "/admin" ? "Dashboard" : 
               pathname.startsWith("/admin/products") ? "Products" :
               pathname.startsWith("/admin/orders") ? "Orders" :
               pathname.startsWith("/admin/users") ? "Customers" :
               pathname.startsWith("/admin/inventory") ? "Receiving" : "Our Story"}
            </h1>
            <h1 className="text-sm font-bold tracking-tight text-[#1a1d1f] md:hidden block">Admin Panel</h1>
          </div>
          <div>
            <button 
              onClick={handleLogout} 
              className="text-[#6d7175] hover:text-red-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#f6f6f7]">
          {children}
        </div>
      </main>
    </div>
  );
}
