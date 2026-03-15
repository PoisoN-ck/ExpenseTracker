import { createContext, useContext, useMemo } from 'react';

import useDataStatus from '@hooks/useDataStatus';

const DataStatusContext = createContext(null);

export const DataStatusProvider = ({ children }) => {
    const {
        isLoading,
        setIsLoading,
        dataError,
        setDataError,
        successMessage,
        setSuccessMessage,
        resetMessages,
        sendVerificationEmail,
    } = useDataStatus();

    const value = useMemo(
        () => ({
            isLoading,
            setIsLoading,
            dataError,
            setDataError,
            successMessage,
            setSuccessMessage,
            resetMessages,
            sendVerificationEmail,
        }),
        [
            isLoading,
            setIsLoading,
            dataError,
            setDataError,
            successMessage,
            setSuccessMessage,
            resetMessages,
            sendVerificationEmail,
        ],
    );

    return (
        <DataStatusContext.Provider value={value}>
            {children}
        </DataStatusContext.Provider>
    );
};

export const useDataStatusContext = () => useContext(DataStatusContext);
