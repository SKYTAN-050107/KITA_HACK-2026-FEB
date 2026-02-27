import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import useDarkMode from '../../hooks/useDarkMode';

/**
 * EnterpriseMarketplace — Same as user Marketplace but without the Offered Items tab.
 * Routes under /dashboard/enterprise/marketplace
 */
const EnterpriseMarketplace = () => {
  const { isDark: darkMode } = useDarkMode();
  const [searchParams] = useSearchParams();
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
  const [uploadedPhoto, setUploadedPhoto] = useState(null);
  const fileInputRef = useRef(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    wasteType: '',
    quantity: '',
    unit: 'kg',
    budget: '',
    description: '',
  });

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  /* ── Demo data ── */
  const DEMO_LISTINGS = [
    {
      listingId: 'demo-plastic-bottles',
      wasteType: 'plastic_bottle',
      description: 'Bulk PET Plastic Bottles — Cleaned & Ready for Recycling',
      quantity: 50,
      unit: 'kg',
      condition: 'Used · Clean',
      pricePerUnit: 0.35,
      totalPrice: 17.50,
      photos: ['/pexels-640491770-27666146.jpg'],
      sellerProfile: { name: 'GreenCollect MY', rating: 4.8, reviewCount: 24 },
      location: { city: 'Johor Bahru' },
    },
  ];

  const DEMO_REQUESTS = [
    {
      requestId: 'demo-aluminum-cans',
      wasteType: 'aluminum_can',
      description: 'Looking for large quantities of empty aluminum beverage cans for our smelting facility. Must be dry and free of food residue.',
      quantityNeeded: 200,
      unit: 'kg',
      priceOffered: 1.20,
      photos: ['/bag-of-cans.png'],
      buyerProfile: { companyName: 'MetalWorks Recycling Sdn Bhd', name: 'MetalWorks Recycling', rating: 4.9, reviewCount: 57, verificationStatus: 'verified' },
      location: { city: 'Kuala Lumpur' },
      deadline: '2026-04-15',
    },
  ];

  const DEMO_OFFERED = [
    {
      offeredId: 'demo-cardboard-boxes',
      wasteType: 'paper',
      description: 'Corrugated Cardboard Boxes — Various Sizes, Flattened & Bundled',
      quantity: 120,
      unit: 'kg',
      condition: 'Used · Dry',
      pricePerUnit: 0.18,
      totalPrice: 21.60,
      photos: ['/corrugated-board-boxes-examples-1024x683.png'],
      sellerProfile: { name: 'BoxCycle Enterprise', rating: 4.6, reviewCount: 31 },
      location: { city: 'Penang' },
      status: 'Accepting Offers',
    },
  ];

  const allListings = [...DEMO_LISTINGS, ...listings];
  const allRequests = [...DEMO_REQUESTS, ...buyerRequests];

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUploadedPhoto(ev.target.result);
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (activeTab === 'listings') fetchListings();
  }, [activeTab, filters]);

  useEffect(() => {
    if (activeTab === 'requests') fetchBuyerRequests();
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
      if (data.success) setListings(data.listings);
      else setError(data.error || 'Failed to fetch listings');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
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
      if (data.success) setBuyerRequests(data.requests);
      else setError(data.error || 'Failed to fetch requests');
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleFilterChange = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));
  const clearFilters = () => setFilters({ wasteType: '', minPrice: '', maxPrice: '', sortBy: 'newest' });

  const handleRequestFormChange = (key, value) => setRequestForm((prev) => ({ ...prev, [key]: value }));

  const handleSubmitRequest = (e) => {
    e.preventDefault();
    alert(`Buyer request posted!\nWaste: ${requestForm.wasteType}\nQty: ${requestForm.quantity} ${requestForm.unit}\nBudget: RM${requestForm.budget}\n${requestForm.description}`);
    setShowRequestForm(false);
    setRequestForm({ wasteType: '', quantity: '', unit: 'kg', budget: '', description: '' });
  };

  const handleMakeOffer = (item, type) => {
    const target = type === 'listing' ? item.listingId : item.requestId;
    const targetType = type === 'listing' ? 'listing' : 'request';
    window.location.href = `/dashboard/enterprise/marketplace/offers/new?${targetType}=${target}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-emerald-600/10 dark:from-primary/20 dark:to-emerald-600/20 flex items-center justify-center text-primary border border-primary/20 shadow-inner">
            <span className="material-icons-round text-xl sm:text-3xl">storefront</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
              Enterprise Marketplace
            </h1>
            <p className="text-xs sm:text-base text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
              Buy and sell valuable waste with confidence
            </p>
          </div>
        </div>

        {/* Upload Item Button — hidden on Buyer Requests tab */}
        {activeTab !== 'requests' && (
          <div className="w-full sm:w-auto sm:ml-auto flex items-center gap-3">
            {uploadedPhoto && (
              <img src={uploadedPhoto} alt="Uploaded" className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover border-2 border-primary/30 shadow" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg text-sm sm:text-base"
            >
              <span className="material-icons-round text-lg">add_a_photo</span>
              Upload Item
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setActiveTab('listings')}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
            activeTab === 'listings'
              ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/40 shadow-md'
              : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
          }`}
        >
          Available Items ({allListings.length})
        </button>
        <button
          onClick={() => setActiveTab('offered')}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
            activeTab === 'offered'
              ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/40 shadow-md'
              : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
          }`}
        >
          Offered Items ({DEMO_OFFERED.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-300 ${
            activeTab === 'requests'
              ? 'bg-primary/15 dark:bg-primary/20 text-primary border-primary/40 shadow-md'
              : 'bg-white/40 dark:bg-white/5 text-emerald-800/60 dark:text-emerald-200/40 border-emerald-900/10 dark:border-white/10 hover:bg-white/60 dark:hover:bg-white/10'
          }`}
        >
          Buyer Requests ({allRequests.length})
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6">
        <div className="flex gap-3 flex-wrap items-center">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 text-emerald-800/70 dark:text-emerald-200/70 hover:bg-primary/5 dark:hover:bg-white/5 transition"
          >
            <span className="material-icons-round text-base">filter_list</span>
            Filters
          </button>
          {(filters.wasteType || filters.minPrice || filters.maxPrice) && (
            <button onClick={clearFilters} className="text-sm text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-950 dark:hover:text-white underline">
              Clear filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 p-4 bg-white/40 dark:bg-white/5 rounded-xl border border-white/40 dark:border-white/10 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Waste Type</label>
                <select value={filters.wasteType} onChange={(e) => handleFilterChange('wasteType', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
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
              <div>
                <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Min Price (RM)</label>
                <input type="number" value={filters.minPrice} onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Max Price (RM)</label>
                <input type="number" value={filters.maxPrice} onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors" placeholder="999" />
              </div>
              <div>
                <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Sort By</label>
                <select value={filters.sortBy} onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors">
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

      {/* Content */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-emerald-300 dark:border-emerald-800 border-t-primary rounded-full animate-spin mb-3"></div>
              <p className="text-emerald-800/60 dark:text-emerald-100/60">Loading...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
            <p className="font-medium">Error: {error}</p>
          </div>
        ) : activeTab === 'listings' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allListings.map((listing) => (
                <div key={listing.listingId} className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 overflow-hidden hover:shadow-lg transition">
                  {/* Image */}
                  <div className="w-full h-48 bg-emerald-100/50 dark:bg-white/5 relative overflow-hidden">
                    {listing.photos && listing.photos[0] ? (
                      <img src={listing.photos[0]} alt={listing.wasteType} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-round text-5xl text-emerald-800/40 dark:text-emerald-100/40">search</span>
                      </div>
                    )}
                    {listing.condition && (
                      <div className="absolute top-2 right-2 bg-emerald-950/80 text-white text-xs font-medium px-2 py-1 rounded-lg">
                        {listing.condition}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-1">{listing.wasteType.replace(/_/g, ' ')}</p>
                    <h3 className="font-semibold text-emerald-950 dark:text-white mb-2 line-clamp-2">{listing.description || listing.wasteType}</h3>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-3">{listing.quantity} {listing.unit}</p>

                    <div className="mb-3">
                      <p className="text-2xl font-extrabold text-primary">
                        RM{listing.pricePerUnit}{' '}
                        <span className="text-sm text-emerald-800/60 dark:text-emerald-100/60 font-normal">/{listing.unit}</span>
                      </p>
                      <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40">Total: RM{listing.totalPrice}</p>
                    </div>

                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-emerald-900/10 dark:border-white/10">
                      <div className="w-8 h-8 rounded-full bg-emerald-200 dark:bg-white/20"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-950 dark:text-white truncate">{listing.sellerProfile?.name}</p>
                        {listing.sellerProfile?.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="material-icons-round text-sm text-yellow-400">star</span>
                            <span className="text-xs text-emerald-800/60 dark:text-emerald-100/60">
                              {listing.sellerProfile.rating.toFixed(1)} ({listing.sellerProfile.reviewCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {listing.location?.city && (
                      <div className="flex items-center gap-1 text-xs text-emerald-800/60 dark:text-emerald-100/60 mb-4">
                        <span className="material-icons-round text-sm">location_on</span>
                        {listing.location.city}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-2 bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white text-sm font-medium rounded-xl hover:bg-primary/10 dark:hover:bg-white/20 transition text-center">
                        View
                      </button>
                      <button
                        onClick={() => handleMakeOffer(listing, 'listing')}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 text-sm font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition"
                      >
                        Offer
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'requests' ? (
          <div>
            {/* Post Buyer Request Button */}
            <div className="flex justify-end mb-6">
              <button
                onClick={() => setShowRequestForm(!showRequestForm)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all border border-emerald-50 dark:border-white/20 cursor-pointer"
              >
                <span className="material-icons-round text-lg">add</span>
                Post Buyer Request
              </button>
            </div>

            {/* Post Buyer Request Form (collapsible) */}
            {showRequestForm && (
              <div className="mb-8 bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
                <h2 className="text-xl font-extrabold tracking-tight text-emerald-950 dark:text-white mb-4">
                  New Buyer Request
                </h2>
                <form onSubmit={handleSubmitRequest} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Waste Type</label>
                    <select
                      value={requestForm.wasteType}
                      onChange={(e) => handleRequestFormChange('wasteType', e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    >
                      <option value="">Select type</option>
                      <option value="plastic_bottle">Plastic Bottles</option>
                      <option value="aluminum_can">Aluminum Cans</option>
                      <option value="paper">Paper & Cardboard</option>
                      <option value="metal">Metal</option>
                      <option value="glass">Glass</option>
                      <option value="organic">Organic Waste</option>
                      <option value="electronics">Electronics</option>
                      <option value="textiles">Textiles</option>
                    </select>
                  </div>

                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Quantity</label>
                      <input
                        type="number"
                        value={requestForm.quantity}
                        onChange={(e) => handleRequestFormChange('quantity', e.target.value)}
                        required
                        placeholder="e.g. 500"
                        className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      />
                    </div>
                    <div className="w-24">
                      <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Unit</label>
                      <select
                        value={requestForm.unit}
                        onChange={(e) => handleRequestFormChange('unit', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                      >
                        <option value="kg">kg</option>
                        <option value="tonnes">tonnes</option>
                        <option value="pieces">pieces</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Budget (RM)</label>
                    <input
                      type="number"
                      value={requestForm.budget}
                      onChange={(e) => handleRequestFormChange('budget', e.target.value)}
                      required
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-emerald-800/70 dark:text-emerald-200/70 mb-2">Description</label>
                    <input
                      type="text"
                      value={requestForm.description}
                      onChange={(e) => handleRequestFormChange('description', e.target.value)}
                      placeholder="Describe your requirements..."
                      className="w-full px-3 py-2 rounded-xl border border-emerald-900/10 dark:border-white/20 bg-white/80 dark:bg-white/5 text-emerald-950 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                    />
                  </div>

                  <div className="md:col-span-2 flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRequestForm(false)}
                      className="px-5 py-2 bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white font-medium rounded-xl border border-emerald-900/10 dark:border-white/10 hover:bg-primary/10 dark:hover:bg-white/10 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition shadow-lg"
                    >
                      Submit Request
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {allRequests.map((request) => (
                <div key={request.requestId} className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 hover:shadow-lg transition">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-1">
                        {request.buyerProfile?.verificationStatus === 'verified' ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-1 rounded-lg text-xs font-medium">✓ Verified Buyer</span>
                        ) : null}
                      </p>
                      <h3 className="font-semibold text-emerald-950 dark:text-white">{request.buyerProfile?.companyName || request.buyerProfile?.name}</h3>
                      {request.buyerProfile?.rating > 0 && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="material-icons-round text-sm text-yellow-400">star</span>
                          <span className="text-xs text-emerald-800/60 dark:text-emerald-100/60">
                            {request.buyerProfile.rating.toFixed(1)} ({request.buyerProfile.reviewCount})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {request.photos && request.photos[0] && (
                    <div className="mb-4 rounded-xl overflow-hidden h-48 bg-emerald-100/50 dark:bg-white/5">
                      <img src={request.photos[0]} alt={request.wasteType} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="mb-4 pb-4 border-b border-emerald-900/10 dark:border-white/10">
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-2">
                      Looking for: <span className="font-medium text-emerald-950 dark:text-white">{request.wasteType.replace(/_/g, ' ')}</span>
                    </p>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-2">
                      Quantity needed: <span className="font-medium text-emerald-950 dark:text-white">{request.quantityNeeded} {request.unit}</span>
                    </p>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60">{request.description}</p>
                  </div>

                  <div className="mb-4">
                    <p className="text-2xl font-extrabold text-primary mb-2">
                      RM{request.priceOffered}{' '}
                      <span className="text-sm text-emerald-800/60 dark:text-emerald-100/60 font-normal">/{request.unit}</span>
                    </p>
                    {request.location?.city && (
                      <div className="flex items-center gap-1 text-xs text-emerald-800/60 dark:text-emerald-100/60">
                        <span className="material-icons-round text-sm">location_on</span>
                        {request.location.city}
                      </div>
                    )}
                  </div>

                  {request.deadline && (
                    <div className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 mb-4">
                      <span className="material-icons-round text-sm">trending_up</span>
                      Deadline: {new Date(request.deadline).toLocaleDateString()}
                    </div>
                  )}

                  <button
                    onClick={() => handleMakeOffer(request, 'request')}
                    className="w-full px-4 py-2 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-bold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition"
                  >
                    View Detail
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : activeTab === 'offered' ? (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {DEMO_OFFERED.map((item) => (
                <div
                  key={item.offeredId}
                  className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 overflow-hidden hover:shadow-lg transition"
                >
                  {/* Image */}
                  <div className="w-full h-48 bg-emerald-100/50 dark:bg-white/5 relative overflow-hidden">
                    {item.photos && item.photos[0] ? (
                      <img
                        src={item.photos[0]}
                        alt={item.wasteType}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-round text-5xl text-emerald-800/40 dark:text-emerald-100/40">inventory_2</span>
                      </div>
                    )}
                    {item.condition && (
                      <div className="absolute top-2 right-2 bg-emerald-950/80 text-white text-xs font-medium px-2 py-1 rounded-lg">
                        {item.condition}
                      </div>
                    )}
                    {item.status && (
                      <div className="absolute top-2 left-2 bg-primary/90 text-emerald-950 text-xs font-bold px-2 py-1 rounded-lg">
                        {item.status}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-1 capitalize">
                      {item.wasteType.replace(/_/g, ' ')}
                    </p>
                    <h3 className="font-semibold text-emerald-950 dark:text-white mb-2 line-clamp-2">
                      {item.description}
                    </h3>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-3">
                      {item.quantity} {item.unit}
                    </p>

                    {/* Price */}
                    <div className="mb-3">
                      <p className="text-2xl font-extrabold text-primary">
                        RM{item.pricePerUnit}{' '}
                        <span className="text-sm text-emerald-800/60 dark:text-emerald-100/60 font-normal">
                          /{item.unit}
                        </span>
                      </p>
                      <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40">
                        Total: RM{item.totalPrice}
                      </p>
                    </div>

                    {/* Seller Profile */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-emerald-900/10 dark:border-white/10">
                      <div className="w-8 h-8 rounded-full bg-amber-200 dark:bg-amber-800/40 flex items-center justify-center">
                        <span className="material-icons-round text-sm text-amber-700 dark:text-amber-300">store</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-emerald-950 dark:text-white truncate">
                          {item.sellerProfile?.name}
                        </p>
                        {item.sellerProfile?.rating > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="material-icons-round text-sm text-yellow-400">star</span>
                            <span className="text-xs text-emerald-800/60 dark:text-emerald-100/60">
                              {item.sellerProfile.rating.toFixed(1)}
                              ({item.sellerProfile.reviewCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Location */}
                    {item.location?.city && (
                      <div className="flex items-center gap-1 text-xs text-emerald-800/60 dark:text-emerald-100/60 mb-4">
                        <span className="material-icons-round text-sm">location_on</span>
                        {item.location.city}
                      </div>
                    )}

                    {/* Actions */}
                    <div>
                      <button
                        className="w-full px-3 py-2 bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white text-sm font-medium rounded-xl hover:bg-primary/10 dark:hover:bg-white/20 transition text-center"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default EnterpriseMarketplace;
