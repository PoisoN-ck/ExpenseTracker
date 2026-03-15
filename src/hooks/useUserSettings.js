import { useCallback, useEffect, useState } from 'react';
import useAuth from './useAuth';
import { fetchValueAsPromise, updateValueWithConnectionCheck } from '@utils';

const useUserSettings = () => {
    // TOOD: Move loading state to a separate hook for future
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [usersSettings, setUsersSettings] = useState({});

    const resetMessages = () => {
        setDataError(null);
        setSuccessMessage(null);
    };

    const { isVerified } = useAuth();

    const fetctUsersSettings = async () => {
        return fetchValueAsPromise({
            refPath: 'usersSettings',
            defaultValue: {},
            onFetched: setUsersSettings,
            handleError: setDataError,
        });
    };

    const addUserSettings = useCallback(
        async (userSetting) => {
            const [userData] = Object.entries(userSetting);
            const [, userDetails] = userData;

            if (!userDetails.name || !userDetails.color) {
                setDataError({ code: 'add-missing-fields' });
                return false;
            }

            return await updateValueWithConnectionCheck({
                path: 'usersSettings',
                value: userSetting,
                oldValue: usersSettings,
                isVerified,
                successCode: 'added-user-settings',
                resetMessages,
                setSuccessMessage,
                setError: setDataError,
                restoreOnFail: () => setUsersSettings(usersSettings),
            });
        },
        [isVerified, usersSettings],
    );

    const initialLoad = useCallback(async () => {
        setIsLoading(true);
        await fetctUsersSettings();
        setIsLoading(false);
    }, [fetctUsersSettings]);

    useEffect(() => {
        initialLoad();
    }, []);

    return {
        dataError,
        isLoading,
        successMessage,
        usersSettings,
        addUserSettings,
        resetMessages,
        setDataError,
    };
};

export default useUserSettings;
