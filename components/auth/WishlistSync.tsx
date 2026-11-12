'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth/context';
import { syncWishlist } from '@/lib/ui/wishlist';

// Loads the signed-in user's wishlist and clears it on sign-out. Renders nothing.
export function WishlistSync() {
  const { user, loading, setAuthModalOpen } = useAuth();
  useEffect(() => {
    if (loading) return;
    void syncWishlist(user, () => setAuthModalOpen(true));
  }, [user, loading, setAuthModalOpen]);
  return null;
}
