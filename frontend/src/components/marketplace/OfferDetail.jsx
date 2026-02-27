import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';

const OfferDetail = () => {
  const { offerId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark: darkMode } = useDarkMode();
  const messagesEndRef = useRef(null);

  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [counterPrice, setCounterPrice] = useState('');
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (user && offerId) {
      fetchOfferDetails();
      // Poll for updates every 5 seconds
      const interval = setInterval(fetchOfferDetails, 5000);
      return () => clearInterval(interval);
    }
  }, [offerId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [offer?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchOfferDetails = async () => {
    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/v1/marketplace/offers/${offerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        setOffer(data.offer);
      } else {
        setError(data.error || 'Failed to fetch offer details');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageText.trim()) return;
    setSendingMessage(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${API_URL}/api/v1/marketplace/offers/${offerId}/message`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text: messageText }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setMessageText('');
        fetchOfferDetails();
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleCounterOffer = async () => {
    if (!counterPrice) return;
    setActionLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${API_URL}/api/v1/marketplace/offers/${offerId}/counter`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ counterPrice: parseFloat(counterPrice) }),
        }
      );
      const data = await response.json();
      if (data.success) {
        setCounterPrice('');
        setShowCounterForm(false);
        fetchOfferDetails();
      }
    } catch (err) {
      console.error('Counter offer failed:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOfferAction = async (action) => {
    setActionLoading(true);
    try {
      const token = await user.getIdToken();
      const response = await fetch(
        `${API_URL}/api/v1/marketplace/offers/${offerId}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success) {
        fetchOfferDetails();
      }
    } catch (err) {
      console.error(`Failed to ${action} offer:`, err);
    } finally {
      setActionLoading(false);
    }
  };

  const isSeller = offer?.sellerId === user?.uid;
  const isBuyer = offer?.buyerId === user?.uid;

  const getStatusBanner = () => {
    if (!offer) return null;
    switch (offer.status) {
      case 'pending':
        return (
          <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 flex items-center gap-3">
            <span className="material-icons-round text-2xl text-yellow-600 dark:text-yellow-400">schedule</span>
            <div>
              <p className="font-medium text-yellow-900 dark:text-yellow-200">
                Offer Pending
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {isSeller
                  ? 'You have a new offer to review'
                  : 'Waiting for seller response'}
              </p>
            </div>
          </div>
        );
      case 'negotiating':
        return (
          <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
            <span className="material-icons-round text-2xl text-blue-600 dark:text-blue-400">chat</span>
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-200">
                In Negotiation
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Both parties are discussing terms
              </p>
            </div>
          </div>
        );
      case 'accepted':
        return (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl p-4 flex items-center gap-3">
            <span className="material-icons-round text-2xl text-green-600 dark:text-green-400">check_circle</span>
            <div>
              <p className="font-medium text-green-900 dark:text-green-200">
                Offer Accepted!
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                Both parties agreed on terms. Complete the exchange when ready.
              </p>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div className="bg-emerald-50/50 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 rounded-xl p-4 flex items-center gap-3">
            <span className="material-icons-round text-2xl text-emerald-800/60 dark:text-emerald-100/60">check_circle</span>
            <div>
              <p className="font-medium text-emerald-950 dark:text-emerald-200">
                Transaction Completed
              </p>
              <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60">
                This exchange has been successfully completed
              </p>
            </div>
          </div>
        );
      case 'cancelled':
        return (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center gap-3">
            <span className="material-icons-round text-2xl text-red-600 dark:text-red-400">error</span>
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">
                Offer Cancelled
              </p>
              <p className="text-sm text-red-700 dark:text-red-300">
                This offer has been cancelled
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-300 dark:border-emerald-800 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-emerald-800/60 dark:text-emerald-100/60">Loading offer details...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center transition-colors">
        <div className="text-center">
          <span className="material-icons-round text-5xl text-red-500 mx-auto mb-3">error</span>
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">
            {error || 'Offer not found'}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors flex flex-col">
      {/* Header */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-950 dark:hover:text-white transition-colors"
            >
              <span className="material-icons-round text-xl">chevron_left</span>
              Back
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-white">
                Offer #{offerId.substring(0, 8)}
              </h1>
              <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60">
                {isSeller ? 'You are the seller' : 'You are the buyer'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 flex-1 flex flex-col gap-6 w-full">
        {/* Status Banner */}
        {getStatusBanner()}

        {/* Offer Summary */}
        <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
          <h2 className="text-lg font-extrabold tracking-tight text-emerald-950 dark:text-white mb-4">
            Offer Details
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 uppercase tracking-wide">
                Price
              </p>
              <p className="text-xl font-extrabold text-primary">
                ${offer.offeredPrice}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 uppercase tracking-wide">
                Quantity
              </p>
              <p className="text-lg font-semibold text-emerald-950 dark:text-white">
                {offer.quantity} {offer.unit}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 uppercase tracking-wide">
                Status
              </p>
              <p className="text-lg font-semibold text-emerald-950 dark:text-white capitalize">
                {offer.status}
              </p>
            </div>
            <div>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 uppercase tracking-wide">
                Date
              </p>
              <p className="text-lg font-semibold text-emerald-950 dark:text-white">
                {new Date(
                  offer.timeline?.createdAt?.toDate?.() || offer.timeline?.createdAt
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {(offer.status === 'pending' || offer.status === 'negotiating') && (
          <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
            <h3 className="text-lg font-extrabold tracking-tight text-emerald-950 dark:text-white mb-4">
              Actions
            </h3>
            <div className="flex flex-wrap gap-3">
              {isSeller && offer.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleOfferAction('accept')}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg disabled:opacity-50"
                  >
                    Accept Offer
                  </button>
                  <button
                    onClick={() => setShowCounterForm(!showCounterForm)}
                    className="px-5 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg"
                  >
                    Counter Offer
                  </button>
                  <button
                    onClick={() => handleOfferAction('reject')}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-red-600 dark:bg-red-500 text-white font-medium rounded-xl hover:bg-red-700 dark:hover:bg-red-600 transition shadow-lg disabled:opacity-50"
                  >
                    Reject
                  </button>
                </>
              )}

              {isBuyer && offer.status === 'negotiating' && (
                <>
                  <button
                    onClick={() => handleOfferAction('accept')}
                    disabled={actionLoading}
                    className="px-5 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg disabled:opacity-50"
                  >
                    Accept Counter
                  </button>
                  <button
                    onClick={() => setShowCounterForm(!showCounterForm)}
                    className="px-5 py-2 bg-blue-600 dark:bg-blue-500 text-white font-medium rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow-lg"
                  >
                    New Counter Offer
                  </button>
                </>
              )}

              {offer.status === 'accepted' && (
                <button
                  onClick={() => handleOfferAction('complete')}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg disabled:opacity-50"
                >
                  Mark as Completed
                </button>
              )}
            </div>

            {/* Counter Offer Form */}
            {showCounterForm && (
              <div className="mt-4 flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-800/50 dark:text-emerald-100/50 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Enter counter price"
                    className="w-full pl-8 pr-4 py-2.5 bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 rounded-xl text-emerald-950 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  onClick={handleCounterOffer}
                  disabled={actionLoading || !counterPrice}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg disabled:opacity-50"
                >
                  Send Counter
                </button>
              </div>
            )}
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 flex flex-col min-h-[300px] transition-colors">
          <div className="p-4 border-b border-white/40 dark:border-white/10">
            <h3 className="text-lg font-extrabold tracking-tight text-emerald-950 dark:text-white">
              Messages
            </h3>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {offer.messages && offer.messages.length > 0 ? (
              offer.messages.map((msg, idx) => {
                const isMe = msg.sender === user.uid;
                return (
                  <div
                    key={idx}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-3 ${
                        isMe
                          ? 'bg-gradient-to-r from-primary to-emerald-400 text-white'
                          : 'bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white'
                      }`}
                    >
                      {msg.type === 'counter_offer' && (
                        <p className="text-xs font-medium mb-1 opacity-80">
                          Counter Offer
                        </p>
                      )}
                      <p className="text-sm">{msg.text}</p>
                      <p
                        className={`text-xs mt-1 ${
                          isMe ? 'text-white/60' : 'text-emerald-800/50 dark:text-emerald-100/40'
                        }`}
                      >
                        {new Date(
                          msg.timestamp?.toDate?.() || msg.timestamp
                        ).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-emerald-800/50 dark:text-emerald-100/40">
                <span className="material-icons-round text-3xl mx-auto mb-2 opacity-50">chat</span>
                <p>No messages yet. Start the conversation!</p>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          {offer.status !== 'completed' && offer.status !== 'cancelled' && (
            <div className="p-4 border-t border-white/40 dark:border-white/10">
              <div className="flex gap-3">
                <input
                  type="text"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2.5 bg-white/70 dark:bg-white/10 border border-white/40 dark:border-white/10 rounded-xl text-emerald-950 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={sendingMessage || !messageText.trim()}
                  className="px-4 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg disabled:opacity-50"
                >
                  <span className="material-icons-round text-xl">send</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OfferDetail;
