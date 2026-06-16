import { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { User, onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut as firebaseSignOut, signInAnonymously } from 'firebase/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signInGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser((prev: any) => {
         if (prev && prev.uid && prev.uid.startsWith('guest-') && !u) return prev;
         return u;
      });
      setLoading(false);
    });
  }, []);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    try {
      await signInWithPopup(auth, provider);
    } catch (e: any) {
      if (e.code !== 'auth/cancelled-popup-request' && e.code !== 'auth/popup-closed-by-user') {
        console.error('Sign-in failed:', e);
      }
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  const signInGuest = async () => {
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      console.error('Guest sign-in failed, using local guest session:', e);
      setUser({
        uid: 'guest-' + Date.now(),
        displayName: 'Guest User',
        photoURL: '',
        email: null,
      } as any);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signInGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
