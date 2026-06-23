/**
 * Footer Component
 * New addition - provides professional footer with links and branding
 */

"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Globe, Code2, Mail } from 'lucide-react';

const Footer = () => {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="border-t border-gray-200/60 mt-20">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center">
                <ShoppingBag size={16} className="text-white" />
              </div>
              <span className="text-primary font-medium tracking-[0.18em] text-sm uppercase">
                GR GROUPS
              </span>
            </div>
            <p className="text-textMuted text-sm leading-relaxed">
              Redefining luxury in the digital age. Premium products for the modern individual.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Shop
            </h4>
            <ul className="space-y-2 text-sm text-textMuted">
              <li>
                <Link href="/products" className="hover:text-accent transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-accent transition-colors">
                  Categories
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-accent transition-colors">
                  Search
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Account
            </h4>
            <ul className="space-y-2 text-sm text-textMuted">
              <li>
                <Link href="/login" className="hover:text-accent transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-accent transition-colors">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-accent transition-colors">
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-accent transition-colors">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm uppercase tracking-wider mb-4 text-primary">
              Company
            </h4>
            <ul className="space-y-2 text-sm text-textMuted">
              <li>
                <Link href="/about" className="hover:text-accent transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <span className="text-textMuted/50 cursor-not-allowed">Careers</span>
              </li>
              <li>
                <span className="text-textMuted/50 cursor-not-allowed">Privacy Policy</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200/60 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-textMuted text-sm">
            &copy; {new Date().getFullYear()} GR Groups Luxury E-Commerce. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-textMuted hover:text-accent transition-colors" aria-label="Twitter">
              <Globe size={18} />
            </a>
            <a href="#" className="text-textMuted hover:text-accent transition-colors" aria-label="GitHub">
              <Code2 size={18} />
            </a>
            <a href="#" className="text-textMuted hover:text-accent transition-colors" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
