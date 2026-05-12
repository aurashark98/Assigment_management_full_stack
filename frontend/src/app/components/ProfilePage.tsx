import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Save, UserRound, ChevronRight, CheckCircle, LogOut, Home } from 'lucide-react';
import { ProfileSkeleton } from './SkeletonLoader';
import { isProfileComplete, getProfileCompletionPercentage } from '../../utils/profileChecker';
import { clearAuthSessionStorage, touchAuthSession, validateAndRefreshAuthSession } from '../../utils/authSession';

interface StoredAuthUser {
  id: string | number;
  email: string;
  username?: string | null;
  profilePhoto?: string | null;
  full_name?: string | null;
}

interface ProfileData {
  id: string | number;
  username: string;
  full_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string;
  profile_photo: string;
}

const AUTH_BASE_URL = 'http://127.0.0.1:3032/api/facility-helpdesk/auth';
const APP_USER_BASE_URL = 'http://127.0.0.1:3032/api/facility-helpdesk/app-user';

const emptyProfile: ProfileData = {
  id: '',
  username: '',
  full_name: '',
  email: '',
  phone: '',
  gender: '',
  birth_date: '',
  profile_photo: '',
};

export function ProfilePage() {
  const [authUser, setAuthUser] = useState<StoredAuthUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>(emptyProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [completionPercentage, setCompletionPercentage] = useState(0);

  useEffect(() => {
    const isSessionValid = validateAndRefreshAuthSession();
    if (!isSessionValid) {
      setAuthUser(null);
      return;
    }

    const savedUser = localStorage.getItem('auth_user');
    if (!savedUser) return;

    try {
      const parsed = JSON.parse(savedUser) as StoredAuthUser;
      if (parsed?.id) {
        setAuthUser(parsed);
        setProfile((prev) => ({
          ...prev,
          id: parsed.id,
          email: parsed.email,
          phone: '',
          username: parsed.username || prev.username,
          full_name: parsed.full_name || prev.full_name,
          profile_photo: parsed.profilePhoto || prev.profile_photo,
        }));
      }
    } catch {
      localStorage.removeItem('auth_user');
    }
  }, []);

  useEffect(() => {
    if (!authUser?.id) return;

    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      try {
        const response = await fetch(`${AUTH_BASE_URL}/profile/${authUser.id}`);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const data: any = await response.json();

        if (!response.ok || !data.data?.user) {
          clearAuthSessionStorage();
          setAuthUser(null);
          setErrorMessage(data.message || 'Failed to load profile data.');
          return;
        }

        const profileData = {
          id: data.data.user.id || data.data.user.user_id,
          username: data.data.user.username || data.data.user.employee_code || '',
          full_name: data.data.user.full_name || '',
          email: data.data.user.email || '',
          phone: data.data.user.phone || '',
          gender: data.data.user.gender || '',
          birth_date: data.data.user.birth_date || '',
          profile_photo: data.data.user.profile_photo || '',
        };

        setProfile(profileData);

        // Update completion percentage based on fetched data
        const percentage = getProfileCompletionPercentage({
          id: Number(data.data.user.id || data.data.user.user_id),
          username: data.data.user.username || data.data.user.employee_code || '',
          full_name: data.data.user.full_name || '',
          email: data.data.user.email || '',
          phone: data.data.user.phone || '',
          gender: data.data.user.gender || '',
          birth_date: data.data.user.birth_date || '',
          profilePhoto: data.data.user.profile_photo || '',
        });
        setCompletionPercentage(percentage);
      } catch {
        setErrorMessage('Server is unavailable.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [authUser]);

  // Update completion percentage when profile changes
  useEffect(() => {
    if (profile.id) {
      const percentage = getProfileCompletionPercentage({
        ...profile,
        id: Number(profile.id),
        profilePhoto: profile.profile_photo,
      });
      setCompletionPercentage(percentage);
    }
  }, [profile]);

  const profilePhotoPreview = useMemo(() => {
    if (profile.profile_photo?.trim()) {
      return profile.profile_photo;
    }
    // fallback to auth user's stored profilePhoto (navbar uses this)
    if (authUser?.profilePhoto) return authUser.profilePhoto as string;
    return '';
  }, [profile.profile_photo, authUser?.profilePhoto]);

  const handleChange = (field: keyof ProfileData, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleUploadPhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      handleChange('profile_photo', result);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement> | null, submitForReview = false) => {
    if (event) event.preventDefault();
    if (!authUser?.id) {
      setErrorMessage('Silakan login terlebih dahulu.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const response = await fetch(`${APP_USER_BASE_URL}/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: authUser.id,
          full_name: profile.full_name,
          email: profile.email,
          phone: profile.phone,
          gender: profile.gender,
          birth_date: profile.birth_date,
          profile_photo: profile.profile_photo,
          submitted: submitForReview || undefined,
        }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data: any = await response.json();

      if (!response.ok || !data.data) {
        setErrorMessage(data.message || 'Failed to save profile.');
        return;
      }

      // the update response from app-user/update returns `data: responseData` which contains fields like user_id, email, etc.
      const updatedData = data.data || {};

      const updatedUser: StoredAuthUser = {
        id: updatedData.user_id || authUser.id,
        email: updatedData.email || profile.email,
        username: updatedData.employee_code || updatedData.username || profile.username || null,
        profilePhoto: updatedData.profile_photo || profile.profile_photo || null,
        full_name: updatedData.full_name || profile.full_name || null,
      };

      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      localStorage.setItem('auth_user_email', updatedUser.email);
      touchAuthSession();
      window.dispatchEvent(new Event('auth-user-updated'));

      setAuthUser(updatedUser);
      setProfile((prev) => ({
        ...prev,
        username: updatedData.employee_code || updatedData.username || prev.username,
        full_name: updatedData.full_name || prev.full_name,
        email: updatedData.email || prev.email || '',
        phone: updatedData.phone || prev.phone || '',
        gender: updatedData.gender || prev.gender || '',
        birth_date: updatedData.birth_date || prev.birth_date || '',
        profile_photo: updatedData.profile_photo || prev.profile_photo || '',
      }));
      setSuccessMessage(data.message || 'Profile updated successfully.');
    } catch {
      setErrorMessage('Server is unavailable.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleGoHome = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  const handleLogout = () => {
    clearAuthSessionStorage();
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <section id="profile" className="px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white via-blue-50/30 to-white px-6 py-8 shadow-[0_8px_24px_rgba(37,99,235,0.12)] sm:px-8"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Account</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Profile Settings</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
                Manage your account details and personalize your experience.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:items-end">
              <motion.button
                type="button"
                onClick={handleGoHome}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-300 transition-all duration-300 shadow-[0_4px_12px_rgba(15,23,42,0.08)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.15)]"
              >
                <Home className="h-4 w-4" />
                Back
              </motion.button>

              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-emerald-50/80 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle className="h-3.5 w-3.5" />
                {completionPercentage}% Complete
              </div>
            </div>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {!authUser?.id ? (
            <motion.div
              key="unauthenticated"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.3 }}
              className="app-card p-6 sm:p-8"
            >
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                Please sign in using the Sign In button in the navbar to edit your profile.
              </div>
            </motion.div>
          ) : isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProfileSkeleton />
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
                <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
                  <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)]">
                    <div className="flex items-center gap-4">
                      <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-blue-100 to-cyan-100 shadow-[0_4px_12px_rgba(37,99,235,0.1)]">
                        {profilePhotoPreview ? (
                          <img
                            src={profilePhotoPreview}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserRound className="h-8 w-8 text-slate-500" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-base font-bold text-slate-900">{profile.full_name || profile.username || 'User'}</p>
                        <p className="truncate text-xs text-slate-500 mt-1">{profile.email || 'Complete your account details'}</p>
                      </div>
                    </div>

                    <div className="mt-5 rounded-2xl border border-blue-200/40 bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-slate-700">Profile Completion</span>
                        <span className="font-bold text-blue-600">{completionPercentage}%</span>
                      </div>
                      <div className="mt-3 h-2.5 rounded-full bg-slate-200/60 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${completionPercentage}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_12px_rgba(37,99,235,0.4)]"
                        />
                      </div>
                      <p className="mt-3 text-xs leading-relaxed text-slate-600">
                        The more complete your profile is, the better the experience will be.
                      </p>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl border border-emerald-200/40 bg-gradient-to-br from-emerald-50 to-emerald-50/50 p-3">
                        <p className="text-xs font-medium text-slate-600">Status</p>
                        <p className="mt-1.5 font-bold text-emerald-700">{isProfileComplete({ ...profile, id: Number(profile.id), profilePhoto: profile.profile_photo }) ? 'Complete' : 'Incomplete'}</p>
                      </div>
                      <div className="rounded-xl border border-amber-200/40 bg-gradient-to-br from-amber-50 to-amber-50/50 p-3">
                        <p className="text-xs font-medium text-slate-600">Photo</p>
                        <p className="mt-1.5 font-bold text-amber-700">{profilePhotoPreview ? 'Set' : 'Not set'}</p>
                      </div>
                    </div>
                  </div>
                </aside>

                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-white to-slate-50/50 p-6 shadow-[0_4px_12px_rgba(15,23,42,0.08)] sm:p-7">
                    <div className="flex flex-col gap-3 border-b border-slate-200/40 pb-5 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h2 className="text-xl font-bold text-slate-900">Personal Details</h2>
                        <p className="mt-1 text-sm text-slate-600">Complete your account information to build a fuller profile.</p>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 rounded-full border border-blue-200/60 bg-blue-50/80 px-3 py-1.5 text-xs font-semibold text-blue-700">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Auto-saved
                      </div>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <label className="block md:col-span-1">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Username</span>
                        <input
                          type="text"
                          value={profile.username}
                          readOnly
                          placeholder="Otomatis dari employee code"
                          className="w-full rounded-lg border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none transition"
                        />
                      </label>

                      <label className="block md:col-span-1">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Email</span>
                        <input
                          type="email"
                          value={profile.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="email@contoh.com"
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        />
                      </label>

                      <label className="block md:col-span-1">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Full Name</span>
                        <input
                          type="text"
                          value={profile.full_name}
                          onChange={(e) => handleChange('full_name', e.target.value)}
                          placeholder="Enter your full name"
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        />
                      </label>

                      <label className="block md:col-span-1">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Nomor Telepon</span>
                        <input
                          type="tel"
                          value={profile.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          placeholder="08xxxxxxxxxx"
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        />
                      </label>

                      <label className="block md:col-span-1">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Gender</span>
                        <select
                          value={profile.gender}
                          onChange={(e) => handleChange('gender', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Laki-laki</option>
                          <option value="female">Perempuan</option>
                          <option value="other">Lainnya</option>
                        </select>
                      </label>

                      <label className="block md:col-span-1">
                        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-700">Tanggal Lahir</span>
                        <input
                          type="date"
                          value={profile.birth_date}
                          onChange={(e) => handleChange('birth_date', e.target.value)}
                          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                        />
                      </label>
                    </div>

                    <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                      <div className="rounded-2xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-6 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
                        <div className="mx-auto mb-5 flex h-40 w-40 items-center justify-center overflow-hidden rounded-2xl border-2 border-slate-200/60 bg-gradient-to-br from-blue-100 to-cyan-100 shadow-[0_4px_12px_rgba(37,99,235,0.1)]">
                          {profilePhotoPreview ? (
                            <img
                              src={profilePhotoPreview}
                              alt="Profile"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <UserRound className="h-12 w-12 text-slate-400" />
                          )}
                        </div>

                          <label className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-blue-300 bg-blue-50/50 px-4 py-3 text-sm font-semibold text-blue-700 hover:bg-blue-50 hover:border-blue-400 transition-all duration-200 cursor-pointer">
                          <Camera className="h-4 w-4" />
                          Upload Photo
                          <input type="file" accept="image/*" className="hidden" onChange={handleUploadPhoto} />
                        </label>

                        <p className="mt-3 text-xs leading-relaxed text-slate-600">Format: JPG, PNG, or GIF. Max 5MB.</p>
                      </div>

                      <div className="space-y-4">
                        {errorMessage && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-red-200/60 bg-red-50/80 px-4 py-3 text-sm font-semibold text-red-700"
                          >
                            {errorMessage}
                          </motion.p>
                        )}
                        {successMessage && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                            className="rounded-xl border border-emerald-200/60 bg-emerald-50/80 px-4 py-3 text-sm font-semibold text-emerald-700"
                          >
                            {successMessage}
                          </motion.p>
                        )}

                        <div className="flex flex-col gap-3">
                          <motion.button
                            type="submit"
                            disabled={isSaving}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 px-4 py-3 text-sm font-bold text-white hover:shadow-[0_12px_28px_rgba(37,99,235,0.3)] transition-all duration-200 shadow-[0_8px_20px_rgba(37,99,235,0.2)] disabled:opacity-60"
                          >
                            {isSaving ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}
                            {isSaving ? 'Saving...' : 'Save Profile'}
                          </motion.button>

                          <motion.button
                            type="button"
                            onClick={handleLogout}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-red-300 bg-red-50/50 px-4 py-3 text-sm font-bold text-red-700 hover:bg-red-50 hover:border-red-400 transition-all duration-200 shadow-[0_2px_8px_rgba(220,38,38,0.08)] hover:shadow-[0_8px_16px_rgba(220,38,38,0.12)]"
                          >
                            <LogOut className="h-4 w-4" />
                            Logout
                          </motion.button>

                          {completionPercentage < 100 && (
                            <motion.button
                              type="button"
                              onClick={handleSkip}
                              whileHover={{ scale: 1.02, y: -2 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all duration-200 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:shadow-[0_4px_12px_rgba(15,23,42,0.08)]"
                            >
                              <ChevronRight className="h-4 w-4" />
                              Lewati
                            </motion.button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
