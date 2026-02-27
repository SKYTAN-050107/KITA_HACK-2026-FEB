import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, TrendingUp, Filter, Search, ChevronRight } from 'lucide-react';
import useDarkMode from '../../hooks/useDarkMode';

const Marketplace = () => {
  const [darkMode] = useDarkMode();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'listings');
  const [listings, setListings] = useState([]);
  const [buyerRequests, setBuyerRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    wasteType: searchParams.get('wasteType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    sortBy: searchParams.get('sortBy') || 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // Fetch listings
  useEffect(() => {
    if (activeTab === 'listings') {
      fetchListings();
    }
  }, [activeTab, filters]);

  // Fetch buyer requests
  useEffect(() => {
    if (activeTab === 'requests') {
      fetchBuyerRequests();
    }
  }, [activeTab, filters]);

  const fetchListings = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.wasteType) params.append('wasteType', filters.wasteType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      params.append('sortBy', filters.sortBy);

      const response = await fetch(`${API_URL}/api/marketplace/listings?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setListings(data.listings);
      } else {
        setError(data.error || 'Failed to fetch listings');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBuyerRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.wasteType) params.append('wasteType', filters.wasteType);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await fetch(`${API_URL}/api/marketplace/requests?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setBuyerRequests(data.requests);
      } else {
        setError(data.error || 'Failed to fetch requests');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setFilters({
      wasteType: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'newest',
    });
  };

  const handleMakeOffer = (item, type) => {
    const target = type === 'listing' ? item.listingId : item.requestId;
    const targetType = type === 'listing' ? 'listing' : 'request';
    window.location.href = `/dashboard/marketplace/offers/new?${targetType}=${target}`;
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* Header */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-2">
            Marketplace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Buy and sell valuable waste with confidence
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border-b border-white/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('listings')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'listings'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Available Items ({listings.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`py-4 px-1 font-medium text-sm border-b-2 transition ${
                activeTab === 'requests'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Buyer Requests ({buyerRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl border-b border-white/40 dark:border-white/10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-3 flex-wrap items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {(filters.wasteType || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-white/40 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 transition-colors">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* Waste Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Waste Type
                  </label>
                  <select
                    value={filters.wasteType}
                    onChange={(e) => handleFilterChange('wasteType', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  >
                    <option value="">All types</option>
                    <option value="plastic_bottle">Plastic Bottles</option>
                    <option value="aluminum_can">Aluminum Cans</option>
                    <option value="paper">Paper</option>
                    <option value="metal">Metal</option>
                    <option value="glass">Glass</option>
                    <option value="organic">Organic Waste</option>
                    <option value="electronics">Electronics</option>
                    <option value="textiles">Textiles</option>
                  </select>
                </div>

                {/* Min Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Min Price ($)
                  </label>
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="0"
                  />
                </div>

                {/* Max Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Max Price ($)
                  </label>
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    placeholder="999"
                  />
                </div>

                {/* Sort */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="rating">Top Rated</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-gray-300 dark:border-gray-600 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
            <p className="font-medium">Error: {error}</p>
          </div>
        ) : activeTab === 'listings' ? (
          <div>
            {listings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">No listings found</p>
                <p className="text-gray-500 dark:text-gray-500">
                  Try adjusting your filters or check back later
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {listings.map((listing) => (
                  <div
                    key={listing.listingId}
                    className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 overflow-hidden hover:shadow-lg transition"
                  >
                    {/* Image */}
                    <div className="w-full h-48 bg-gray-200 dark:bg-white/5 relative overflow-hidden">
                      {listing.photos && listing.photos[0] ? (
                        <img
                          src={listing.photos[0]}
                          alt={listing.wasteType}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Search className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                        </div>
                      )}
                      {listing.condition && (
                        <div className="absolute top-2 right-2 bg-gray-900/80 text-white text-xs font-medium px-2 py-1 rounded-lg">
                          {listing.condition}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {listing.wasteType.replace(/_/g, ' ')}
                      </p>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
                        {listing.description || listing.wasteType}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                        {listing.quantity} {listing.unit}
                      </p>

                      {/* Price */}
                      <div className="mb-3">
                        <p className="text-2xl font-extrabold text-primary">
                          ${listing.pricePerUnit}{' '}
                          <span className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                            /{listing.unit}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          Total: ${listing.totalPrice}
                        </p>
                      </div>

                      {/* Seller Profile */}
                      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200 dark:border-white/10">
                        <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-white/20"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {listing.sellerProfile?.name}
                          </p>
                          {listing.sellerProfile?.rating > 0 && (
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600 dark:text-gray-400">
                                {listing.sellerProfile.rating.toFixed(1)}
                                ({listing.sellerProfile.reviewCount})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Location */}
                      {listing.location?.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400 mb-4">
                          <MapPin className="w-3 h-3" />
                          {listing.location.city}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link
                          to={`/dashboard/marketplace/listings/${listing.listingId}`}
                          className="flex-1 px-3 py-2 bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-white/20 transition text-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleMakeOffer(listing, 'listing')}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-emerald-400 text-white text-sm font-medium rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition"
                        >
                          Offer
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {buyerRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 text-lg mb-4">
                  No buyer requests found
                </p>
                <p className="text-gray-500 dark:text-gray-500">
                  Check back later for opportunities to sell
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {buyerRequests.map((request) => (
                  <div
                    key={request.requestId}
                    className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 hover:shadow-lg transition"
                  >
                    {/* Buyer Profile */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          {request.buyerProfile?.verificationStatus === 'verified' ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg text-xs font-medium">
                              ✓ Verified Buyer
                            </span>
                          ) : null}
                        </p>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {request.buyerProfile?.companyName || request.buyerProfile?.name}
                        </h3>
                        {request.buyerProfile?.rating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-400 fill-current" />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {request.buyerProfile.rating.toFixed(1)}
                              ({request.buyerProfile.reviewCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mb-4 pb-4 border-b border-gray-200 dark:border-white/10">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Looking for:{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {request.wasteType.replace(/_/g, ' ')}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Quantity needed:{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {request.quantityNeeded} {request.unit}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {request.description}
                      </p>
                    </div>

                    {/* Price & Location */}
                    <div className="mb-4">
                      <p className="text-2xl font-extrabold text-primary mb-2">
                        ${request.priceOffered}{' '}
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-normal">
                          /{request.unit}
                        </span>
                      </p>
                      {request.location?.city && (
                        <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                          <MapPin className="w-3 h-3" />
                          {request.location.city}
                        </div>
                      )}
                    </div>

                    {/* Deadline */}
                    {request.deadline && (
                      <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mb-4">
                        <TrendingUp className="w-3 h-3" />
                        Deadline: {new Date(request.deadline).toLocaleDateString()}
                      </div>
                    )}

                    {/* Action */}
                    <button
                      onClick={() => handleMakeOffer(request, 'request')}
                      className="w-full px-4 py-2 bg-gradient-to-r from-primary to-emerald-400 text-white font-medium rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition"
                    >
                      Respond with Your Waste
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Marketplace;
