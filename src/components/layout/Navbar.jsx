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
    if (e?.preventDefault)
      e.preventDefault();
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
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 w-[92%] max-w-7xl mx-auto rounded-full border border-white/20 shadow-luxury backdrop-blur-md ${isScrolled
          ? 'mt-3 py-2.5 bg-white/90 border-[#eae8e4]/60'
          : 'mt-6 py-4 bg-white/70 border-[#eae8e4]/30'
        }`}
    >
      <div className="px-6 md:px-8 flex items-center justify-between w-full">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 rounded-full bg-[#123026] border border-[#b89d70]/30 flex items-center justify-center text-white font-bold text-xs tracking-normal font-sans transition-transform duration-500 group-hover:rotate-12">
            GR
          </div>
          <span className="text-[#123026] font-sans font-semibold tracking-[0.2em] text-xs md:text-sm uppercase">
            GR GROUPS
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-xs font-semibold tracking-wider text-[#6a7571] uppercase font-sans">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hover:text-[#123026] transition-colors relative py-1 ${link.active ? 'text-[#123026]' : ''
                }`}
            >
              {link.label}
              {link.active && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-[#b89d70] rounded-full"
                />
              )}
            </Link>
          ))}
          {userInfo?.role === 'admin' && (
            <Link
              href="/admin"
              className="text-[#b89d70] hover:text-[#123026] transition-colors font-bold"
            >
              Admin
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
                  animate={{ width: 200, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={searchSubmitHandler}
                  className="absolute right-8 top-1/2 -translate-y-1/2 overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-white/95 border border-[#eae8e4] rounded-full py-1 px-3 text-xs text-primary focus:outline-none focus:border-[#b89d70] backdrop-blur-md"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    autoFocus
                  />
                </motion.form>
              )}
            </AnimatePresence>
            <button
              className="text-[#6a7571] hover:text-[#123026] transition-colors z-10"
              onClick={() => {
                if (searchOpen && searchKeyword) {
                  searchSubmitHandler({ preventDefault: () => { } });
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </div>

          {/* User & Auth */}
          {userInfo ? (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-[#6a7571] max-w-[80px] truncate">
                {userInfo.name}
              </span>
              <button
                onClick={logoutHandler}
                className="text-[#6a7571] hover:text-red-500 transition-colors"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center">
              <Link
                href="/login"
                className="text-[#6a7571] hover:text-[#123026] transition-colors"
                title="Sign In / Register"
              >
                <User size={18} />
              </Link>
            </div>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="text-[#6a7571] hover:text-[#123026] transition-colors relative"
            title="Cart"
          >
            <ShoppingBag size={18} />
            {totalCartQty > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 bg-[#123026] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
              >
                {totalCartQty}
              </motion.span>
            )}
          </Link>

          {/* Order History */}
          <Link
            href="/orders"
            className="text-[#6a7571] hover:text-[#123026] transition-colors flex items-center gap-1"
            title="History"
          >
            <History size={18} />
            <span className="text-xs font-semibold uppercase tracking-wider font-sans">History</span>
          </Link>

          {/* Vertical Divider */}
          <div className="h-4 w-px bg-[#eae8e4] self-center mx-1" />

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setLangOpen(!langOpen);
              }}
              className="flex items-center gap-1 text-[#6a7571] hover:text-[#123026] transition-colors text-xs font-semibold uppercase tracking-wider font-sans"
              title="Change Language"
            >
              <span>{currentLang.code}</span>
              <ChevronDown size={10} className={`transition-transform duration-300 ${langOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {langOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-3 w-40 rounded-xl border border-[#eae8e4] bg-white/95 backdrop-blur-xl p-1 shadow-xl z-50 flex flex-col gap-0.5"
                >
                  {languagesList.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageChange(lang.code)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${locale === lang.code
                          ? 'bg-[#123026] text-white'
                          : 'text-[#6a7571] hover:bg-[#eae8e4]/40 hover:text-[#123026]'
                        }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>{lang.flag}</span>
                        <span>{lang.label}</span>
                      </span>
                      {locale === lang.code && <span className="w-1 h-1 rounded-full bg-[#b89d70]" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-[#123026] p-1"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
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
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${locale === lang.code
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
    </motion.nav>
  );
};

export default Navbar;
