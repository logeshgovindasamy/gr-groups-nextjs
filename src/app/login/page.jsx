/**
* Unified Auth Page — Login & Register
* Single page with toggle between Sign In and Create Account
*/

'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/useAuthStore';

function LoginContent() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Forgot Password state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const { login, register, loading, error, clearError } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';

  const switchMode = () => {
    setIsRegister(!isRegister);
    clearError();
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    clearError();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isRegister) {
      if (!name) {
        toast.error('Please enter your name');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const success = await register(name, email, password);
      if (success) {
        toast.success('Account created successfully!');
        router.push(callbackUrl);
      }
    } else {
      const success = await login(email, password);
      if (success) {
        toast.success(`Welcome back!`);
        router.push(callbackUrl);
      }
    }
  };

  const handleForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return toast.error('Enter your email');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'OTP sent successfully');
        setForgotStep(2);
      } else {
        toast.error(data.error || 'Failed to send OTP');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotReset = async (e) => {
    e.preventDefault();
    if (!forgotOtp || !forgotNewPassword) return toast.error('Enter OTP and new password');
    setForgotLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword: forgotNewPassword })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || 'Password reset successfully');
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotOtp('');
        setForgotNewPassword('');
      } else {
        toast.error(data.error || 'Failed to reset password');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setForgotLoading(false);
    }
  }; return (
    <div className="relative min-h-[90vh] flex items-center justify-center pt-28 pb-16 overflow-hidden bg-[#f5f3ef] text-[#123026]">
      {/* Ambient Glowing Orbs */}
      <div className="absolute top-10 left-10 w-[450px] h-[450px] bg-[#b89d70]/8 rounded-full blur-[120px] -z-10 animate-pulse-slow" />
      <div className="absolute bottom-10 right-10 w-[550px] h-[550px] bg-[#123026]/6 rounded-full blur-[140px] -z-10 animate-pulse-slow" style={{ animationDelay: '2s' }} />



      <div className="relative w-full max-w-md px-6 z-10">


        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="glass-panel bg-white/70 p-8 md:p-10 rounded-3xl w-full shadow-luxury border border-[#eae8e4]/60 relative overflow-hidden"
        >


          {/* Soft wave patterns inside the card */}
          <div className="absolute inset-0 bg-gradient-to-tr from-[#123026]/3 via-[#b89d70]/2 to-white/5 -z-10" />
          <svg className="absolute inset-0 w-full h-full text-[#123026]/3 pointer-events-none -z-10" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M-50,320 C80,290 120,440 270,390 C370,360 410,470 500,430" stroke="currentColor" strokeWidth="1.5" />
            <path d="M-50,270 C60,230 160,390 260,340 C360,300 400,430 500,390" stroke="currentColor" strokeWidth="1.0" strokeDasharray="3 3" />
          </svg>

          {/* Header */}
          <div className="text-center mb-6 relative z-10 select-none">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#123026] border-[1.5px] border-[#b89d70] flex items-center justify-center text-[#b89d70] shadow-md transition-transform duration-500 hover:scale-105">
              <ShoppingBag size={22} className="stroke-[1.2]" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#123026] font-serif">
              {isRegister ? 'Create Account' : 'Sign In'}
            </h1>
            <p className="text-xs text-[#6a7571] mt-1 font-medium">
              {isRegister ? 'Join the GR Groups luxury experience' : 'Sign in to access your dashboard'}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg border border-[#eae8e4] overflow-hidden bg-[#f4f2ee]/50 p-1 mb-6">
            <button
              type="button"
              onClick={() => { if (isRegister) switchMode(); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${!isRegister
                ? 'bg-white text-[#123026] shadow-xs border border-[#eae8e4]'
                : 'text-[#6a7571] hover:text-[#123026]'
                }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { if (!isRegister) switchMode(); }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all duration-200 ${isRegister
                ? 'bg-white text-[#123026] shadow-xs border border-[#eae8e4]'
                : 'text-[#6a7571] hover:text-[#123026]'
                }`}
            >
              Register
            </button>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#fff0f0] text-[#d82c0d] p-3 rounded-lg mb-5 text-center text-xs font-bold border border-[#fbd3d3]"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={submitHandler} className="flex flex-col gap-4">
            {/* Name — register only */}
            {isRegister && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  id="auth-name"
                />
              </motion.div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="auth-email"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full pl-3 pr-9 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                  placeholder={isRegister ? 'Min 6 characters' : 'Enter your password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  id="auth-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6a7571] hover:text-[#123026] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {!isRegister && (
                <div className="flex justify-end mt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs font-bold text-[#b89d70] hover:underline focus:outline-none"
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {/* Confirm password — register only */}
            {isRegister && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  className="w-full px-3 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  id="auth-confirm"
                />
              </motion.div>
            )}

            <button
              type="submit"
              className="btn-primary w-full mt-2 py-2.5"
              disabled={loading}
              id="auth-submit"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isRegister ? 'Creating account...' : 'Signing in...'}
                </span>
              ) : (
                isRegister ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

          <p className="text-[#6a7571] text-xs text-center mt-5 font-semibold">
            <Link href="/" className="text-[#b89d70] hover:underline">
              ← Back to store
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#123026]/40 backdrop-blur-xs px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#f5f3ef] border border-[#eae8e4] p-6 rounded-xl w-full max-w-sm shadow-luxury relative text-[#123026]"
          >
            <button
              onClick={() => {
                setShowForgotModal(false);
                setForgotStep(1);
                setForgotOtp('');
                setForgotNewPassword('');
              }}
              className="absolute top-4 right-4 text-[#6a7571] hover:text-[#123026] font-bold"
            >
              ✕
            </button>
            <h2 className="text-base font-bold font-serif mb-1">Reset Password</h2>

            {forgotStep === 1 ? (
              <form onSubmit={handleForgotRequest} className="space-y-3 mt-4">
                <p className="text-xs text-[#6a7571] leading-relaxed">Enter your email address and we'll send you an OTP to reset your password.</p>
                <div>
                  <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">Email Address</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                    placeholder="you@example.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={forgotLoading} className="btn-primary w-full mt-2.5">
                  {forgotLoading ? 'Sending...' : 'Send OTP'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleForgotReset} className="space-y-3 mt-4">
                <p className="text-xs text-[#6a7571] leading-relaxed">An OTP has been sent to your email.</p>
                <div>
                  <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">Enter OTP</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs tracking-widest text-center font-bold outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                    placeholder="123456"
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    maxLength={6}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#6a7571] uppercase tracking-wider mb-1.5">New Password</label>
                  <input
                    type="password"
                    className="w-full px-3 py-2 bg-white/50 border border-[#eae8e4] rounded-lg text-xs outline-none focus:border-[#b89d70] focus:ring-2 focus:ring-[#b89d70]/15 transition-all text-[#123026]"
                    placeholder="Min 6 characters"
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" disabled={forgotLoading} className="btn-primary w-full mt-2.5">
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-[60vh] bg-[#f5f3ef]">
        <div className="w-10 h-10 border-4 border-[#eae8e4] border-t-[#b89d70] rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
