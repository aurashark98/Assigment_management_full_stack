import { motion } from 'motion/react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

/**
 * Animated skeleton loader component
 * Shows animated gray placeholder while content loads
 */
export function Skeleton({
  className = '',
  variant = 'rectangular',
  width = '100%',
  height = 'auto',
}: SkeletonProps) {
  const baseClasses = `skeleton ${className}`;
  const widthStyle = typeof width === 'number' ? `${width}px` : width;
  const heightStyle = typeof height === 'number' ? `${height}px` : height;

  let variantClass = '';
  if (variant === 'circular') {
    variantClass = 'rounded-full';
  } else if (variant === 'rectangular') {
    variantClass = 'rounded-lg';
  } else {
    variantClass = 'rounded';
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClass} bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800`}
      animate={{ opacity: [0.7, 1, 0.7] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        width: widthStyle,
        height: heightStyle,
      }}
    />
  );
}

/**
 * Profile skeleton - shows loading state for profile form
 */
export function ProfileSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 shadow-2xl sm:p-8">
        {/* Header Skeleton */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl border border-slate-700 bg-slate-900/70 px-4 py-4 mb-6"
        >
          <div className="flex items-center gap-4">
            <Skeleton
              variant="circular"
              width={64}
              height={64}
              className="flex-shrink-0"
            />
            <div className="flex-1">
              <Skeleton height={24} className="mb-2 w-48" />
              <Skeleton height={16} className="w-32" />
            </div>
          </div>
        </motion.div>

        {/* Main Form Grid */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Photo Upload Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="md:col-span-1"
          >
            <div className="rounded-2xl border border-slate-700 bg-slate-800/70 p-5">
              <Skeleton
                variant="circular"
                width={112}
                height={112}
                className="mx-auto mb-4"
              />
              <Skeleton height={40} className="rounded-xl mb-3 w-full" />
              <Skeleton height={12} className="w-full" />
            </div>
          </motion.div>

          {/* Form Fields Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 grid gap-4"
          >
            {/* Username */}
            <div>
              <Skeleton height={12} className="mb-2 w-20" />
              <Skeleton height={40} className="rounded-xl w-full" />
            </div>

            {/* Email */}
            <div>
              <Skeleton height={12} className="mb-2 w-16" />
              <Skeleton height={40} className="rounded-xl w-full" />
            </div>

            {/* Gender & Birth Date */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Skeleton height={12} className="mb-2 w-20" />
                <Skeleton height={40} className="rounded-xl w-full" />
              </div>
              <div>
                <Skeleton height={12} className="mb-2 w-24" />
                <Skeleton height={40} className="rounded-xl w-full" />
              </div>
            </div>

            {/* Submit Button */}
            <Skeleton height={44} className="rounded-xl w-full mt-2" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Full page loading overlay
 * Shows when transitioning between pages
 */
export function FullscreenLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm"
    >
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-transparent"
        animate={{ opacity: [0.3, 0.8, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Dual Ring Spinner */}
        <div className="relative w-16 h-16">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-3 border-transparent border-t-blue-500 border-r-purple-500"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-3 rounded-full border-2 border-transparent border-b-blue-400 border-l-purple-400"
          />
        </div>

        {/* Loading Text */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <h3 className="text-xl font-semibold text-white mb-2">
            Loading...
          </h3>
          <p className="text-slate-400 text-sm">
            Please wait while we prepare your content
          </p>
        </motion.div>

        {/* Animated progress bar */}
        <motion.div className="w-24 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full overflow-hidden">
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: '100%' }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="h-full w-1/3 bg-white/30"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

interface SkeletonCardProps {
  count?: number;
}

/**
 * Card skeleton - useful for grid layouts
 */
export function CardSkeleton({ count = 3 }: SkeletonCardProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-4"
        >
          <Skeleton height={24} className="w-1/3" />
          <Skeleton height={16} className="w-full" />
          <Skeleton height={16} className="w-5/6" />
          <Skeleton height={40} className="w-1/2 mt-4" />
        </motion.div>
      ))}
    </>
  );
}
