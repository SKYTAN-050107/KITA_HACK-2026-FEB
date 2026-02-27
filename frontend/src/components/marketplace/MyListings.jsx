import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Edit, Trash2, Eye, Plus, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';

const MyListings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark: darkMode } = useDarkMode();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    if (user) {
      fetchListings();
    }
  }, [filterStatus, user]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await user.getIdToken();
      const statusParam = filterStatus !== 'all' ? `?status=${filterStatus}` : '';

      const response = await fetch(`${API_URL}/api/v1/marketplace/my-listings${statusParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setListings(data.listings || []);
      } else {
        setError(data.error || 'Failed to fetch listings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm('Delete this listing? This action cannot be undone.')) {
      return;
    }

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${API_URL}/api/v1/marketplace/listings/${listingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        fetchListings();
      } else {
        alert('Failed to delete listing: ' + data.error);
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300';
      case 'listed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
      case 'sold':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
      default:
        return 'bg-gray-100 dark:bg-white/10 text-gray-800 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* Header */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard/marketplace')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Back
            </button>
            <button
              onClick={() => navigate('/dashboard/marketplace/listings/new')}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-400 text-white font-medium rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
            >
              <Plus className="w-4 h-4" />
              New Listing
            </button>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            My Listings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage and track your waste items</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border-b border-white/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 flex-wrap">
            {['all', 'draft', 'listed', 'sold'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-xl font-medium transition capitalize ${
                  filterStatus === status
                    ? 'bg-gradient-to-r from-primary to-emerald-400 text-white'
                    : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading listings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">Error loading listings</p>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No listings yet</p>
            <p className="text-gray-500 dark:text-gray-500 mb-6">
              {filterStatus === 'all'
                ? 'Create your first listing to start selling waste'
                : `No ${filterStatus} listings`}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => navigate('/dashboard/marketplace/listings/new')}
                className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-emerald-400 text-white font-medium rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
              >
                Create First Listing
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {listings.map((listing) => (
              <div
                key={listing.listingId}
                className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 overflow-hidden hover:shadow-md transition"
              >
                <div className="flex gap-4 p-4">
                  {/* Image */}
                  <div className="w-32 h-32 rounded-xl bg-gray-200 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                    {listing.photos && listing.photos[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.wasteType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {listing.description || listing.wasteType.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {listing.wasteType.replace(/_/g, ' ')} • {listing.quantity} {listing.unit}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${getStatusColor(
                          listing.status
                        )}`}
                      >
                        {listing.status}
                      </span>
                    </div>

                    {/* Price & Location */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Price</p>
                        <p className="font-semibold text-primary text-lg">
                          ${listing.pricePerUnit}/{listing.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Total</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${listing.totalPrice}
                        </p>
                      </div>
                      {listing.location?.city && (
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Location</p>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {listing.location.city}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Listed</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {new Date(
                            listing.createdAt?.toDate?.() || listing.createdAt
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {listing.tags && listing.tags.length > 0 && (
                      <div className="flex gap-2 mb-4">
                        {listing.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 justify-center">
                    <Link
                      to={`/dashboard/marketplace/listings/${listing.listingId}`}
                      className="px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    <Link
                      to={`/dashboard/marketplace/listings/${listing.listingId}/edit`}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.listingId)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyListings;
