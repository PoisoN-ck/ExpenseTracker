import { sendEmailVerification } from 'firebase/auth';
import { useState } from 'react';

import { auth } from '@/services/db';

const useDataStatus = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    const resetMessages = () => {
        setDataError(null);
        setSuccessMessage(null);
    };

    // To be moved out of data domain in a future refactor
    const sendVerificationEmail = async () => {
        const user = auth.currentUser;

        resetMessages();

        if (user) {
            try {
                setIsLoading(true);
                await sendEmailVerification(user);
                setSuccessMessage({ code: 'email-sent' });
            } catch (error) {
                setDataError(error);
            } finally {
                setIsLoading(false);
            }
        }
    };

    return {
        isLoading,
        setIsLoading,
        dataError,
        setDataError,
        successMessage,
        setSuccessMessage,
        resetMessages,
        sendVerificationEmail,
    };
};

export default useDataStatus;
