import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronLeft, Upload, X, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import useDarkMode from '../../hooks/useDarkMode';

const CreateListingForm = ({ listingId = null }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark: darkMode } = useDarkMode();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const [formData, setFormData] = useState({
    wasteType: '',
    quantity: '',
    unit: 'kg',
    condition: 'used',
    description: '',
    photos: [],
    pricePerUnit: '',
    currency: 'USD',
    location: {
      latitude: null,
      longitude: null,
      address: '',
      city: '',
    },
    tags: [],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Load listing if editing
  useEffect(() => {
    if (listingId) {
      fetchListing();
    } else if (searchParams.get('scanId')) {
      loadFromScan();
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setFormData((prev) => ({
              ...prev,
              location: {
                ...prev.location,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              },
            }));
          },
          () => {}
        );
      }
    }
  }, [listingId, searchParams]);

  const fetchListing = async () => {
    try {
      const response = await fetch(`${API_URL}/api/marketplace/listings/${listingId}`);
      const data = await response.json();
      if (data.success) {
        setFormData(data.listing);
      } else {
        setError('Failed to load listing');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const loadFromScan = () => {
    const scanData = sessionStorage.getItem('lastScan');
    if (scanData) {
      const scan = JSON.parse(scanData);
      setFormData((prev) => ({
        ...prev,
        wasteType: scan.wasteType || '',
        description: scan.description || '',
        photos: scan.photo ? [scan.photo] : [],
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handlePhotoSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setPhotoUploading(true);
    try {
      const uploadedPhotos = [];

      for (const file of files) {
        const reader = new FileReader();
        await new Promise((resolve) => {
          reader.onload = (event) => {
            uploadedPhotos.push(event.target.result);
            resolve();
          };
          reader.readAsDataURL(file);
        });
      }

      setFormData((prev) => ({
        ...prev,
        photos: [...prev.photos, ...uploadedPhotos],
      }));
    } catch (err) {
      setError('Failed to upload photos: ' + err.message);
    } finally {
      setPhotoUploading(false);
    }
  };

  const removePhoto = (index) => {
    setFormData((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const toggleTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.wasteType ||
      !formData.quantity ||
      !formData.pricePerUnit ||
      !formData.location.address
    ) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const token = await user.getIdToken();
      const method = listingId ? 'PATCH' : 'POST';
      const endpoint = listingId
        ? `/api/v1/marketplace/listings/${listingId}`
        : '/api/v1/marketplace/listings';

      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/dashboard/marketplace/listings/${data.listingId || listingId}`);
      } else {
        setError(data.error || 'Failed to save listing');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Shared input classes ─────────────────────────────────────── */
  const inputCls =
    'w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-white/80 dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors';

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors">
      {/* Header */}
      <div className="bg-white/60 dark:bg-white/10 backdrop-blur-2xl border-b border-white/40 dark:border-white/10 sticky top-0 z-10 transition-colors">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <h1 className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            {listingId ? 'Edit Listing' : 'Create Listing'}
          </h1>
          <div className="w-5"></div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-900 dark:text-red-200">{error}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white/60 dark:bg-white/10 backdrop-blur-xl rounded-[2rem] border border-white/40 dark:border-white/10 p-6 transition-colors"
        >
          {/* Photos Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Photos</h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {formData.photos.map((photo, index) => (
                <div
                  key={index}
                  className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-white/5 group"
                >
                  <img src={photo} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {formData.photos.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoUploading}
                  className="aspect-square rounded-xl border-2 border-dashed border-gray-300 dark:border-white/20 flex flex-col items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 transition disabled:opacity-50"
                >
                  <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {photoUploading ? 'Uploading...' : 'Add Photo'}
                  </span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handlePhotoSelect}
              className="hidden"
            />

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Upload up to 5 photos. First photo will be the thumbnail.
            </p>
          </div>

          {/* Waste Details */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Waste Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Waste Type *
                </label>
                <select
                  name="wasteType"
                  value={formData.wasteType}
                  onChange={handleInputChange}
                  required
                  className={inputCls}
                >
                  <option value="">Select waste type</option>
                  <option value="plastic_bottle">Plastic Bottles</option>
                  <option value="aluminum_can">Aluminum Cans</option>
                  <option value="paper">Paper & Cardboard</option>
                  <option value="metal">Metal</option>
                  <option value="glass">Glass</option>
                  <option value="organic">Organic Waste</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles & Clothing</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className={inputCls}
                >
                  <option value="new">New/Unused</option>
                  <option value="used">Used</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Quantity *
                </label>
                <input
                  type="number"
                  name="quantity"
                  step="0.01"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 50"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className={inputCls}
                >
                  <option value="kg">Kilograms (kg)</option>
                  <option value="liter">Liters (L)</option>
                  <option value="piece">Pieces</option>
                  <option value="ton">Metric Tons</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Tell buyers about this waste item (condition, storage, etc.)"
                rows={4}
                className={inputCls}
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price per {formData.unit || 'unit'} *
                </label>
                <input
                  type="number"
                  name="pricePerUnit"
                  step="0.01"
                  value={formData.pricePerUnit}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 0.50"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleInputChange}
                  className={inputCls}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="GHS">GHS (₵)</option>
                  <option value="NGN">NGN (₦)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Total Price
                </label>
                <input
                  type="text"
                  disabled
                  value={
                    formData.pricePerUnit && formData.quantity
                      ? `${formData.currency} ${(formData.pricePerUnit * formData.quantity).toFixed(2)}`
                      : 'Calculate'
                  }
                  className="w-full px-4 py-2 rounded-xl border border-gray-300 dark:border-white/20 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8 pb-8 border-b border-gray-200 dark:border-white/10">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Location</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  name="location.address"
                  value={formData.location.address}
                  onChange={handleInputChange}
                  required
                  placeholder="Street address"
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  City *
                </label>
                <input
                  type="text"
                  name="location.city"
                  value={formData.location.city}
                  onChange={handleInputChange}
                  required
                  placeholder="City"
                  className={inputCls}
                />
              </div>

              {formData.location.latitude && formData.location.longitude && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📍 Coordinates: {formData.location.latitude.toFixed(4)},{' '}
                  {formData.location.longitude.toFixed(4)}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Tags (Optional)
            </h3>
            <div className="flex flex-wrap gap-2">
              {['recyclable', 'bulk', 'same-day', 'negotiable', 'eco-friendly'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-4 py-2 rounded-xl font-medium transition ${
                    formData.tags.includes(tag)
                      ? 'bg-gradient-to-r from-primary to-emerald-400 text-white'
                      : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/20'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-white/20 text-gray-900 dark:text-white font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-emerald-400 text-white font-extrabold rounded-xl hover:from-emerald-500 hover:to-emerald-300 transition disabled:opacity-50 shadow-lg"
            >
              {submitting ? 'Saving...' : listingId ? 'Update Listing' : 'Create Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateListingForm;
