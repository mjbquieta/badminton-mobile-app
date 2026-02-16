/**
 * Limits for unverified (email not confirmed) users.
 * Verified users have no limits.
 *
 * Configure via environment variables:
 *   Web:    NEXT_PUBLIC_MAX_UNVERIFIED_PLAYERS / NEXT_PUBLIC_MAX_UNVERIFIED_COURTS
 *   Mobile: EXPO_PUBLIC_MAX_UNVERIFIED_PLAYERS / EXPO_PUBLIC_MAX_UNVERIFIED_COURTS
 *
 * Falls back to defaults (10 players, 3 courts) if not set.
 */
export const UNVERIFIED_LIMITS = {
  MAX_PLAYERS: Number(
    process.env.NEXT_PUBLIC_MAX_UNVERIFIED_PLAYERS ||
    process.env.EXPO_PUBLIC_MAX_UNVERIFIED_PLAYERS ||
    10
  ),
  MAX_COURTS: Number(
    process.env.NEXT_PUBLIC_MAX_UNVERIFIED_COURTS ||
    process.env.EXPO_PUBLIC_MAX_UNVERIFIED_COURTS ||
    3
  ),
};
