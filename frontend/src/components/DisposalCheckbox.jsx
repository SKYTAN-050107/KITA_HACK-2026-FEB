// src/components/DisposalCheckbox.jsx — Phase 5: Disposal status toggle
// Calls PATCH /api/v1/scans/:scanId/status to update disposal status
// Colour-coded by status, shows confirmation toast

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '../config/api';
import { useAuth } from '../contexts/AuthContext';

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    icon: 'schedule',
    color: '#f59e0b',        // amber
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/15',
    borderColor: 'border-amber-500/20',
    textColor: 'text-amber-500',
  },
  recycled: {
    label: 'Recycled',
    icon: 'recycling',
    color: '#16a34a',        // green
    bgColor: 'bg-green-500/10 dark:bg-green-500/15',
    borderColor: 'border-green-500/20',
    textColor: 'text-green-500',
  },
  donated: {
    label: 'Donated',
    icon: 'volunteer_activism',
    color: '#ec4899',        // pink
    bgColor: 'bg-pink-500/10 dark:bg-pink-500/15',
    borderColor: 'border-pink-500/20',
    textColor: 'text-pink-500',
  },
  disposed: {
    label: 'Disposed',
    icon: 'delete_outline',
    color: '#6b7280',        // grey
    bgColor: 'bg-gray-500/10 dark:bg-gray-500/15',
    borderColor: 'border-gray-500/20',
    textColor: 'text-gray-500',
  },
};

/**
 * Maps disposal method → target completed status
 */
function getTargetStatus(disposalMethod) {
  if (disposalMethod === 'recycle') return 'recycled';
  if (disposalMethod === 'donate') return 'donated';
  return 'disposed';
}

export default function DisposalCheckbox({ scanId, currentStatus, disposalMethod, onStatusChange }) {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState(null);

  const isPending = currentStatus === 'pending';
  const targetStatus = getTargetStatus(disposalMethod);
  const displayConfig = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.pending;

  const handleToggle = async () => {
    if (!user || updating || !scanId) return;
    setUpdating(true);

    const newStatus = isPending ? targetStatus : 'pending';

    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`${endpoints.scans}/${scanId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ disposalStatus: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();

      if (data.success) {
        onStatusChange?.(scanId, newStatus);
        const statusLabel = STATUS_CONFIG[newStatus]?.label || newStatus;
        setToast(`Marked as ${statusLabel}`);
        setTimeout(() => setToast(null), 2000);
      }
    } catch (err) {
      console.error('Disposal status update failed:', err);
      setToast('Update failed');
      setTimeout(() => setToast(null), 2000);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleToggle}
        disabled={updating}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border cursor-pointer transition-all ${displayConfig.bgColor} ${displayConfig.borderColor} ${displayConfig.textColor} ${updating ? 'opacity-50' : 'hover:opacity-80'}`}
      >
        {updating ? (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="material-icons-round text-sm"
          >progress_activity</motion.span>
        ) : (
          <span className="material-icons-round text-sm">{displayConfig.icon}</span>
        )}
        {displayConfig.label}
      </motion.button>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-950 dark:bg-white text-white dark:text-emerald-950 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg whitespace-nowrap shadow-lg z-50"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { STATUS_CONFIG, getTargetStatus };
