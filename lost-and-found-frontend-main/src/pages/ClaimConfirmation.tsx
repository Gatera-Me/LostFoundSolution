import { Navigate, Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface LostItem {
    lostId: number;
    itemName: string;
}

interface FoundItem {
    foundId: number;
    itemName: string;
    description: string;
    foundLocation: string;
    foundDate: string;
}

export const ClaimConfirmation = () => {
    const { id } = useParams<{ id: string }>();
    const { user, logout } = useAuth();
    const { addNotification, notifications, clearNotifications } = useNotifications();
    const [foundItem, setFoundItem] = useState<FoundItem | null>(null);
    const [lostItems, setLostItems] = useState<LostItem[]>([]);
    const [selectedLostItem, setSelectedLostItem] = useState<string>('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('ClaimConfirmation - ID from useParams:', id);
        console.log('User:', user); // Debug user and role

        if (!id || id === ':id' || isNaN(Number(id))) {
            setError('Invalid item ID. Please select a valid item.');
            return;
        }

        const fetchFoundItem = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching found item with URL:', `http://localhost:8080/found-items/${id}`, 'Token:', token);
                const response = await axios.get(`http://localhost:8080/found-items/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                console.log('Found item response:', response.data);
                setFoundItem(response.data);
            } catch (error: any) {
                console.error('Failed to fetch found item:', error);
                setError(error.response?.data?.message || 'Failed to fetch item details.');
            }
        };

        const fetchLostItems = async () => {
            try {
                const token = localStorage.getItem('token');
                console.log('Fetching lost items with Token:', token);
                const response = await axios.get('http://localhost:8080/lost-items', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setLostItems(response.data);
            } catch (error) {
                console.error('Failed to fetch lost items:', error);
            }
        };

        fetchFoundItem();
        fetchLostItems();
    }, [id, user]);

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (!id || id === ':id' || isNaN(Number(id))) {
        return <Navigate to="/found-items" />;
    }

    const handleClaim = async () => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        console.log('User:', user);

        if (!foundItem || !selectedLostItem) {
            alert('Please select a lost item to match.');
            return;
        }

        try {
            const match = {
                lostItem: { lostId: Number(selectedLostItem) },
                foundItem: { foundId: foundItem.foundId },
                matchedBy: { userId: Number(user.userId) },
                matchDate: new Date().toISOString(),
                status: 'OPEN',
            };
            console.log('Submitting claim:', match);
            const response = await axios.post('http://localhost:8080/matches', match, {
                headers: { Authorization: `Bearer ${token}` },
            });
            console.log('Claim response:', response.data);
            addNotification(`Claim submitted for ${foundItem.itemName}`);
            alert(`Claim submitted for ${foundItem.itemName}`);
        } catch (error: any) {
            console.error('Failed to submit claim:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to submit claim. Please try again.';
            alert(errorMessage);
            setError(errorMessage);
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
                    <Link to="/found-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Found Items</Link>
                    <Link to="/report-missing" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Missing Items</Link>
                    <Link to="/report-found" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Found Items</Link>
                    <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
                    <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
                    <Link to="/notifications" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Notifications</Link>
                    <button onClick={logout} className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left">Logout</button>
                </nav>
            </div>
            <div className="flex-1 bg-gray-100">
                <header className="bg-green-600 text-white p-5 flex justify-between items-center shadow-md">
                    <h1 className="text-3xl font-extrabold">AUCA: Lost and Found</h1>
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
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Claim Confirmation</h2>
                        {error ? (
                            <p className="text-red-600">{error}</p>
                        ) : foundItem ? (
                            <div>
                                <p><strong>Item Name:</strong> {foundItem.itemName}</p>
                                <p><strong>Description:</strong> {foundItem.description}</p>
                                <p><strong>Location Found:</strong> {foundItem.foundLocation}</p>
                                <p><strong>Date Found:</strong> {new Date(foundItem.foundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                <div className="mt-4">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Lost Item to Match</label>
                                    <select
                                        value={selectedLostItem}
                                        onChange={(e) => setSelectedLostItem(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    >
                                        <option value="">Select a lost item</option>
                                        {lostItems.map((item) => (
                                            <option key={item.lostId} value={item.lostId}>
                                                {item.itemName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <button
                                    onClick={handleClaim}
                                    className="mt-6 bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                                >
                                    Confirm Claim
                                </button>
                            </div>
                        ) : (
                            <p>Loading...</p>
                        )}
                        <p className="mt-4 text-sm text-gray-600">
                            <Link to="/found-items" className="text-green-600 hover:underline font-medium">
                                Cancel and Return to Found Items
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};