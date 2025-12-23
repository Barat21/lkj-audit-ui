import { createContext, useContext, useState, ReactNode } from 'react';
import AlertModal from '../components/ui/AlertModal';

interface AlertContextType {
    showAlert: (message: string, title?: string, type?: 'success' | 'info' | 'error') => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
    const [alertState, setAlertState] = useState<{
        isOpen: boolean;
        message: string;
        title: string;
        type: 'success' | 'info' | 'error';
    }>({
        isOpen: false,
        message: '',
        title: '',
        type: 'info',
    });

    const showAlert = (message: string, title = 'Notification', type: 'success' | 'info' | 'error' = 'info') => {
        setAlertState({
            isOpen: true,
            message,
            title,
            type,
        });
    };

    const closeAlert = () => {
        setAlertState((prev) => ({ ...prev, isOpen: false }));
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            <AlertModal
                isOpen={alertState.isOpen}
                onClose={closeAlert}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (context === undefined) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
