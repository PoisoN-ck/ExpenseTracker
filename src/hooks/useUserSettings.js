import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from '@context/AuthContext';
import { fetchValueAsPromise, updateValueWithConnectionCheck } from '@utils';

const useUserSettings = () => {
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [usersSettings, setUsersSettings] = useState({});

    const resetMessages = () => {
        setDataError(null);
        setSuccessMessage(null);
    };

    const { isVerified } = useAuthContext();

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
        await fetctUsersSettings();
    }, [fetctUsersSettings]);

    useEffect(() => {
        initialLoad();
    }, []);

    return {
        dataError,
        successMessage,
        usersSettings,
        addUserSettings,
        resetMessages,
        setDataError,
    };
};

export default useUserSettings;
