import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';

const OffersManagement = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark: darkMode } = useDarkMode();
  const [activeTab, setActiveTab] = useState('received');
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (user) {
      fetchOffers();
    }
  }, [activeTab, user]);

  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/v1/marketplace/my-offers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        const allOffers =
          activeTab === 'received'
            ? data.offersAsSeller
            : activeTab === 'sent'
              ? data.offersAsBuyer
              : data.allOffers;

        setOffers(allOffers || []);
      } else {
        setError(data.error || 'Failed to fetch offers');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-900 dark:text-yellow-200';
      case 'negotiating':
        return 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200';
      case 'accepted':
        return 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200';
      case 'completed':
        return 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200';
      default:
        return 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* Header */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => navigate('/dashboard/marketplace')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            My Offers
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your buying and selling transactions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border-b border-white/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('received')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'received'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Offers Received ({offers.filter((o) => o.sellerId === user?.uid).length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'sent'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Offers Sent ({offers.filter((o) => o.buyerId === user?.uid).length})
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading offers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
            <p className="font-medium">Error: {error}</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No offers yet</p>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              {activeTab === 'received'
                ? 'Buyers will see your listings and make offers'
                : 'Browse the marketplace to make offers on items'}
            </p>
            {activeTab === 'sent' && (
              <button
                onClick={() => navigate('/dashboard/marketplace')}
                className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-emerald-400 text-white font-medium rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
              >
                Browse Marketplace
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => (
              <OfferCard
                key={offer.offerId}
                offer={offer}
                isReceived={activeTab === 'received'}
                userId={user.uid}
                onNavigate={(offerId) =>
                  navigate(`/dashboard/marketplace/offers/${offerId}`)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Individual Offer Card Component
 */
const OfferCard = ({ offer, isReceived, userId, onNavigate }) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />;
      default:
        return <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
      case 'negotiating':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800';
      case 'accepted':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800';
      case 'completed':
        return 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/10';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-white/10';
    }
  };

  const otherParty = isReceived ? offer.buyerId : offer.sellerId;
  const otherPartyName = isReceived ? 'Buyer' : 'Seller';

  const messageCount = offer.messages ? offer.messages.length : 0;
  const lastMessage =
    offer.messages && offer.messages.length > 0
      ? offer.messages[offer.messages.length - 1]
      : null;

  return (
    <button
      onClick={() => onNavigate(offer.offerId)}
      className="w-full text-left bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 hover:shadow-lg transition"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex-1">
          {/* Header: Item & Price */}
          <div className="flex items-baseline gap-3 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {isReceived
                ? `Offer from ${offer.buyerId.substring(0, 8)}`
                : `Offer to ${offer.sellerId.substring(0, 8)}`}
            </h3>
            <p className="text-2xl font-extrabold text-primary">${offer.offeredPrice}</p>
          </div>

          {/* Details */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {offer.quantity} {offer.unit}
            {offer.listingId && ' • From listing'}
            {offer.requestId && ' • For buyer request'}
          </p>

          {/* Status & Messages */}
          <div className="flex items-center gap-4">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium capitalize ${getStatusBadgeColor(
                offer.status
              )}`}
            >
              {getStatusIcon(offer.status)}
              {offer.status}
            </div>

            {messageCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <MessageCircle className="w-4 h-4" />
                {messageCount} message{messageCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="text-right text-xs text-gray-500 dark:text-gray-500 whitespace-nowrap">
          <p>
            {new Date(
              offer.timeline?.createdAt?.toDate?.() || offer.timeline?.createdAt
            ).toLocaleDateString()}
          </p>
          {offer.status === 'completed' && (
            <p className="text-primary font-medium mt-1">✓ Completed</p>
          )}
        </div>
      </div>

      {/* Last Message Preview */}
      {lastMessage && (
        <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 text-sm">
          <p className="text-gray-700 dark:text-gray-300">
            <span className="font-medium text-gray-900 dark:text-white">
              {lastMessage.sender === userId ? 'You' : 'Them'}:
            </span>{' '}
            {lastMessage.text.substring(0, 50)}
            {lastMessage.text.length > 50 ? '...' : ''}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
            {new Date(
              lastMessage.timestamp?.toDate?.() || lastMessage.timestamp
            ).toLocaleString()}
          </p>
        </div>
      )}
    </button>
  );
};

export default OffersManagement;
