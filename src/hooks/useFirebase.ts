
import { useEffect, useState } from 'react';
import { auth, db, storage, analytics } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export const useFirebase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return {
    user,
    loading,
    auth,
    db,
    storage,
    analytics,
    isAuthenticated: !!user
  };
};
