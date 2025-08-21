import { createContext, useContext, useState, useEffect } from 'react';

interface Notification {
    id: number;
    message: string;
    timestamp: string;
}

interface NotificationSettings {
    newItems: boolean;
    claimUpdates: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    settings: NotificationSettings;
    addNotification: (message: string) => void;
    clearNotifications: () => void;
    updateSettings: (settings: NotificationSettings) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>(() => {
        const savedNotifications = localStorage.getItem('notifications');
        return savedNotifications ? JSON.parse(savedNotifications) : [];
    });

    const [settings, setSettings] = useState<NotificationSettings>(() => {
        const savedSettings = localStorage.getItem('notificationSettings');
        return savedSettings ? JSON.parse(savedSettings) : { newItems: true, claimUpdates: true };
    });

    useEffect(() => {
        localStorage.setItem('notifications', JSON.stringify(notifications));
    }, [notifications]);

    useEffect(() => {
        localStorage.setItem('notificationSettings', JSON.stringify(settings));
    }, [settings]);

    const addNotification = (message: string) => {
        const newNotification = {
            id: notifications.length + 1,
            message,
            timestamp: new Date().toISOString(),
        };
        setNotifications((prev) => [...prev, newNotification]);
    };

    const clearNotifications = () => {
        setNotifications([]);
    };

    const updateSettings = (newSettings: NotificationSettings) => {
        setSettings(newSettings);
    };

    return (
        <NotificationContext.Provider value={{ notifications, settings, addNotification, clearNotifications, updateSettings }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};