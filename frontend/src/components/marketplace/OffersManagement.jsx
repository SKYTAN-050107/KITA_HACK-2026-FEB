import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
        return 'bg-emerald-50/50 dark:bg-white/5 border-emerald-900/10 dark:border-white/10 text-emerald-950 dark:text-emerald-200';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200';
      default:
        return 'bg-emerald-50/50 dark:bg-white/5 border-emerald-900/10 dark:border-white/10 text-emerald-950 dark:text-emerald-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return <span className="material-icons-round text-xl text-green-600 dark:text-green-400">check_circle</span>;
      case 'cancelled':
        return <span className="material-icons-round text-xl text-red-600 dark:text-red-400">cancel</span>;
      case 'pending':
        return <span className="material-icons-round text-xl text-yellow-600 dark:text-yellow-400">schedule</span>;
      default:
        return <span className="material-icons-round text-xl text-blue-600 dark:text-blue-400">chat</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate('/dashboard/marketplace')}
          className="flex items-center gap-2 text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-950 dark:hover:text-white transition-colors"
        >
          <span className="material-icons-round text-xl">chevron_left</span>
          Back
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-600/10 dark:from-primary/20 dark:to-emerald-600/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <span className="material-icons-round text-3xl">handshake</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
            My Offers
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
            Manage your buying and selling transactions
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                activeTab === 'received'
                  ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/40 shadow-md'
                  : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              Offers Received ({offers.filter((o) => o.sellerId === user?.uid).length})
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
                activeTab === 'sent'
                  ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/40 shadow-md'
                  : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
              }`}
            >
              Offers Sent ({offers.filter((o) => o.buyerId === user?.uid).length})
            </button>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-300 dark:border-emerald-800 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-emerald-800/60 dark:text-emerald-100/60">Loading offers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
            <p className="font-medium">Error: {error}</p>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-emerald-800/60 dark:text-emerald-100/60 text-lg mb-4">No offers yet</p>
            <p className="text-emerald-800/50 dark:text-emerald-100/40 mb-6">
              {activeTab === 'received'
                ? 'Buyers will see your listings and make offers'
                : 'Browse the marketplace to make offers on items'}
            </p>
            {activeTab === 'sent' && (
              <button
                onClick={() => navigate('/dashboard/marketplace')}
                className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
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
        return <span className="material-icons-round text-xl text-green-600 dark:text-green-400">check_circle</span>;
      case 'cancelled':
        return <span className="material-icons-round text-xl text-red-600 dark:text-red-400">cancel</span>;
      case 'pending':
        return <span className="material-icons-round text-xl text-yellow-600 dark:text-yellow-400">schedule</span>;
      default:
        return <span className="material-icons-round text-xl text-blue-600 dark:text-blue-400">chat</span>;
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
        return 'bg-white/50 dark:bg-white/5 text-emerald-800 dark:text-emerald-200 border-emerald-900/10 dark:border-white/10';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800';
      default:
        return 'bg-white/50 dark:bg-white/5 text-emerald-800 dark:text-emerald-200 border-emerald-900/10 dark:border-white/10';
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
            <h3 className="font-semibold text-emerald-950 dark:text-white text-lg">
              {isReceived
                ? `Offer from ${offer.buyerId.substring(0, 8)}`
                : `Offer to ${offer.sellerId.substring(0, 8)}`}
            </h3>
            <p className="text-2xl font-extrabold text-primary">RM{offer.offeredPrice}</p>
          </div>

          {/* Details */}
          <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-3">
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
              <div className="flex items-center gap-1 text-sm text-emerald-800/60 dark:text-emerald-100/60">
                <span className="material-icons-round text-base">chat</span>
                {messageCount} message{messageCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="text-right text-xs text-emerald-800/50 dark:text-emerald-100/40 whitespace-nowrap">
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
        <div className="bg-emerald-50/50 dark:bg-white/5 rounded-xl p-3 text-sm">
          <p className="text-emerald-800/70 dark:text-emerald-200/70">
            <span className="font-medium text-emerald-950 dark:text-white">
              {lastMessage.sender === userId ? 'You' : 'Them'}:
            </span>{' '}
            {lastMessage.text.substring(0, 50)}
            {lastMessage.text.length > 50 ? '...' : ''}
          </p>
          <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 mt-1">
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
