import {
    browserLocalPersistence,
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    sendEmailVerification,
    setPersistence,
    signInWithEmailAndPassword,
    signOut,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

import { auth } from '../services/db';

const useAuth = () => {
    const [isLoginPending, setIsLoginPending] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authError, setAuthError] = useState('');
    const [isVerified, setIsVerified] = useState(false);

    const resetUserState = () => {
        setAuthError('');
        setIsLoggedIn(false);
    };

    const logIn = async ({ email, password }) => {
        setIsLoginPending(true);

        try {
            await setPersistence(auth, browserLocalPersistence);
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            setAuthError(error);
        } finally {
            setIsLoginPending(false);
        }
    };

    const logOut = async () => {
        setIsLoginPending(true);

        try {
            await signOut(auth);
        } catch (error) {
            setAuthError(error);
        } finally {
            setIsLoginPending(false);
        }
    };

    const checkLoginState = () => {
        onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsLoggedIn(true);
                setIsVerified(user.emailVerified);
            } else {
                resetUserState();
            }
            setIsLoginPending(false);
        });
    };

    const sendVerificationEmail = async () => {
        const user = auth.currentUser;

        if (user) {
            try {
                await sendEmailVerification(user);
            } catch (error) {
                setAuthError(error);
            }
        }
    };

    const signUp = (email, password) => {
        setIsLoginPending(true);
        createUserWithEmailAndPassword(auth, email, password)
            .then(async () => {
                await sendVerificationEmail();
            })
            .catch((error) => {
                setAuthError(error);
            })
            .finally(() => {
                setIsLoginPending(false);
            });
    };

    useEffect(() => {
        checkLoginState();
    }, []);

    return {
        authError,
        isLoginPending,
        isLoggedIn,
        isVerified,
        logOut,
        logIn,
        signUp,
    };
};

export default useAuth;
