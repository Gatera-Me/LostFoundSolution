import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface FoundItem {
  foundId: number;
  itemName: string | null; // Allow null since backend might return null
  foundLocation: string | null;
  foundDate: string;
  status: string | null;
}

export const ViewFoundItems = () => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useNotifications();
  const [foundItems, setFoundItems] = useState<FoundItem[]>([]);
  const [claimedFoundIds, setClaimedFoundIds] = useState<number[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredItems, setFilteredItems] = useState<FoundItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        const response = await axios.get('http://localhost:8080/found-items');
        console.log('Fetched found items:', response.data);
        setFoundItems(response.data);
        setFilteredItems(response.data);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch found items:', error);
        setError('Unable to load found items. Please try again later or contact support.');
      }
    };

    const fetchUserClaims = async () => {
      if (user) {
        try {
          const response = await axios.get(`http://localhost:8080/matches/user/${user.userId}/claims`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          });
          console.log('Fetched user claims (foundIds):', response.data);
          setClaimedFoundIds(response.data);
        } catch (error) {
          console.error('Failed to fetch user claims:', error);
        }
      }
    };

    fetchFoundItems();
    fetchUserClaims();
  }, [user]);

  // Filter items based on search query with null checks
  useEffect(() => {
    const filtered = foundItems.filter((item) => {
      const rawStatus = item.status ?? 'NOT_AVAILABLE';
      const status = rawStatus.toUpperCase();
      const canClaim = ['OPEN', 'AVAILABLE'].includes(status) && !claimedFoundIds.includes(item.foundId);
      const actionText = canClaim ? 'Claim' : (status === 'AVAILABLE' || status === 'OPEN' ? 'Already Claimed' : 'Not Available');
      const formattedDate = new Date(item.foundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      // Use fallback values for null/undefined properties
      const itemName = item.itemName ?? '';
      const foundLocation = item.foundLocation ?? '';
      const searchLower = searchQuery.toLowerCase();

      return (
        itemName.toLowerCase().includes(searchLower) ||
        foundLocation.toLowerCase().includes(searchLower) ||
        formattedDate.toLowerCase().includes(searchLower) ||
        rawStatus.toLowerCase().includes(searchLower) ||
        actionText.toLowerCase().includes(searchLower)
      );
    });
    setFilteredItems(filtered);
    setCurrentPage(1);
  }, [searchQuery, foundItems, claimedFoundIds]);

  const handleClaim = (foundId: number, itemName: string | null) => {
    if (!user) {
      navigate('/login', { state: { from: `/claim-confirmation/${foundId}` } });
    } else {
      if (window.confirm(`Are you sure you want to claim "${itemName ?? 'this item'}"?`)) {
        navigate(`/claim-confirmation/${foundId}`);
      }
    }
  };

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
          <h3 className="text-xl font-bold text-gray-800">{user ? user.username : 'Guest'}</h3>
          <p className="text-sm text-gray-600">{user ? user.role : 'N/A'} | Level 1</p>
        </div>
        <nav className="space-y-3">
          <Link to="/" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Dashboard</Link>
          <Link to="/lost-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Lost Items</Link>
          <Link to="/found-items" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">View Found Items</Link>
          <Link to="/report-missing" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Missing Items</Link>
          <Link to="/report-found" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Found Items</Link>
          <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
          <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
          <Link to="/notifications" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Notifications</Link>
          {user ? (
            <button onClick={logout} className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left">Logout</button>
          ) : (
            <Link to="/login" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Login</Link>
          )}
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
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Found Items</h2>
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
              <p className="text-gray-600">No matching found items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="p-4 text-left font-semibold">Item Name</th>
                      <th className="p-4 text-left font-semibold">Location</th>
                      <th className="p-4 text-left font-semibold">Date Found</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((item) => {
                      const rawStatus = item.status ?? 'NOT_AVAILABLE';
                      const status = rawStatus.toUpperCase();
                      const canClaim = ['OPEN', 'AVAILABLE'].includes(status) && !claimedFoundIds.includes(item.foundId);
                      console.log(`Item ${item.foundId}: RawStatus=${rawStatus}, NormalizedStatus=${status}, Claimed=${claimedFoundIds.includes(item.foundId)}, CanClaim=${canClaim}`);
                      return (
                        <tr key={item.foundId} className="border-b hover:bg-gray-50">
                          <td className="p-4">{item.itemName ?? 'N/A'}</td>
                          <td className="p-4">{item.foundLocation ?? 'N/A'}</td>
                          <td className="p-4">{new Date(item.foundDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="p-4">{rawStatus}</td>
                          <td className="p-4">
                            {canClaim ? (
                              <button
                                onClick={() => handleClaim(item.foundId, item.itemName)}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                              >
                                Claim
                              </button>
                            ) : (
                              <span className="text-gray-500">
                                {status === 'AVAILABLE' || status === 'OPEN' ? 'Already Claimed' : 'Not Available'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
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