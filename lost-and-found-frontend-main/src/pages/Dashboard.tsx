import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { GlobalSearch } from '../components/GlobalSearch.tsx';

interface LostItem {
  lostId: number;
  itemName: string;
  description: string;
  lostLocation: string;
  lostDate: string;
  status: string;
}

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentLostItems, setRecentLostItems] = useState<LostItem[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); // Add search state
  const [filteredItems, setFilteredItems] = useState<LostItem[]>([]); // Add filtered state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const claimedItems = 0;
  const usersClaimedItems = user?.role === 'ADMIN' ? 2 : 0;
  const pendingClaims = 1;

  useEffect(() => {
    const fetchLostItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/lost-items', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const items = response.data.map((item: any) => ({
          lostId: item.lostId,
          itemName: item.itemName,
          description: item.description,
          lostLocation: item.lostLocation,
          lostDate: item.lostDate.toString(),
          status: item.status,
        }));
        setRecentLostItems(items);
        setFilteredItems(items); // Initialize filtered items
      } catch (error) {
        console.error('Failed to fetch lost items:', error);
      }
    };
    fetchLostItems();
  }, []);

  // Filter items based on search query
  useEffect(() => {
    const filtered = recentLostItems.filter((item) =>
      Object.values(item)
        .filter((value) => typeof value === 'string') // Only search string values
        .some((value) =>
          value.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, recentLostItems]);

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
          <Link to="/" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">Dashboard</Link>
          <Link to="/lost-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Lost Items</Link>
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
          <h1 className="text-3xl font-extrabold">ReClaimIt</h1>
          <GlobalSearch />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
            <div className="bg-orange-500 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Your Claimed Items</h3>
              <p className="text-5xl font-extrabold">{claimedItems}</p>
              <Link to="/found-items">
                <button className="mt-5 bg-white text-orange-500 px-5 py-2 rounded-lg hover:bg-gray-100 font-medium">
                  View
                </button>
              </Link>
            </div>
            {user.role === 'ADMIN' && (
              <div className="bg-[#f5f5dc] text-gray-800 p-8 rounded-xl shadow-lg">
                <h3 className="text-xl font-semibold mb-3">Users Claimed Items</h3>
                <p className="text-5xl font-extrabold">{usersClaimedItems}</p>
                <Link to="/found-items">
                  <button className="mt-5 bg-white text-gray-800 px-5 py-2 rounded-lg hover:bg-gray-100 font-medium">
                    View
                  </button>
                </Link>
              </div>
            )}
            <div className="bg-red-500 text-white p-8 rounded-xl shadow-lg">
              <h3 className="text-xl font-semibold mb-3">Pending Claims</h3>
              <p className="text-5xl font-extrabold">{pendingClaims}</p>
              <Link to="/found-items">
                <button className="mt-5 bg-white text-red-500 px-5 py-2 rounded-lg hover:bg-gray-100 font-medium">
                  View
                </button>
              </Link>
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Displaying Most Recent Lost Items</h2>
              <input
                type="text"
                placeholder="Search table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-1/3 p-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              />
            </div>
            {filteredItems.length === 0 ? (
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
                        <td className="p-4">
                          <Link to={`/lost-items/${item.lostId}`} className="text-green-700 hover:underline font-semibold">
                            {item.itemName}
                          </Link>
                        </td>
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