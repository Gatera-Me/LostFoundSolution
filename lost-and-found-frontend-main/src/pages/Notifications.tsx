import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState } from 'react';

export const Notifications = () => {
    const { user, logout } = useAuth();
    const { settings, updateSettings } = useNotifications();
    const [localSettings, setLocalSettings] = useState({
        newItems: settings?.newItems ?? true,
        claimUpdates: settings?.claimUpdates ?? true,
    });

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleToggle = (type: 'newItems' | 'claimUpdates') => {
        const updatedSettings = { ...localSettings, [type]: !localSettings[type] };
        setLocalSettings(updatedSettings);
        updateSettings(updatedSettings);
    };

    return (
        <div className="flex min-h-screen">
            <div className="w-64 bg-gray-200 p-6">
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.role} | Level 1</p>
                </div>
                <nav className="space-y-3">
                    <Link to="/" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Dashboard</Link>
                    <Link to="/lost-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Lost Items</Link>
                    <Link to="/report-missing" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Missing Items</Link>
                    <Link to="/report-found" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Found Items</Link>
                    <Link to="/claim-confirmation/:id" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Claim Confirmation</Link>
                    <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
                    <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
                    <Link to="/notifications" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">Notifications</Link>
                    <button onClick={logout} className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left">Logout</button>
                </nav>
            </div>
            <div className="flex-1 bg-gray-100">
                <header className="bg-green-600 text-white p-5 flex justify-between items-center shadow-md">
                    <h1 className="text-3xl font-extrabold">ReClaimIt</h1>
                    <button className="text-3xl focus:outline-none hover:text-gray-200">🔔</button>
                </header>
                <div className="p-10">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Notification Settings</h2>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <span className="text-lg text-gray-700">New Lost Items</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localSettings.newItems}
                                        onChange={() => handleToggle('newItems')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-lg text-gray-700">Claim Updates</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={localSettings.claimUpdates}
                                        onChange={() => handleToggle('claimUpdates')}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600" />
                                </label>
                            </div>
                        </div>
                        <p className="mt-6 text-sm text-gray-600">
                            <Link to="/" className="text-green-600 hover:underline font-medium">
                                Save and Return to Dashboard
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};