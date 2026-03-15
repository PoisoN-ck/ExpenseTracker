import { createContext, useContext } from 'react';
import useUserSettings from '@hooks/useUserSettings';

const UserSettingsContext = createContext(null);

export const UserSettingsProvider = ({ children }) => {
    const userSettings = useUserSettings();
    return (
        <UserSettingsContext.Provider value={userSettings}>
            {children}
        </UserSettingsContext.Provider>
    );
};

export const useUserSettingsContext = () => useContext(UserSettingsContext);
