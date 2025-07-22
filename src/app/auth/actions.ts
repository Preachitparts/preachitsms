
'use server';

import { z } from 'zod';
import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { redirect } from 'next/navigation';

// This file contains server-side actions for authentication with Firebase.
// We are using Firebase Auth for user management.

export interface Admin {
  uid: string;
  email: string;
  fullName: string;
  canSeeSettings: boolean;
  photoURL?: string;
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

// Initialize Firebase app if not already initialized
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);


// Using Supabase's cookie handling for Next.js Server Components as a robust way to manage session
const createSupabaseServerClient = () => {
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return cookies().get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    cookies().set({ name, value, ...options })
                },
                remove(name: string, options: CookieOptions) {
                    cookies().set({ name, value: '', ...options })
                },
            },
        }
    )
}

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
        // Check if there is a pre-invited admin record
        const q = query(collection(db, 'admins'), where('email', '==', email));
        const querySnapshot = await getDocs(q);

        let canSeeSettings = false;
        let invitedDocId: string | null = null;
        
        if (!querySnapshot.empty) {
            const invitedDoc = querySnapshot.docs[0];
            canSeeSettings = invitedDoc.data().canSeeSettings;
            invitedDocId = invitedDoc.id;
        } else {
             // For the very first admin signup
            const adminsSnapshot = await getDocs(collection(db, 'admins'));
            if (adminsSnapshot.empty) {
                canSeeSettings = true; // First user is super admin
            } else {
                 return { error: "This email is not invited. Please contact an administrator." };
            }
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        const adminData = {
            email: user.email,
            fullName,
            canSeeSettings,
        };

        if (invitedDocId) {
            await setDoc(doc(db, 'admins', user.uid), adminData);
            // Optionally, delete the invitation record
            await updateDoc(doc(db, 'admins', invitedDocId), { status: 'registered', uid: user.uid });
        } else {
            await setDoc(doc(db, 'admins', user.uid), adminData);
        }

        // We are not logging the user in automatically after signup for security.
        return { error: null };
    } catch (e: any) {
        if (e.code === 'auth/email-already-in-use') {
            return { error: 'This email is already registered.' };
        }
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
        
        // Set session cookie
        const supabase = createSupabaseServerClient();
        const { error } = await supabase.auth.setSession({ access_token: idToken, refresh_token: user.refreshToken! });
        
        if (error) {
            return { error: 'Failed to set session.' };
        }
        
        return { error: null };
    } catch (e: any) {
         return { error: 'Invalid email or password.' };
    }
}

export async function logout() {
    const supabase = createSupabaseServerClient();
    await supabase.auth.signOut();
    redirect('/login');
}

export async function getCurrentUser() {
    const supabase = createSupabaseServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
        return null;
    }

    const adminDocRef = doc(db, 'admins', session.user.id);
    const adminDoc = await getDoc(adminDocRef);

    if (adminDoc.exists()) {
        return {
            uid: session.user.id,
            ...adminDoc.data()
        } as Admin;
    }
    
    return null;
}

export async function sendPasswordReset(formData: FormData) {
    const email = formData.get('email') as string;
    if (!email) {
        return { error: 'Email is required.' };
    }
    try {
        await sendPasswordResetEmail(auth, email);
        return { error: null };
    } catch (e: any) {
        return { error: 'Failed to send password reset email. Please check if the email is correct.' };
    }
}
