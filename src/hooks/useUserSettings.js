import { useCallback, useEffect, useState } from 'react';
import useAuth from './useAuth';
import { DEFAULT_REFRESH_DAY } from '@constants';
import {
    fetchValueAsPromise,
    handleSimpleSnapshotValue,
    updateValueWithConnectionCheck,
} from '@utils';

const useUserSettings = () => {
    // TOOD: Move loading state to a separate hook for future
    const [isLoading, setIsLoading] = useState(true);
    const [dataError, setDataError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // const [usersSettings, setUsersSettings] = useState([]);
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
            handleFetchedValue: handleSimpleSnapshotValue,
            onFetched: setPlannedExpenseDayRefresh,
            defaultValue: DEFAULT_REFRESH_DAY,
            handleError: setDataError,
        });

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

    const initialLoad = useCallback(async () => {
        setIsLoading(true);
        await fetchPlannedExpenseDayRefresh();
        setIsLoading(false);
    }, [fetchPlannedExpenseDayRefresh]);

    useEffect(() => {
        initialLoad();
    }, []);

    return {
        dataError,
        isLoading,
        successMessage,
        plannedExpenseDayRefresh,
        resetMessages,
        setDataError,
        updatePlannedExpenseDayRefresh,
    };
};

export default useUserSettings;
