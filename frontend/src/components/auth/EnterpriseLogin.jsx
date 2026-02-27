import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronLeft, AlertCircle, Eye, EyeOff, Building2 } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * EnterpriseLogin.jsx
 *
 * Enterprise Login - For institutional buyers (factories, recycling centers, etc.)
 * Mock login with different UI/branding from regular user login.
 * Adapted to project's emerald / glassmorphism / dark-mode design.
 */

const EnterpriseLogin = () => {
  const navigate = useNavigate();
  const [darkMode] = useDarkMode();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email) {
      setError('Email is required');
      return;
    }
    if (!formData.password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Mock login - simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Mock: Create a fake enterprise user object
      const mockEnterprise = {
        uid: 'enterprise_' + Math.random().toString(36).substr(2, 9),
        email: formData.email,
        displayName: formData.email.split('@')[0],
        userType: 'enterprise',
        companyName: 'Demo Manufacturing Inc.',
        verificationStatus: 'verified',
        loginTime: new Date().toISOString(),
      };

      // Store in localStorage for demo
      localStorage.setItem('mockUser', JSON.stringify(mockEnterprise));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', 'enterprise');

      // Redirect to enterprise dashboard
      navigate('/dashboard/enterprise');
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark py-8 px-4 transition-colors">
      {/* Back button */}
      <div className="max-w-md mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back
        </button>
      </div>

      {/* Form Card — glassmorphism */}
      <div className="max-w-md mx-auto bg-white/60 dark:bg-white/10 backdrop-blur-2xl rounded-[2rem] shadow-lg border border-white/40 dark:border-white/10 p-8">
        {/* Header with Icon */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            Enterprise Login
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buy waste in bulk with verified suppliers
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Company Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="company@example.com"
              className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter your password"
                className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-primary hover:underline text-sm">
              Forgot password?
            </Link>
          </div>

          {/* Submit Button — project gradient */}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-3 bg-gradient-to-r from-primary to-emerald-400 text-white font-extrabold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition disabled:opacity-50 mt-6 shadow-lg"
          >
            {loading ? 'Logging in...' : 'Login as Enterprise →'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-white/20"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white/60 dark:bg-white/10 text-gray-600 dark:text-gray-400">
              Demo Access
            </span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 text-sm text-emerald-900 dark:text-emerald-100 mb-6">
          <p className="font-medium mb-2">🔓 Demo Mode</p>
          <p>
            Try logging in with any company email and password. This is a prototype
            to showcase enterprise features.
          </p>
        </div>

        {/* Coming Soon Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 text-sm text-amber-900 dark:text-amber-100 mb-6">
          <p className="font-medium mb-2">⏰ Enterprise Signups Coming Soon</p>
          <p>
            Official enterprise registration and verification will be available
            soon. For early access, contact our team.
          </p>
        </div>

        {/* Navigation Links */}
        <div className="space-y-3 text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>
            Looking for a regular account?{' '}
            <Link to="/login" className="text-primary font-medium hover:underline">
              User login
            </Link>
          </p>
          <p>
            Not a buyer yet?{' '}
            <Link to="/" className="text-primary font-medium hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnterpriseLogin;
