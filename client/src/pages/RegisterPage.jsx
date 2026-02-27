// src/pages/RegisterPage.jsx
import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, ArrowRight, Camera, Users, MessageCircle, Shield } from 'lucide-react';
import { registerUser } from '../api/authApi';
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

const FeatureCard = ({ icon: Icon, title, desc, delay }) => (
  <motion.div
    className="glass-card rounded-2xl p-4 flex items-center gap-4 hover-lift cursor-default"
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(139, 92, 246, 0.2))' }}>
      <Icon size={22} className="text-indigo-400" />
    </div>
    <div className="text-left">
      <h4 className="text-white font-semibold text-sm">{title}</h4>
      <p className="text-gray-400 text-xs mt-0.5">{desc}</p>
    </div>
  </motion.div>
);

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Password strength
  const getPasswordStrength = () => {
    const pw = formData.password;
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;
    
    if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
    if (score <= 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
    if (score <= 3) return { score: 3, label: 'Good', color: '#3b82f6' };
    if (score <= 4) return { score: 4, label: 'Strong', color: '#10b981' };
    return { score: 5, label: 'Very Strong', color: '#06d6a0' };
  };

  const passwordStrength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsLoading(true);

    try {
      const { data } = await registerUser({
        fullName: formData.fullName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      login(data.data.token, data.data.user);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const formFields = [
    { name: 'fullName', label: 'Full Name', type: 'text', placeholder: 'John Doe', delay: 0.2 },
    { name: 'username', label: 'Username', type: 'text', placeholder: 'johndoe', delay: 0.25 },
    { name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', delay: 0.3 },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#030712' }}>
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 gradient-bg" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          <FloatingParticle delay={0} duration={20} x="15%" y="80%" size={8} color="rgba(139, 92, 246, 0.5)" />
          <FloatingParticle delay={2} duration={25} x="25%" y="70%" size={6} color="rgba(99, 102, 241, 0.4)" />
          <FloatingParticle delay={4} duration={18} x="55%" y="85%" size={10} color="rgba(168, 85, 247, 0.3)" />
          <FloatingParticle delay={1} duration={22} x="75%" y="75%" size={7} color="rgba(99, 102, 241, 0.4)" />
          <FloatingParticle delay={3} duration={28} x="80%" y="90%" size={5} color="rgba(139, 92, 246, 0.5)" />
          <FloatingParticle delay={5} duration={15} x="35%" y="60%" size={9} color="rgba(79, 70, 229, 0.3)" />
        </div>

        {/* Blobs */}
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full animate-blob"
          style={{ background: 'rgba(139, 92, 246, 0.1)', filter: 'blur(60px)' }} />
        <div className="absolute bottom-20 left-20 w-80 h-80 rounded-full animate-blob"
          style={{ background: 'rgba(99, 102, 241, 0.08)', filter: 'blur(80px)', animationDelay: '-4s' }} />

        <div className="relative z-10 max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-4 animate-text-glow">LookUp</h1>
            <p className="text-lg text-gray-300/80 leading-relaxed">
              Join our community today. Share your story with the world.
            </p>
          </motion.div>

          <div className="mt-12 space-y-3">
            <FeatureCard icon={Camera} title="Share Photos" desc="Upload and share your best moments" delay={0.3} />
            <FeatureCard icon={Users} title="Connect" desc="Follow friends and discover new people" delay={0.4} />
            <FeatureCard icon={MessageCircle} title="Engage" desc="Like, comment, and interact with posts" delay={0.5} />
            <FeatureCard icon={Shield} title="Privacy" desc="Control who sees your content" delay={0.6} />
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139, 92, 246, 0.06) 0%, transparent 70%)', filter: 'blur(40px)' }} />

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
            <p className="text-gray-500 mt-2 text-sm">Join the community</p>
          </div>

          <motion.div
            className="glass-card rounded-2xl p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Create account</h2>
              <p className="text-gray-400 mt-1 text-sm">Start your journey with LookUp</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Dynamic fields */}
              {formFields.map((field) => (
                <motion.div
                  key={field.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: field.delay }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    className="input-premium"
                  />
                </motion.div>
              ))}

              {/* Password */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
                
                {/* Password Strength */}
                {formData.password && (
                  <motion.div
                    className="mt-2"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: passwordStrength.color }}
                          initial={{ width: 0 }}
                          animate={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <span className="text-xs font-medium" style={{ color: passwordStrength.color }}>
                        {passwordStrength.label}
                      </span>
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm Password */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    className="input-premium"
                    style={{ paddingRight: '48px' }}
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </div>
                {/* Password match indicator */}
                {formData.confirmPassword && (
                  <motion.p
                    className="text-xs mt-1.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      color: formData.password === formData.confirmPassword ? '#10b981' : '#ef4444',
                    }}
                  >
                    {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords don\'t match'}
                  </motion.p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 flex items-center justify-center gap-2 text-sm mt-6"
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
                    <UserPlus size={18} />
                    Create Account
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>

          {/* Login Link */}
          <motion.p
            className="text-center mt-6 text-gray-400 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              Sign in <ArrowRight size={14} />
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;