import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  diamonds: number;
  beans: number;
  vipLevel: number;
  totalSpent: number;
  role: 'user' | 'admin' | 'streamer' | 'agency';
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Setting up onAuthStateChanged listener');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AuthContext: onAuthStateChanged triggered', firebaseUser ? `User: ${firebaseUser.uid}` : 'No user');
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let unsubProfile: (() => void) | undefined;

    const loadProfile = async () => {
      if (user) {
        console.log('AuthContext: Loading profile for', user.uid);
        setLoading(true);
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            console.log('AuthContext: Profile not found, creating new profile');
            const newProfile: UserProfile = {
              uid: user.uid,
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              diamonds: 1000,
              beans: 0,
              vipLevel: 0,
              totalSpent: 0,
              role: 'user'
            };
            await setDoc(userRef, newProfile);
            setProfile(newProfile);
          } else {
            console.log('AuthContext: Profile loaded successfully');
            setProfile(userSnap.data() as UserProfile);
          }

          console.log('AuthContext: Setting up profile snapshot listener');
          unsubProfile = onSnapshot(userRef, (doc) => {
            if (doc.exists()) {
              console.log('AuthContext: Profile updated in real-time');
              setProfile(doc.data() as UserProfile);
            }
          });
        } catch (error) {
          console.error('AuthContext: Error loading profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      if (unsubProfile) {
        console.log('AuthContext: Cleaning up profile snapshot listener');
        unsubProfile();
      }
    };
  }, [user]);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
