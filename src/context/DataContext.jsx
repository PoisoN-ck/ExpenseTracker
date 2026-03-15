import { createContext, useContext } from 'react';
import useData from '@hooks/useData';

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const data = useData();
    return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
};

export const useDataContext = () => useContext(DataContext);
