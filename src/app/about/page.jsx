/**
 * About / Our Story Page
 * Migrated from: React About.jsx
 * Dynamic content loaded from settings API with admin inline edit floating button
 */

'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, 
  Users, 
  Globe, 
  Heart, 
  Smile, 
  Star, 
  ShoppingBag, 
  TrendingUp, 
  Gem, 
  Sparkles,
  Edit, 
  Loader2 
} from 'lucide-react';
import Link from 'next/link';

// Icon mapping dictionary
const iconMap = {
  Users,
  Globe,
  Award,
  Heart,
  Smile,
  Star,
  ShoppingBag,
  TrendingUp,
  Gem,
  Sparkles
};

const DEFAULT_STORY = {
  heroTitle: 'Redefining Luxury for the Modern Era',
  heroSubtitle: 'Our Story',
  heroDescription: "GR Groups isn't just an e-commerce platform—it's a movement. We believe luxury should be accessible, authentic, and ahead of its time. Every product in our catalog is handpicked to meet the highest standards of quality and design.",
  missionTitle: 'Our Mission',
  missionDescription: 'To bridge the gap between high fashion and everyday style. We partner directly with designers and artisans worldwide to bring you pieces that tell a story—each item crafted with precision, purpose, and passion.',
  stats: [
    { icon: 'Users', value: '50K+', label: 'Happy Customers' },
    { icon: 'Globe', value: '45+', label: 'Countries Shipped' },
    { icon: 'Award', value: '200+', label: 'Premium Brands' },
    { icon: 'Heart', value: '99%', label: 'Satisfaction Rate' },
  ],
  timeline: [
    { year: '2020', title: 'The Beginning', desc: 'GR Groups was born from a passion for luxury fashion, launching our first curated collection of streetwear and accessories.' },
    { year: '2021', title: 'Going Global', desc: 'We expanded to 20+ countries, partnering with exclusive artisan brands from Italy, Japan, and Scandinavia.' },
    { year: '2022', title: 'Tech Innovation', desc: 'Launched our AI-powered styling recommendations and augmented reality try-on features.' },
    { year: '2023', title: 'Community First', desc: 'Introduced our members-only Elite program, offering early access drops and personalized experiences.' },
    { year: '2024', title: 'Sustainability', desc: 'Committed to carbon-neutral shipping and partnered with eco-conscious brands worldwide.' },
  ]
};

export default function AboutPage() {
  const [storyData, setStoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Fetch story data
    const loadStory = async () => {
      try {
        const res = await fetch('/api/settings/story');
        const result = await res.json();
        if (res.ok && result.success && result.data) {
          setStoryData(result.data);
        } else {
          setStoryData(DEFAULT_STORY);
        }
      } catch (err) {
        console.error('Failed to load story settings, using default.', err);
        setStoryData(DEFAULT_STORY);
      } finally {
        setLoading(false);
      }
    };

    // Check if user is logged in as Admin
    const checkAdmin = async () => {
      try {
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('auth-token='))
          ?.split('=')[1];

        if (!token) return;

        const res = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.user?.role === 'admin') {
            setIsAdmin(true);
          }
        }
      } catch (err) {
        console.error('Admin verification failed', err);
      }
    };

    loadStory();
    checkAdmin();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-24 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="animate-spin text-accent" size={40} />
        <p className="text-textMuted font-medium text-lg animate-pulse">Loading Our Story...</p>
      </div>
    );
  }

  const {
    heroTitle,
    heroSubtitle,
    heroDescription,
    missionTitle,
    missionDescription,
    stats,
    timeline
  } = storyData || DEFAULT_STORY;

  return (
    <div className="container mx-auto px-6 py-12 relative">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center mb-20 max-w-3xl mx-auto"
      >
        <span className="text-accent text-sm font-medium uppercase tracking-widest">{heroSubtitle}</span>
        <h1 className="text-4xl md:text-6xl font-bold mt-4 mb-6 leading-tight">
          {heroTitle.split(' ').map((word, idx) => {
            if (word.toLowerCase().includes('luxury')) {
              return (
                <span key={idx} className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-accent to-secondary">
                  {word}{' '}
                </span>
              );
            }
            return word + ' ';
          })}
        </h1>
        <p className="text-textMuted text-lg leading-relaxed">
          {heroDescription}
        </p>
      </motion.div>

      {/* Stats Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {(stats || []).map((stat, i) => {
          const StatIcon = iconMap[stat.icon] || Heart;
          return (
            <motion.div
              key={stat.label || i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-panel rounded-2xl p-6 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-primary/10 flex items-center justify-center">
                <StatIcon size={22} className="text-accent" />
              </div>
              <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                {stat.value}
              </div>
              <div className="text-textMuted text-sm mt-1">{stat.label}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Mission Section */}
      <motion.div 
        initial={{ opacity: 0 }} 
        whileInView={{ opacity: 1 }} 
        viewport={{ once: true }} 
        className="glass-panel rounded-3xl p-10 md:p-16 mb-20 relative overflow-hidden"
      >
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px]" />
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-accent/10 rounded-full blur-[80px]" />
        <div className="relative z-10 max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">{missionTitle}</h2>
          <p className="text-textMuted text-lg leading-relaxed">
            {missionDescription}
          </p>
        </div>
      </motion.div>

      {/* Journey Timeline Section */}
      <div className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
        <div className="max-w-2xl mx-auto space-y-8">
          {(timeline || []).map((item, i) => (
            <motion.div
              key={item.year || i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-6"
            >
              <div className="flex-shrink-0 w-20 text-right">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                  {item.year}
                </span>
              </div>
              <div className="relative pl-6 border-l-2 border-white/10 pb-8">
                <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-gradient-to-r from-primary to-accent" />
                <h3 className="font-semibold text-lg mb-1">{item.title}</h3>
                <p className="text-textMuted text-sm leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        whileInView={{ opacity: 1, scale: 1 }} 
        viewport={{ once: true }} 
        className="text-center"
      >
        <h2 className="text-3xl font-bold mb-4">Ready to experience GR Groups?</h2>
        <p className="text-textMuted mb-8">Join thousands of customers who've already elevated their style.</p>
        <Link href="/products" className="btn-primary inline-flex items-center gap-2">
          Start Shopping
        </Link>
      </motion.div>

      {/* Floating Edit Story Button (Only visible to Admins) */}
      {isAdmin && (
        <Link 
          href="/admin/story" 
          className="fixed bottom-8 right-8 z-50 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 group scale-100 hover:scale-105 active:scale-95 animate-in fade-in slide-in-from-bottom-8"
          title="Edit Our Story Content"
        >
          <Edit size={18} className="group-hover:rotate-12 transition-transform duration-300" />
          <span>Edit Story</span>
        </Link>
      )}

    </div>
  );
}
