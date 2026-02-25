// src/pages/SettingsPage.jsx — Step 9: Profile, Security, Preferences, Danger Zone

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  updateProfile,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser as firebaseDeleteUser,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../config/api';
import useDarkMode from '../hooks/useDarkMode';
import DayNightToggle from '../components/DayNightToggle';

/* ── Password strength calculator ── */
const getPasswordStrength = (pw) => {
  if (!pw) return { label: '', color: '', width: '0%' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: 'Weak', color: 'bg-red-500', width: '25%' };
  if (score <= 3) return { label: 'Medium', color: 'bg-yellow-500', width: '60%' };
  return { label: 'Strong', color: 'bg-emerald-500', width: '100%' };
};

/* ── Animation variants (matching Dashboard) ── */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isDark, toggleDarkMode } = useDarkMode();
  const avatarInputRef = useRef(null);

  /* ── Profile state ── */
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileError, setProfileError] = useState('');

  /* ── Security state ── */
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  /* ── Preferences state ── */
  const [notificationsOn, setNotificationsOn] = useState(() => {
    return localStorage.getItem('notifications') !== 'off';
  });

  /* ── Danger Zone state ── */
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteCountdown, setDeleteCountdown] = useState(5);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  /* ── CSV export state ── */
  const [exporting, setExporting] = useState(false);

  /* ── Hydrate profile from Firestore ── */
  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName || '');
    setAvatarUrl(user.photoURL || null);

    const fetchProfile = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.displayName) setDisplayName(d.displayName);
          if (d.avatarUrl) setAvatarUrl(d.avatarUrl);
        }
      } catch { /* use Firebase Auth defaults */ }
    };
    fetchProfile();
  }, [user]);

  /* ── Delete countdown timer ── */
  useEffect(() => {
    if (!showDeleteModal) {
      setDeleteCountdown(5);
      setDeleteConfirmText('');
      setDeleteError('');
      return;
    }
    if (deleteCountdown <= 0) return;
    const t = setTimeout(() => setDeleteCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [showDeleteModal, deleteCountdown]);

  const profileChanged = displayName !== (user?.displayName || '') || !!avatarFile;
  const passwordStrength = getPasswordStrength(newPw);
  const isGoogleUser = user?.providerData?.[0]?.providerId === 'google.com';

  /* ══════════════════════════════════════════
     HANDLERS
  ══════════════════════════════════════════ */

  /* ── Avatar pick ── */
  const handleAvatarPick = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setProfileError('Only JPEG and PNG images are accepted.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Image must be under 2 MB.');
      return;
    }
    setProfileError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  /* ── Profile save ── */
  const handleProfileSave = async () => {
    if (!user || profileSaving) return;
    setProfileSaving(true);
    setProfileError('');
    setProfileSaved(false);
    try {
      let newAvatarUrl = avatarUrl;

      // Upload avatar if changed
      if (avatarFile) {
        const path = `avatars/${user.uid}/${Date.now()}_${avatarFile.name}`;
        const storageRef = ref(storage, path);
        await uploadBytes(storageRef, avatarFile);
        newAvatarUrl = await getDownloadURL(storageRef);
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || undefined,
        photoURL: newAvatarUrl || undefined,
      });

      // Update Firestore
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        avatarUrl: newAvatarUrl,
        lastActive: serverTimestamp(),
      });

      // Try backend API too (best-effort)
      try {
        const jwt = localStorage.getItem('jwt');
        if (jwt) {
          const body = { displayName: displayName.trim() };
          if (avatarFile) {
            const reader = new FileReader();
            const b64 = await new Promise((res) => { reader.onload = () => res(reader.result); reader.readAsDataURL(avatarFile); });
            body.avatarBase64 = b64;
          }
          await fetch(endpoints.userProfile, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
            body: JSON.stringify(body),
          });
        }
      } catch { /* backend optional */ }

      setAvatarUrl(newAvatarUrl);
      setAvatarFile(null);
      setAvatarPreview(null);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (e) {
      setProfileError(e.message || 'Failed to save profile.');
    } finally {
      setProfileSaving(false);
    }
  };

  /* ── Password change ── */
  const handlePasswordChange = async () => {
    if (pwSaving) return;
    setPwError('');
    setPwSuccess('');

    if (newPw.length < 6) { setPwError('Password must be at least 6 characters.'); return; }
    if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return; }

    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPw);
      setPwSuccess('Password updated successfully.');
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      setTimeout(() => setPwSuccess(''), 3000);
    } catch (e) {
      if (e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential') {
        setPwError('Current password is incorrect.');
      } else {
        setPwError(e.message || 'Failed to update password.');
      }
    } finally {
      setPwSaving(false);
    }
  };

  /* ── Notifications toggle ── */
  const handleNotificationsToggle = () => {
    setNotificationsOn((prev) => {
      const next = !prev;
      localStorage.setItem('notifications', next ? 'on' : 'off');
      return next;
    });
  };

  /* ── CSV export ── */
  const handleExportCSV = async () => {
    if (!user || exporting) return;
    setExporting(true);
    try {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('timestamp', 'desc')
      );
      const snap = await getDocs(q);
      const rows = [['Date', 'Waste Type', 'Confidence', 'Disposal Method', 'Bin Match', 'Points Earned']];
      snap.docs.forEach((d) => {
        const s = d.data();
        const date = s.timestamp?.toDate ? s.timestamp.toDate().toISOString() : '';
        rows.push([
          date,
          s.wasteType || '',
          s.confidence != null ? `${(s.confidence * 100).toFixed(1)}%` : '',
          s.disposalMethod || '',
          s.binMatch != null ? (s.binMatch ? 'Yes' : 'No') : '',
          s.pointsEarned ?? '',
        ]);
      });
      const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kita-scan-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('CSV export failed:', e);
    } finally {
      setExporting(false);
    }
  };

  /* ── Delete account ── */
  const handleDeleteAccount = async () => {
    if (deleting || deleteConfirmText !== 'DELETE' || deleteCountdown > 0) return;
    setDeleting(true);
    setDeleteError('');
    try {
      // Try backend deletion first
      const jwt = localStorage.getItem('jwt');
      if (jwt) {
        try {
          await fetch(endpoints.deleteUser, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${jwt}` },
          });
        } catch { /* fallback below */ }
      }

      // Anonymise scans in Firestore (best-effort)
      try {
        const scansQ = query(collection(db, 'scans'), where('userId', '==', user.uid));
        const scansSnap = await getDocs(scansQ);
        if (!scansSnap.empty) {
          const batch = writeBatch(db);
          scansSnap.docs.forEach((d) => batch.update(d.ref, { userId: null }));
          await batch.commit();
        }
      } catch { /* continue with deletion */ }

      // Delete Firebase Auth account
      await firebaseDeleteUser(auth.currentUser);

      // Navigate away
      navigate('/');
    } catch (e) {
      if (e.code === 'auth/requires-recent-login') {
        setDeleteError('Please log out and log back in, then try again.');
      } else {
        setDeleteError(e.message || 'Failed to delete account.');
      }
    } finally {
      setDeleting(false);
    }
  };

  /* ── Logout ── */
  const handleLogout = async () => {
    navigate('/');
    try { await logout(); } catch { /* already navigated */ }
  };

  /* ══════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════ */
  return (
    <motion.div
      className="max-w-2xl mx-auto px-4 sm:px-6 py-8 transition-colors duration-500"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Header ── */}
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-400/10 to-purple-600/10 dark:from-purple-400/20 dark:to-purple-600/20 flex items-center justify-center text-purple-500 dark:text-purple-400 border border-purple-400/20 shadow-inner">
          <span className="material-icons-round text-3xl">settings</span>
        </div>
        <div>
          <h1 className="text-4xl font-extrabold text-emerald-950 dark:text-white tracking-tight transition-colors duration-500">
            Settings
          </h1>
          <p className="text-emerald-800/60 dark:text-emerald-100/60 font-medium transition-colors duration-500">
            Manage your profile and preferences
          </p>
        </div>
      </motion.div>

      {/* ══════════════════════════════════
           1. PROFILE CARD
      ══════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 shadow-xl mb-6 transition-colors duration-500"
      >
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-5 flex items-center gap-2 transition-colors duration-500">
          <span className="material-icons-round text-xl text-primary">person</span>
          Profile
        </h2>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="relative group shrink-0">
            <div
              className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-emerald-600/20 dark:from-primary/30 dark:to-emerald-600/30 flex items-center justify-center overflow-hidden border-2 border-primary/30 shadow-lg cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              {(avatarPreview || avatarUrl) ? (
                <img src={avatarPreview || avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="material-icons-round text-4xl text-primary/60">account_circle</span>
              )}
            </div>
            <div
              className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={() => avatarInputRef.current?.click()}
            >
              <span className="material-icons-round text-white text-xl">photo_camera</span>
            </div>
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarPick} />
          </div>

          <div className="flex-1 w-full space-y-4">
            {/* Display Name */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-emerald-800/50 dark:text-emerald-100/50 mb-1.5 block transition-colors duration-500">
                Display Name
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/50 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 text-emerald-950 dark:text-white placeholder-emerald-800/30 dark:placeholder-emerald-100/30 font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                placeholder="Your name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-emerald-800/50 dark:text-emerald-100/50 mb-1.5 flex items-center gap-1 transition-colors duration-500">
                Email
                <span className="material-icons-round text-[14px] text-emerald-800/30 dark:text-emerald-100/30" title="Email cannot be changed">lock</span>
              </label>
              <input
                type="text"
                value={user?.email || ''}
                readOnly
                className="w-full h-12 px-4 rounded-xl bg-emerald-50/50 dark:bg-white/[0.02] border border-emerald-900/5 dark:border-white/5 text-emerald-800/60 dark:text-emerald-100/40 font-medium cursor-not-allowed transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {profileError && (
          <p className="text-sm text-red-500 mt-3 flex items-center gap-1">
            <span className="material-icons-round text-base">error</span>
            {profileError}
          </p>
        )}

        <div className="flex justify-end mt-5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            disabled={!profileChanged || profileSaving}
            onClick={handleProfileSave}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
              profileChanged && !profileSaving
                ? 'bg-gradient-to-r from-emerald-500 to-primary text-white shadow-lg shadow-primary/20 hover:shadow-xl'
                : 'bg-emerald-100/50 dark:bg-white/5 text-emerald-800/30 dark:text-emerald-100/20 cursor-not-allowed'
            }`}
          >
            {profileSaving ? (
              <span className="flex items-center gap-2">
                <span className="material-icons-round text-base animate-spin">progress_activity</span>
                Saving…
              </span>
            ) : profileSaved ? (
              <span className="flex items-center gap-2">
                <span className="material-icons-round text-base">check_circle</span>
                Saved ✓
              </span>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* ══════════════════════════════════
           2. SECURITY CARD
      ══════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 shadow-xl mb-6 transition-colors duration-500"
      >
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-5 flex items-center gap-2 transition-colors duration-500">
          <span className="material-icons-round text-xl text-blue-500">shield</span>
          Security
        </h2>

        {isGoogleUser ? (
          <div className="flex items-center gap-3 text-emerald-800/60 dark:text-emerald-100/50 bg-blue-50/50 dark:bg-blue-500/5 rounded-xl p-4 border border-blue-200/30 dark:border-blue-500/10">
            <span className="material-icons-round text-blue-500 text-xl">info</span>
            <p className="text-sm font-medium">Password is managed by Google. You signed in with Google OAuth.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-emerald-800/50 dark:text-emerald-100/50 mb-1.5 block transition-colors duration-500">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? 'text' : 'password'}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/50 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 text-emerald-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrentPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-100/40 hover:text-emerald-800/70 dark:hover:text-emerald-100/70 transition-colors">
                  <span className="material-icons-round text-xl">{showCurrentPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-emerald-800/50 dark:text-emerald-100/50 mb-1.5 block transition-colors duration-500">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? 'text' : 'password'}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/50 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 text-emerald-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                  placeholder="Enter new password"
                />
                <button type="button" onClick={() => setShowNewPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-100/40 hover:text-emerald-800/70 dark:hover:text-emerald-100/70 transition-colors">
                  <span className="material-icons-round text-xl">{showNewPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {/* Strength meter */}
              {newPw && (
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex-1 h-1.5 bg-emerald-100/50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className={`h-full ${passwordStrength.color} rounded-full transition-all duration-500`} style={{ width: passwordStrength.width }} />
                  </div>
                  <span className={`text-xs font-bold ${passwordStrength.color === 'bg-red-500' ? 'text-red-500' : passwordStrength.color === 'bg-yellow-500' ? 'text-yellow-500' : 'text-emerald-500'}`}>
                    {passwordStrength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-emerald-800/50 dark:text-emerald-100/50 mb-1.5 block transition-colors duration-500">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPw ? 'text' : 'password'}
                  value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full h-12 px-4 pr-12 rounded-xl bg-white/50 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 text-emerald-950 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all duration-300"
                  placeholder="Confirm new password"
                />
                <button type="button" onClick={() => setShowConfirmPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-800/40 dark:text-emerald-100/40 hover:text-emerald-800/70 dark:hover:text-emerald-100/70 transition-colors">
                  <span className="material-icons-round text-xl">{showConfirmPw ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
              {confirmPw && newPw !== confirmPw && (
                <p className="text-xs text-red-400 mt-1.5 font-medium">Passwords do not match</p>
              )}
            </div>

            {pwError && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <span className="material-icons-round text-base">error</span>
                {pwError}
              </p>
            )}
            {pwSuccess && (
              <p className="text-sm text-emerald-500 flex items-center gap-1">
                <span className="material-icons-round text-base">check_circle</span>
                {pwSuccess}
              </p>
            )}

            <div className="flex justify-end pt-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                disabled={!currentPw || !newPw || !confirmPw || pwSaving}
                onClick={handlePasswordChange}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  currentPw && newPw && confirmPw && !pwSaving
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-xl'
                    : 'bg-emerald-100/50 dark:bg-white/5 text-emerald-800/30 dark:text-emerald-100/20 cursor-not-allowed'
                }`}
              >
                {pwSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="material-icons-round text-base animate-spin">progress_activity</span>
                    Updating…
                  </span>
                ) : (
                  'Update Password'
                )}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════
           3. PREFERENCES CARD
      ══════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-emerald-900/10 dark:border-white/10 rounded-2xl p-6 shadow-xl mb-6 transition-colors duration-500"
      >
        <h2 className="text-lg font-bold text-emerald-950 dark:text-white mb-5 flex items-center gap-2 transition-colors duration-500">
          <span className="material-icons-round text-xl text-amber-500">tune</span>
          Preferences
        </h2>

        <div className="space-y-5">
          {/* 3a. Notifications toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-white transition-colors duration-500">Push Notifications</p>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 font-medium transition-colors duration-500">Scan reminders and streak alerts</p>
            </div>
            <button
              type="button"
              onClick={handleNotificationsToggle}
              className={`relative w-[36px] h-[20px] rounded-full transition-colors duration-300 ${notificationsOn ? 'bg-emerald-500' : 'bg-emerald-900/20 dark:bg-white/15'}`}
            >
              <div
                className={`absolute top-[2px] w-[16px] h-[16px] bg-white rounded-full shadow transition-all duration-300 ${notificationsOn ? 'left-[18px]' : 'left-[2px]'}`}
              />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-emerald-900/5 dark:border-white/5" />

          {/* 3b. Day / Night Theme Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-white transition-colors duration-500">Theme</p>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 font-medium transition-colors duration-500">
                {isDark ? 'Night mode active' : 'Day mode active'}
              </p>
            </div>
            <DayNightToggle isDark={isDark} onToggle={toggleDarkMode} />
          </div>

          {/* Divider */}
          <div className="border-t border-emerald-900/5 dark:border-white/5" />

          {/* Data export */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-white transition-colors duration-500">Export Scan History</p>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 font-medium transition-colors duration-500">Download all scans as CSV</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              disabled={exporting}
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/50 dark:bg-white/5 border border-emerald-900/10 dark:border-white/10 text-emerald-900 dark:text-emerald-100 hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 flex items-center gap-1.5 shadow"
            >
              {exporting ? (
                <span className="material-icons-round text-sm animate-spin">progress_activity</span>
              ) : (
                <span className="material-icons-round text-sm">download</span>
              )}
              {exporting ? 'Exporting…' : 'Download CSV'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════
           4. DANGER ZONE CARD
      ══════════════════════════════════ */}
      <motion.div
        variants={itemVariants}
        className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-red-400/20 dark:border-red-500/20 rounded-2xl p-6 shadow-xl mb-6 transition-colors duration-500"
      >
        <h2 className="text-lg font-bold text-red-600 dark:text-red-400 mb-5 flex items-center gap-2">
          <span className="material-icons-round text-xl">warning</span>
          Danger Zone
        </h2>

        <div className="space-y-4">
          {/* Logout */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-emerald-950 dark:text-white transition-colors duration-500">Sign Out</p>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 font-medium transition-colors duration-500">Log out of your account</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-white/50 dark:bg-white/5 text-emerald-900/90 dark:text-emerald-100/90 border border-emerald-900/10 dark:border-white/10 hover:bg-emerald-50 dark:hover:bg-white/10 transition-all duration-300 shadow"
            >
              Logout
            </motion.button>
          </div>

          {/* Divider */}
          <div className="border-t border-red-200/30 dark:border-red-500/10" />

          {/* Delete account */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400">Delete Account</p>
              <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 font-medium transition-colors duration-500">
                Permanently remove your account and data
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDeleteModal(true)}
              className="px-5 py-2 rounded-xl text-sm font-bold bg-white/50 dark:bg-white/5 text-red-600 dark:text-red-400 border-[1.5px] border-red-400 dark:border-red-500/60 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-300 shadow"
            >
              Delete Account
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* ══════════════════════════════════
           DELETE CONFIRMATION MODAL
      ══════════════════════════════════ */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-emerald-950 border border-red-300/40 dark:border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
                  <span className="material-icons-round text-2xl text-red-500">delete_forever</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400">Delete Account</h3>
                  <p className="text-xs text-emerald-800/50 dark:text-emerald-100/40 font-medium">This action cannot be undone</p>
                </div>
              </div>

              <p className="text-sm text-emerald-900/70 dark:text-emerald-100/60 mb-4 leading-relaxed">
                All your scan history will be anonymised and your account will be permanently removed. Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm.
              </p>

              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full h-12 px-4 rounded-xl bg-white/50 dark:bg-white/5 border border-red-300/40 dark:border-red-500/20 text-emerald-950 dark:text-white font-mono font-bold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all duration-300"
                placeholder="Type DELETE"
              />

              {deleteError && (
                <p className="text-sm text-red-500 mt-3 flex items-center gap-1">
                  <span className="material-icons-round text-base">error</span>
                  {deleteError}
                </p>
              )}

              <div className="flex gap-3 mt-5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-emerald-100/50 dark:bg-white/5 text-emerald-900 dark:text-emerald-100 border border-emerald-900/10 dark:border-white/10 hover:bg-emerald-100 dark:hover:bg-white/10 transition-all duration-300"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={deleteConfirmText === 'DELETE' && deleteCountdown <= 0 ? { scale: 1.02 } : {}}
                  whileTap={deleteConfirmText === 'DELETE' && deleteCountdown <= 0 ? { scale: 0.97 } : {}}
                  disabled={deleteConfirmText !== 'DELETE' || deleteCountdown > 0 || deleting}
                  onClick={handleDeleteAccount}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    deleteConfirmText === 'DELETE' && deleteCountdown <= 0 && !deleting
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600'
                      : 'bg-red-100/50 dark:bg-red-500/5 text-red-300 dark:text-red-500/30 cursor-not-allowed'
                  }`}
                >
                  {deleting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="material-icons-round text-base animate-spin">progress_activity</span>
                      Deleting…
                    </span>
                  ) : deleteCountdown > 0 ? (
                    `Wait ${deleteCountdown}s`
                  ) : (
                    'Confirm Delete'
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
