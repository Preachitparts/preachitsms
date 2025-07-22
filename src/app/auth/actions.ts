
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch, updateDoc, collectionGroup, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { redirect } from 'next/navigation';

export interface Admin {
  uid: string;
  email: string;
  fullName: string;
  canSeeSettings: boolean;
  photoURL?: string;
  status?: 'invited' | 'registered';
}

const firebaseConfig = {
  apiKey: "AIzaSyDPBnv9n56CBoNobFijN8hf3wBL2smuEDk",
  authDomain: "preach-it-sms.firebaseapp.com",
  projectId: "preach-it-sms",
  storageBucket: "preach-it-sms.appspot.com",
  messagingSenderId: "348405568862",
  appId: "1:348405568862:web:1d2c56e26b2fd3a1caebcf",
  measurementId: "G-4DY8CQ02RS"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters long.'),
    confirmPassword: z.string(),
    fullName: z.string().min(2, 'Full name is required.'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export async function signup(formData: FormData) {
    const parsed = signupSchema.safeParse(Object.fromEntries(formData));

    if (!parsed.success) {
        return { error: parsed.error.errors.map(e => e.message).join(', ') };
    }
    
    const { email, password, fullName } = parsed.data;
    
    try {
        const adminsCollectionRef = collection(db, 'admins');
        const adminsSnapshot = await getDocs(adminsCollectionRef);
        const isFirstAdmin = adminsSnapshot.empty;
        let canProceed = isFirstAdmin;
        let inviteData: any = null;

        if (!isFirstAdmin) {
             const q = query(adminsCollectionRef, where('email', '==', email), where('status', '==', 'invited'));
             const inviteSnapshot = await getDocs(q);
             if (inviteSnapshot.empty) {
                // This logic is for the hardcoded first user
                if(email.toLowerCase() === 'michaelquaicoe60@gmail.com') {
                    canProceed = true;
                } else {
                    return { error: "This email has not been invited. Please contact an administrator." };
                }
             } else {
                canProceed = true;
                inviteData = { id: inviteSnapshot.docs[0].id, ...inviteSnapshot.docs[0].data()};
             }
        }

        if (!canProceed) {
            return { error: "Signup is currently disabled. Please contact an administrator for an invitation." };
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const adminData: Omit<Admin, 'uid'> & {status: 'registered'} = {
            email: user.email!,
            fullName: inviteData?.fullName || fullName,
            canSeeSettings: isFirstAdmin || (email.toLowerCase() === 'michaelquaicoe60@gmail.com') || (inviteData?.canSeeSettings ?? false),
            status: 'registered',
        };
        
        await setDoc(doc(db, 'admins', user.uid), adminData);
        
        if (inviteData?.id) {
            await deleteDoc(doc(db, 'admins', inviteData.id));
        }
        
        return { success: true };

    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            return { error: 'This email is already registered.' };
        }
        console.error("Signup error:", e);
        return { error: 'An unexpected error occurred during signup.' };
    }
}

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

export async function login(formData: FormData) {
    const parsed = loginSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        return { error: "Invalid credentials" };
    }
    const { email, password } = parsed.data;

    try {
        const { user } = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await user.getIdToken();

        cookies().set('firebaseIdToken', idToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });
        
    } catch (e: any) {
         return { error: 'Invalid email or password.' };
    }

    redirect('/');
}

export async function logout() {
    cookies().delete('firebaseIdToken');
    redirect('/login');
}

export async function getCurrentUser(): Promise<Admin | null> {
    const idToken = cookies().get('firebaseIdToken')?.value;

    if (!idToken) {
        return null;
    }

    try {
        // A simple way to decode the token payload without a full JWT library
        const decodedToken = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        const uid = decodedToken.user_id;

        if (!uid) return null;

        const adminDocRef = doc(db, 'admins', uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
            return { uid, ...adminDoc.data() } as Admin;
        }
        
        console.warn(`User with UID ${uid} is authenticated but not found in 'admins' collection.`);
        return null;

    } catch(e) {
        console.error("Failed to decode token or fetch user", e);
        cookies().delete('firebaseIdToken');
        return null;
    }
}

export async function sendPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) {
        return { error: 'Email is required.' };
    }
    try {
        await sendPasswordResetEmail(auth, email);
        return { success: true };
    } catch (e: any) {
        return { error: 'Failed to send password reset email. Please check if the email is correct.' };
    }
}
