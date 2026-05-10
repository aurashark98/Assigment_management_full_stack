/**
 * Profile Completion Utility
 * Check if user profile is complete and needs to be filled out
 */

export interface UserProfile {
  id: number;
  email: string;
  username?: string | null;
  full_name?: string | null;
  phone?: string | null;
  profilePhoto?: string | null;
  gender?: string | null;
  birth_date?: string | null;
}

/**
 * Check if user profile is complete
 * A profile is considered complete if it has:
 * - username
 * - email
 * - phone
 * - gender
 * - birth_date
 */
export function isProfileComplete(user: UserProfile | null): boolean {
  if (!user) return false;

  const hasUsername = user.username && user.username.trim().length > 0;
  const hasEmail = user.email && user.email.trim().length > 0;
  const hasPhone = user.phone && user.phone.trim().length > 0;
  const hasGender = user.gender && user.gender.trim().length > 0;
  const hasBirthDate = user.birth_date && user.birth_date.trim().length > 0;

  return hasUsername && hasEmail && hasPhone && hasGender && hasBirthDate;
}

/**
 * Get profile completion percentage
 */
export function getProfileCompletionPercentage(user: UserProfile | null): number {
  if (!user) return 0;

  let completed = 0;
  let total = 5;

  if (user.username && user.username.trim().length > 0) completed++;
  if (user.email && user.email.trim().length > 0) completed++;
  if (user.phone && user.phone.trim().length > 0) completed++;
  if (user.gender && user.gender.trim().length > 0) completed++;
  if (user.birth_date && user.birth_date.trim().length > 0) completed++;

  return Math.round((completed / total) * 100);
}

/**
 * Suggest next field to complete
 */
export function getNextProfileField(user: UserProfile | null): string {
  if (!user) return 'username';

  if (!user.username || user.username.trim().length === 0) return 'username';
  if (!user.email || user.email.trim().length === 0) return 'email';
  if (!user.phone || user.phone.trim().length === 0) return 'phone';
  if (!user.gender || user.gender.trim().length === 0) return 'gender';
  if (!user.birth_date || user.birth_date.trim().length === 0) return 'birth_date';

  return 'complete';
}
