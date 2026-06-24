/**
 * Navbar Component
 * Migrated from: React Navbar.jsx
 * Features: Glassmorphism, search, cart badge, mobile menu, auth state
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ShoppingBag, Search, User, Menu, X, LogOut, History, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAuthStore from '@/store/useAuthStore';
import useCartStore from '@/store/useCartStore';
import useLanguageStore from '@/store/useLanguageStore';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');

  const { userInfo, logout } = useAuthStore();
  const { cartItems } = useCartStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [langOpen, setLangOpen] = useState(false);
  const { locale, setLocale } = useLanguageStore();

  const languagesList = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ta', label: 'Tamil', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
    { code: 'sv', label: 'Swedish', flag: '🇸🇪' },
    { code: 'no', label: 'Norwegian', flag: '🇳🇴' }
  ];

  const currentLang = languagesList.find(l => l.code === locale) || languagesList[0];

  const handleLanguageChange = (code) => {
    setLocale(code);
    setLangOpen(false);
    
    const params = new URLSearchParams(searchParams.toString());
    params.set('lang', code);
    router.push(`${pathname}?${params.toString()}`);
  };

  useEffect(() => {
    if (!langOpen) return;
    const closeDropdown = () => setLangOpen(false);
    window.addEventListener('click', closeDropdown);
    return () => window.removeEventListener('click', closeDropdown);
  }, [langOpen]);

  const totalCartQty = cartItems.reduce((a, c) => a + c.qty, 0);

  const logoutHandler = () => {
    logout();
    setMobileMenuOpen(false);
    router.push('/');
  };

  const searchSubmitHandler = (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (searchKeyword.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchKeyword)}`);
      setSearchOpen(false);
      setSearchKeyword('');
      setMobileMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: '/products?isNewArrival=true',
      label: 'New Arrivals',
      active: pathname === '/products' && searchParams.get('isNewArrival') === 'true'
    },
    {
      href: '/categories',
      label: 'Categories',
      active: pathname === '/categories'
    },
    {
      href: '/about',
      label: 'Our Story',
      active: pathname === '/about'
    },
  ];

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${isScrolled ? 'glass-panel py-3' : 'bg-transparent py-5'
        }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3.5 group"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center group-hover:rotate-12 transition-transform duration-300">
            <ShoppingBag size={18} className="text-white" />
          </div>
          <span className="text-primary font-medium tracking-[0.18em] text-base uppercase">
            GR GROUPS
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMuted">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-primary transition-colors relative ${link.active ? 'text-primary' : ''
                }`}
            >
              {link.label}
              {link.active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-accent rounded-full"
                />
              )}
            </Link>
          ))}
          {userInfo?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-accent hover:text-primary transition-colors font-bold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>

        {/* Desktop Icons */}
        <div className="hidden md:flex items-center gap-5">
          {/* Search */}
          <div className="relative flex items-center h-full">
            <AnimatePresence>
              {searchOpen && (
                <motion.form
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={searchSubmitHandler}
                  className="absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Search premium products..."
                    className="w-full bg-surface border border-gray-200 rounded-full py-1.5 px-4 text-sm text-primary focus:outline-none focus:border-accent backdrop-blur-md"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    autoFocus
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              className="text-textMuted hover:text-accent transition-colors z-10"
              onClick={() => {
                if (searchOpen && searchKeyword) {
                  searchSubmitHandler({ preventDefault: () => { } });
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              aria-label="Search"
            >
              <Search size={20} />
            </button>
          </div>

          {/* User & Auth */}
          {userInfo ? (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-textMuted">
                {userInfo.name}
              </span>
              <button
                onClick={logoutHandler}
                className="text-textMuted hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-textMuted hover:text-accent transition-colors"
                title="Sign In / Register"
              >
                <User size={20} />
              </Link>
            </div>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="text-textMuted hover:text-accent transition-colors relative"
            title="Cart"
          >
            <ShoppingBag size={20} />
            {totalCartQty > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold"
              >
                {totalCartQty}
              </motion.span>
            )}
          </Link>

          {/* Order History */}
          <Link
            href="/orders"
            className="flex items-center gap-1 text-accent hover:text-primary transition-colors"
            title="History"
          >
            <History size={20} />
            <span className="text-sm">History</span>
          </Link>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen(!langOpen);
              }}
              className="flex items-center gap-1.5 text-textMuted hover:text-accent transition-colors bg-white/5 border border-white/10 hover:border-accent/40 rounded-full px-3 py-1.5 text-sm backdrop-blur-md"
              title="Change Language"
            >
              <Globe size={16} />
              <span className="uppercase font-semibold text-xs">{currentLang.code}</span>
              <span className="text-[10px]">{currentLang.flag}</span>
              <ChevronDown size={12} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2.5 w-44 rounded-xl border border-white/10 bg-[#161616]/95 backdrop-blur-xl p-1.5 shadow-2xl z-50 flex flex-col gap-0.5"
                >
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                        locale === lang.code
                          ? 'bg-primary text-white'
                          : 'text-textMuted hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {locale === lang.code && <span className="w-1.5 h-1.5 rounded-full bg-accent" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-primary p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full glass-panel flex flex-col items-center py-6 gap-4 md:hidden"
          >
            {/* Search in mobile */}
            <form onSubmit={searchSubmitHandler} className="w-full px-6">
              <input
                type="text"
                placeholder="Search products..."
                className="input-field w-full rounded-full"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </form>

            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-lg ${link.active ? 'text-accent' : 'text-textMuted hover:text-primary'} transition-colors`}
              >
                {link.label}
              </Link>
            ))}

            {userInfo?.role === 'admin' && (
              <Link
                href="/admin"
                className="text-lg text-accent hover:text-primary font-bold transition-colors"
              >
                Admin Dashboard
              </Link>
            )}

            {/* Mobile Menu Icons */}
            <div className="flex flex-col gap-4 mt-4 items-center w-full px-6">
              <div className="flex gap-6 items-center">
                {userInfo ? (
                  <>
                    <span className="text-sm text-textMuted">{userInfo.name}</span>
                    <button onClick={logoutHandler} className="text-red-400">
                      <LogOut size={22} />
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="text-textMuted hover:text-accent">
                    <User size={22} />
                  </Link>
                )}
                <Link href="/cart" className="relative text-textMuted hover:text-accent">
                  <ShoppingBag size={22} />
                  {totalCartQty > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                      {totalCartQty}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className="text-accent hover:text-primary"
                >
                  <History size={22} />
                </Link>
              </div>
            </div>

            {/* Mobile Language Switcher */}
            <div className="flex gap-3 mt-2 border-t border-white/5 pt-4 w-full justify-center">
              {languagesList.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleLanguageChange(lang.code);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                    locale === lang.code
                      ? 'border-accent/40 bg-primary/10 scale-105'
                      : 'border-transparent bg-transparent opacity-60'
                  }`}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="text-[10px] uppercase font-bold text-textMuted">{lang.code}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
