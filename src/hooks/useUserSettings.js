import { useCallback, useEffect, useState } from 'react';
import useAuth from './useAuth';
import { DEFAULT_REFRESH_DAY } from '@constants';
import { fetchValueAsPromise, updateValueWithConnectionCheck } from '@utils';

const useUserSettings = () => {
    // TOOD: Move loading state to a separate hook for future
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [usersSettings, setUsersSettings] = useState({});
    const [plannedExpenseDayRefresh, setPlannedExpenseDayRefresh] =
        useState(DEFAULT_REFRESH_DAY);

    const resetMessages = () => {
        setDataError(null);
        setSuccessMessage(null);
    };

    const { isVerified } = useAuth();

    const fetchPlannedExpenseDayRefresh = () =>
        fetchValueAsPromise({
            refPath: 'plannedExpenseDayRefresh',
            defaultValue: DEFAULT_REFRESH_DAY,
            onFetched: setPlannedExpenseDayRefresh,
            handleError: setDataError,
        });

    const fetctUsersSettings = async () => {
        return fetchValueAsPromise({
            refPath: 'usersSettings',
            defaultValue: {},
            onFetched: setUsersSettings,
            handleError: setDataError,
        });
    };

    const updatePlannedExpenseDayRefresh = useCallback(
        async (day) => {
            if (!day) {
                setDataError({ code: 'add-missing-refresh-day' });
                return false;
            }

            return await updateValueWithConnectionCheck({
                path: 'plannedExpenseDayRefresh',
                value: day,
                isVerified,
                successCode: 'updated-planned-expense-day-refresh',
                resetMessages,
                setSuccessMessage,
                setError: setDataError,
                restoreOnFail: () =>
                    setPlannedExpenseDayRefresh(plannedExpenseDayRefresh),
            });
        },
        [isVerified, plannedExpenseDayRefresh],
    );

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
        await fetchPlannedExpenseDayRefresh();
        setIsLoading(false);
    }, [fetchPlannedExpenseDayRefresh, fetctUsersSettings]);

    useEffect(() => {
        console.log('Initial load of user settings');
        initialLoad();
    }, []);

    return {
        dataError,
        isLoading,
        successMessage,
        plannedExpenseDayRefresh,
        usersSettings,
        addUserSettings,
        resetMessages,
        setDataError,
        updatePlannedExpenseDayRefresh,
    };
};

export default useUserSettings;
