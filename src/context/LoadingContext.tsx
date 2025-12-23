import { createContext, useContext, useState, ReactNode } from 'react';
import LoadingOverlay from '../components/ui/LoadingOverlay';

interface LoadingContextType {
    setIsLoading: (loading: boolean) => void;
    withLoading: <T>(fn: () => Promise<T>) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
    const [isLoading, setIsLoading] = useState(false);

    const withLoading = async <T,>(fn: () => Promise<T>): Promise<T> => {
        setIsLoading(true);
        try {
            return await fn();
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <LoadingContext.Provider value={{ setIsLoading, withLoading }}>
            {children}
            <LoadingOverlay isLoading={isLoading} />
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
}
