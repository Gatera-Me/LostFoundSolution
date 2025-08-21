import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState } from 'react';
import axios from 'axios';

export const ReportFound = () => {
    const { user, logout } = useAuth();
    const { addNotification, notifications, clearNotifications } = useNotifications();
    const [formData, setFormData] = useState({
        itemName: '',
        description: '',
        foundLocation: '',
        foundDate: new Date().toISOString().split('T')[0],
        status: 'OPEN',
    });
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8080/found-items', {
                ...formData,
                foundDate: new Date(formData.foundDate).toISOString(),
            }, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });
            addNotification(`New found item reported: ${formData.itemName}`);
            alert(`Found item reported: ${formData.itemName}`);
            setFormData({ itemName: '', description: '', foundLocation: '', foundDate: new Date().toISOString().split('T')[0], status: 'OPEN' });
        } catch (error) {
            console.error('Failed to report found item:', error);
            alert('Failed to report item. Please try again.');
        }
    };

    const toggleDropdown = () => {
        setIsDropdownOpen(!isDropdownOpen);
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
                    <Link to="/report-found" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">Report Found Items</Link>
                    <Link to="/claim-confirmation/:id" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Claim Confirmation</Link>
                    <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
                    <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
                    <Link to="/notifications" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Notifications</Link>
                    <button onClick={logout} className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left">Logout</button>
                </nav>
            </div>
            <div className="flex-1 bg-gray-100">
                <header className="bg-green-600 text-white p-5 flex justify-between items-center shadow-md">
                    <h1 className="text-3xl font-extrabold">ReClaimIt</h1>
                    <div className="relative">
                        <button
                            onClick={toggleDropdown}
                            className="text-3xl focus:outline-none hover:text-gray-200 relative"
                        >
                            🔔
                            {notifications.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {notifications.length}
                                </span>
                            )}
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-10">
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                                        <button
                                            onClick={clearNotifications}
                                            className="text-sm text-red-600 hover:underline"
                                        >
                                            Clear All
                                        </button>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <p className="text-gray-600">No notifications</p>
                                    ) : (
                                        notifications.map((notification) => (
                                            <div
                                                key={notification.id}
                                                className="py-2 border-b border-gray-200 last:border-b-0"
                                            >
                                                <p className="text-sm text-gray-800">{notification.message}</p>
                                                <p className="text-xs text-gray-500">{notification.timestamp}</p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </header>
                <div className="p-10">
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Report a Found Item</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Item Name</label>
                                <input
                                    type="text"
                                    name="itemName"
                                    value={formData.itemName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    placeholder="Enter the item name"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    placeholder="Describe the item (e.g., color, condition)"
                                    rows={4}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Location Found</label>
                                <input
                                    type="text"
                                    name="foundLocation"
                                    value={formData.foundLocation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    placeholder="Enter the location (e.g., Gate 1)"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Date Found</label>
                                <input
                                    type="date"
                                    name="foundDate"
                                    value={formData.foundDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                                Submit Report
                            </button>
                        </form>
                        <p className="mt-4 text-sm text-gray-600">
                            <Link to="/" className="text-green-600 hover:underline font-medium">
                                Cancel and Return to Dashboard
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};