import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface LostItem {
  lostId: number;
  itemName: string;
  description: string;
  lostLocation: string;
  lostDate: string;
  status: string;
}

export const ViewLostItems = () => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const [lostItems, setLostItems] = useState<LostItem[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]); // Add filtered state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/lost-items', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        console.log('Fetched lost items from backend:', response.data);
        setLostItems(response.data);
        setFilteredItems(response.data); // Initialize filtered items
      } catch (error: any) {
        console.error('Failed to fetch lost items:', error);
        setError(error.response?.data?.message || 'Failed to fetch lost items.');
      }
    };
    fetchLostItems();
  }, []);

  // Filter items based on search query
  useEffect(() => {
    const filtered = lostItems.filter((item) =>
      Object.values(item)
        .filter((value) => typeof value === 'string')
        .some((value) =>
          value.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, lostItems]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const currentItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-200 p-6">
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
          <p className="text-sm text-gray-600">{user.role} | Level 1</p>
        </div>
        <nav className="space-y-3">
          <Link to="/" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Dashboard</Link>
          <Link to="/lost-items" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">View Lost Items</Link>
          <Link to="/found-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Found Items</Link>
          <Link to="/report-missing" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Missing Items</Link>
          <Link to="/report-found" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Found Items</Link>
          <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
          <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
          <Link to="/notifications" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Notifications</Link>
          {user.role === 'ADMIN' && (
            <>
              <Link to="/manage-claims" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Manage Claims</Link>
              <Link to="/view-users" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Users</Link>
            </>
          )}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Lost Items</h2>
              <input
                type="text"
                placeholder="Search table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-1/3 p-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              />
            </div>
            {error ? (
              <p className="text-red-600">{error}</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-gray-600">No matching lost items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="p-4 text-left font-semibold">Item Name</th>
                      <th className="p-4 text-left font-semibold">Location</th>
                      <th className="p-4 text-left font-semibold">Date Lost</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => (
                      <tr key={item.lostId} className="border-b hover:bg-gray-50">
                        <td className="p-4">{item.itemName}</td>
                        <td className="p-4">{item.lostLocation}</td>
                        <td className="p-4">{new Date(item.lostDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="p-4">{item.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
                  >
                    Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg disabled:bg-gray-400"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};