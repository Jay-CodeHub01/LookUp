// src/pages/LoginPage.jsx
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, ArrowRight, Sparkles, Users, Heart, MessageCircle } from 'lucide-react';
import { loginUser } from '../api/authApi';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const FloatingParticle = ({ delay, duration, x, y, size, color }) => (
  <motion.div
    className="absolute rounded-full"
    style={{
      width: size,
      height: size,
      background: color,
      left: x,
      top: y,
      filter: 'blur(1px)',
    }}
    animate={{
      y: [0, -150, -50, -200, 0],
      x: [0, 50, -30, 70, 0],
      scale: [1, 1.3, 0.8, 1.1, 1],
      opacity: [0.3, 0.7, 0.4, 0.8, 0.3],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

const StatCard = ({ icon: Icon, value, label, delay }) => (
  <motion.div
    className="glass-card rounded-2xl p-5 text-center hover-lift"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Icon size={20} className="text-indigo-400 mx-auto mb-2" />
    <h3 className="text-2xl font-bold text-white">{value}</h3>
    <p className="text-gray-400 text-xs mt-1">{label}</p>
  </motion.div>
);

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await loginUser(formData);
      login(data.data.token, data.data.user);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#030712' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-bg" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingParticle delay={0} duration={20} x="10%" y="80%" size={8} color="rgba(99, 102, 241, 0.5)" />
          <FloatingParticle delay={2} duration={25} x="20%" y="70%" size={6} color="rgba(139, 92, 246, 0.4)" />
          <FloatingParticle delay={4} duration={18} x="50%" y="85%" size={10} color="rgba(168, 85, 247, 0.3)" />
          <FloatingParticle delay={1} duration={22} x="70%" y="75%" size={7} color="rgba(99, 102, 241, 0.4)" />
          <FloatingParticle delay={3} duration={28} x="85%" y="90%" size={5} color="rgba(139, 92, 246, 0.5)" />
          <FloatingParticle delay={5} duration={15} x="30%" y="60%" size={9} color="rgba(79, 70, 229, 0.3)" />
          <FloatingParticle delay={6} duration={20} x="60%" y="50%" size={6} color="rgba(167, 139, 250, 0.4)" />
          <FloatingParticle delay={7} duration={24} x="40%" y="95%" size={8} color="rgba(99, 102, 241, 0.3)" />
        </div>

        {/* Animated blobs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full animate-blob"
          style={{ background: 'rgba(99, 102, 241, 0.1)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 right-20 w-80 h-80 rounded-full animate-blob"
          style={{ background: 'rgba(139, 92, 246, 0.08)', filter: 'blur(80px)', animationDelay: '-4s' }} />

        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
              animate={{ boxShadow: ['0 0 15px rgba(99, 102, 241, 0.1)', '0 0 30px rgba(99, 102, 241, 0.2)', '0 0 15px rgba(99, 102, 241, 0.1)'] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles size={14} className="text-indigo-400" />
              <span className="text-indigo-300 text-sm font-medium">Welcome to LookUp</span>
            </motion.div>

            <h1 className="text-5xl font-bold text-white mb-4 animate-text-glow">LookUp</h1>
            <p className="text-lg text-gray-300/80 leading-relaxed">
              Connect with friends, share moments, and discover what's happening around you.
            </p>
          </motion.div>

          <motion.div
            className="mt-12 grid grid-cols-2 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <StatCard icon={Users} value="10K+" label="Active Users" delay={0.4} />
            <StatCard icon={MessageCircle} value="50K+" label="Posts Shared" delay={0.5} />
            <StatCard icon={Heart} value="100K+" label="Connections" delay={0.6} />
            <StatCard icon={Sparkles} value="200K+" label="Likes Given" delay={0.7} />
          </motion.div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99, 102, 241, 0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

        <motion.div
          className="w-full max-w-md relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-4xl font-bold gradient-text animate-text-glow">
              LookUp
            </h1>
            <p className="text-gray-500 mt-2 text-sm">Connect. Share. Discover.</p>
          </div>

          <motion.div
            className="glass-card rounded-2xl p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">Welcome back</h2>
              <p className="text-gray-400 mt-1 text-sm">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="you@example.com"
                  required
                  className="input-premium"
                />
              </motion.div>

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    required
                    className="input-premium"
                    style={{ paddingRight: '48px' }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </div>
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {isLoading ? (
                  <motion.div
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  />
                ) : (
                  <>
                    <LogIn size={18} />
                    Sign In
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Register Link */}
          <motion.p
            className="text-center mt-6 text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Sign up <ArrowRight size={14} />
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;