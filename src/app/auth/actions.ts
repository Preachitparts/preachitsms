
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
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
        let canSeeSettings = false;
        let isInvited = false;
        let invitedDocId: string | null = null;

        if (isFirstAdmin) {
            canSeeSettings = true;
        } else {
            const q = query(adminsCollectionRef, where('email', '==', email));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                 return { error: "This email is not invited. Please contact an administrator." };
            }
            const invitedDoc = querySnapshot.docs[0];
            if (invitedDoc.data().status === 'registered') {
                return { error: "This email is already registered." };
            }
            canSeeSettings = invitedDoc.data().canSeeSettings;
            isInvited = true;
            invitedDocId = invitedDoc.id;
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const adminData = {
            uid: user.uid,
            email: user.email,
            fullName,
            canSeeSettings,
            status: 'registered' as const,
        };

        if (isInvited && invitedDocId) {
             await updateDoc(doc(db, "admins", invitedDocId), adminData);
        } else {
            await setDoc(doc(db, 'admins', user.uid), adminData);
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
        
        return { success: true };
    } catch (e: any) {
         return { error: 'Invalid email or password.' };
    }
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
        // In a real production app, you MUST verify the token using the Firebase Admin SDK
        // to prevent token tampering. For this dev environment, we decode it.
        const decodedToken = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64').toString());
        const uid = decodedToken.user_id;

        if (!uid) return null;

        // The user's doc in 'admins' should be keyed by their UID.
        const adminDocRef = doc(db, 'admins', uid);
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists()) {
            return { uid, ...adminDoc.data() } as Admin;
        }

        // Fallback for invited users whose doc ID might not be UID yet (should be rare)
         const q = query(collection(db, 'admins'), where('email', '==', decodedToken.email), where('status', '==', 'registered'));
         const querySnapshot = await getDocs(q);
         if (!querySnapshot.empty) {
             const doc = querySnapshot.docs[0];
             return { uid: doc.data().uid || doc.id, ...doc.data() } as Admin;
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
