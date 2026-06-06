import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userProfile: any | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  loginWithGoogle: async () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          }
        } catch (error: any) {
          console.error("Auth sync error:", error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    
    // Save to Firestore if new
    const docRef = doc(db, 'users', result.user.uid);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      const newProfile = {
        name: result.user.displayName || 'New User',
        email: result.user.email,
        createdAt: new Date().toISOString(),
        skills: [],
        interests: [],
        branch: '',
        role: 'student'
      };
      await setDoc(docRef, newProfile);
      setUserProfile(newProfile);
    } else {
      setUserProfile(docSnap.data());
    }
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, loginWithGoogle, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
