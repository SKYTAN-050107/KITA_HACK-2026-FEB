import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        return 'bg-white/50 dark:bg-white/5 text-emerald-800 dark:text-emerald-200/70';
      case 'listed':
        return 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300';
      case 'sold':
        return 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300';
      default:
        return 'bg-white/50 dark:bg-white/5 text-emerald-800 dark:text-emerald-200/70';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/dashboard/marketplace')}
          className="flex items-center gap-2 text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-950 dark:hover:text-white transition-colors"
        >
          <span className="material-icons-round text-xl">chevron_left</span>
          Back
        </button>
        <button
          onClick={() => navigate('/dashboard/marketplace/listings/new')}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
        >
          <span className="material-icons-round text-base">add</span>
          New Listing
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-600/10 dark:from-primary/20 dark:to-emerald-600/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
          <span className="material-icons-round text-3xl">inventory_2</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
            My Listings
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">Manage and track your waste items</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex gap-2 flex-wrap">
            {['all', 'draft', 'listed', 'sold'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 capitalize ${
                  filterStatus === status
                    ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/40 shadow-md'
                    : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
                }`}
              >
                {status}
              </button>
            ))}
        </div>
      </div>

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-300 dark:border-emerald-800 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-emerald-800/60 dark:text-emerald-100/60">Loading listings...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
            <span className="material-icons-round text-xl text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5">error</span>
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">Error loading listings</p>
              <p className="text-sm text-red-800 dark:text-red-300 mt-1">{error}</p>
            </div>
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-emerald-800/60 dark:text-emerald-100/60 text-lg mb-4">No listings yet</p>
            <p className="text-emerald-800/50 dark:text-emerald-100/40 mb-6">
              {filterStatus === 'all'
                ? 'Create your first listing to start selling waste'
                : `No ${filterStatus} listings`}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={() => navigate('/dashboard/marketplace/listings/new')}
                className="inline-block px-6 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
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
                  <div className="w-32 h-32 rounded-xl bg-emerald-100/50 dark:bg-white/5 flex-shrink-0 overflow-hidden">
                    {listing.photos && listing.photos[0] ? (
                      <img
                        src={listing.photos[0]}
                        alt={listing.wasteType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-emerald-800/40 dark:text-emerald-100/40">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-950 dark:text-white">
                          {listing.description || listing.wasteType.replace(/_/g, ' ')}
                        </h3>
                        <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60">
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
                        <p className="text-emerald-800/60 dark:text-emerald-100/60">Price</p>
                        <p className="font-semibold text-primary text-lg">
                          RM{listing.pricePerUnit}/{listing.unit}
                        </p>
                      </div>
                      <div>
                        <p className="text-emerald-800/60 dark:text-emerald-100/60">Total</p>
                        <p className="font-semibold text-emerald-950 dark:text-white">
                          RM{listing.totalPrice}
                        </p>
                      </div>
                      {listing.location?.city && (
                        <div>
                          <p className="text-emerald-800/60 dark:text-emerald-100/60">Location</p>
                          <p className="font-semibold text-emerald-950 dark:text-white">
                            {listing.location.city}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-emerald-800/60 dark:text-emerald-100/60">Listed</p>
                        <p className="font-semibold text-emerald-950 dark:text-white">
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
                      className="px-3 py-2 bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white font-medium rounded-xl hover:bg-primary/10 dark:hover:bg-white/20 transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      <span className="material-icons-round text-base">visibility</span>
                      View
                    </Link>
                    <Link
                      to={`/dashboard/marketplace/listings/${listing.listingId}/edit`}
                      className="px-3 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium rounded-xl hover:bg-blue-200 dark:hover:bg-blue-900/50 transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      <span className="material-icons-round text-base">edit</span>
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.listingId)}
                      className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition flex items-center justify-center gap-2 whitespace-nowrap text-sm"
                    >
                      <span className="material-icons-round text-base">delete</span>
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
