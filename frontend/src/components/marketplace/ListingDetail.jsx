import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';

const ListingDetail = () => {
  const { listingId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark: darkMode } = useDarkMode();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const [isSeller, setIsSeller] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (listing && user) {
      setIsSeller(listing.sellerId === user.uid);
    }
  }, [listing, user]);

  const fetchListing = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/marketplace/listings/${listingId}`);
      const data = await response.json();

      if (data.success) {
        setListing(data.listing);
      } else {
        setError(data.error || 'Failed to fetch listing');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (isSeller) {
      alert('You cannot make an offer on your own listing');
      return;
    }

    navigate(`/dashboard/marketplace/offers/new?listing=${listingId}`);
  };

  const handleEdit = () => {
    navigate(`/dashboard/marketplace/listings/${listingId}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
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
        navigate('/dashboard/marketplace/listings');
      } else {
        alert('Failed to delete listing: ' + data.error);
      }
    } catch (err) {
      alert('Error deleting listing: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-emerald-300 dark:border-emerald-800 border-t-primary rounded-full animate-spin mb-3"></div>
          <p className="text-emerald-800/60 dark:text-emerald-100/60">Loading listing...</p>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 transition-colors">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/dashboard/marketplace')}
            className="flex items-center gap-2 text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-950 dark:hover:text-white mb-6 transition-colors"
          >
            <span className="material-icons-round text-base">chevron_left</span>
            Back to Marketplace
          </button>
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-800 dark:text-red-200">
            <div className="flex gap-3">
              <span className="material-icons-round text-xl flex-shrink-0 mt-0.5">error</span>
              <div>
                <p className="font-medium">Error loading listing</p>
                <p className="text-sm mt-1">{error || 'Listing not found'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* Header */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/dashboard/marketplace')}
            className="flex items-center gap-2 text-emerald-800/60 dark:text-emerald-100/60 hover:text-emerald-950 dark:hover:text-white transition-colors"
          >
            <span className="material-icons-round text-xl">chevron_left</span>
            Back
          </button>
          {isSeller && (
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white font-medium rounded-xl hover:bg-primary/10 dark:hover:bg-white/20 transition"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 font-medium rounded-xl hover:bg-red-200 dark:hover:bg-red-900/50 transition"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Images & Details */}
          <div className="lg:col-span-2">
            {/* Main Image */}
            <div className="bg-emerald-100/50 dark:bg-white/5 rounded-xl overflow-hidden mb-4 aspect-square lg:aspect-auto lg:h-96">
              {listing.photos && listing.photos[selectedPhoto] ? (
                <img
                  src={listing.photos[selectedPhoto]}
                  alt={listing.wasteType}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-200 dark:bg-white/10">
                  <span className="text-emerald-800/60 dark:text-emerald-100/60">No image</span>
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {listing.photos && listing.photos.length > 1 && (
              <div className="flex gap-2 mb-8">
                {listing.photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedPhoto(index)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition ${
                      selectedPhoto === index
                        ? 'border-primary'
                        : 'border-emerald-900/10 dark:border-white/20'
                    }`}
                  >
                    <img src={photo} alt={`View ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Details */}
            <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 transition-colors">
              <div className="mb-6">
                <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-1">Waste Type</p>
                <h1 className="text-3xl font-extrabold tracking-tight text-emerald-950 dark:text-white mb-2">
                  {listing.description || listing.wasteType.replace(/_/g, ' ')}
                </h1>
                <p className="text-emerald-800/60 dark:text-emerald-100/60">
                  {listing.wasteType.replace(/_/g, ' ')}
                </p>
              </div>

              {/* Condition Badge */}
              {listing.condition && (
                <div className="mb-6">
                  <span className="inline-block bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white text-sm font-medium px-3 py-1 rounded-xl">
                    Condition: {listing.condition}
                  </span>
                </div>
              )}

              {/* Quantity & Specs */}
              <div className="mb-6 pb-6 border-b border-emerald-900/10 dark:border-white/10">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-1">
                      Quantity Available
                    </p>
                    <p className="text-lg font-semibold text-emerald-950 dark:text-white">
                      {listing.quantity} {listing.unit}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mb-1">Listed On</p>
                    <p className="text-lg font-semibold text-emerald-950 dark:text-white">
                      {new Date(
                        listing.createdAt?.toDate?.() || listing.createdAt
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Description */}
              {listing.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-emerald-950 dark:text-white mb-2">Description</h3>
                  <p className="text-emerald-800/60 dark:text-emerald-100/60 leading-relaxed">
                    {listing.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {listing.tags && listing.tags.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-emerald-950 dark:text-white mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {listing.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-block bg-emerald-50 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-xs font-medium px-2 py-1 rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Location */}
              {listing.location && (
                <div className="flex gap-2 text-emerald-800/60 dark:text-emerald-100/60">
                  <span className="material-icons-round text-xl flex-shrink-0 mt-0.5">location_on</span>
                  <div>
                    <p className="text-sm font-medium">{listing.location.address}</p>
                    <p className="text-sm">{listing.location.city}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Price & Action */}
          <div className="lg:col-span-1">
            {/* Price Card */}
            <div className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-xl border border-white/40 dark:border-white/10 p-6 mb-6 sticky top-20 transition-colors">
              {/* Price */}
              <div className="mb-6">
                <p className="text-4xl font-extrabold text-primary mb-1">
                  ${listing.pricePerUnit}
                </p>
                <p className="text-emerald-800/60 dark:text-emerald-100/60 text-sm">
                  per {listing.unit} (Total: ${listing.totalPrice})
                </p>
              </div>

              {/* Currency & Status */}
              <div className="mb-6 pb-6 border-b border-emerald-900/10 dark:border-white/10">
                <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60">
                  Currency:{' '}
                  <span className="font-medium text-emerald-950 dark:text-white">
                    {listing.currency}
                  </span>
                </p>
                <p className="text-sm text-emerald-800/60 dark:text-emerald-100/60 mt-2">
                  Status:{' '}
                  <span className="font-medium text-primary capitalize">{listing.status}</span>
                </p>
              </div>

              {/* Seller Info */}
              <div className="bg-emerald-50/50 dark:bg-white/5 rounded-xl p-4 mb-6">
                <p className="text-xs text-emerald-800/60 dark:text-emerald-100/60 mb-3">Sold by</p>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-200 dark:bg-white/20 flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-emerald-950 dark:text-white text-sm">
                      {listing.sellerProfile?.name}
                    </p>
                    {listing.sellerProfile?.rating > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={`material-icons-round text-sm ${
                                i < Math.round(listing.sellerProfile.rating)
                                  ? 'text-yellow-400'
                                  : 'text-emerald-300 dark:text-emerald-800'
                              }`}>star</span>
                          ))}
                        </div>
                        <span className="text-xs text-emerald-800/60 dark:text-emerald-100/60">
                          {listing.sellerProfile.rating.toFixed(1)}(
                          {listing.sellerProfile.reviewCount})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              {!isSeller && (
                <button
                  onClick={handleMakeOffer}
                  className="w-full py-3 bg-gradient-to-r from-primary to-emerald-400 text-emerald-950 font-extrabold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition mb-3 shadow-lg"
                >
                  Make an Offer
                </button>
              )}

              {isSeller && (
                <div className="text-center text-emerald-800/60 dark:text-emerald-100/60 text-sm">
                  This is your listing
                </div>
              )}

              {/* Share Button */}
              <button className="w-full py-3 bg-white/50 dark:bg-white/5 text-emerald-950 dark:text-white font-medium rounded-xl hover:bg-primary/10 dark:hover:bg-white/20 transition flex items-center justify-center gap-2">
                <span className="material-icons-round text-base">share</span>
                Share
              </button>
            </div>

            {/* Safety Tips */}
            <div className="bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 transition-colors">
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-2 text-sm">
                Safety Tips
              </h4>
              <ul className="text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                <li>• Meet in a safe public location</li>
                <li>• Verify condition before payment</li>
                <li>• Keep transaction records</li>
                <li>• Report suspicious activity</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
