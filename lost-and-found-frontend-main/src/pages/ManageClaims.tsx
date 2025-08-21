import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Sidebar } from '../components/Sidebar.tsx';

interface Claim {
  matchId: number;
  lostItem: { lostId: number; itemName: string } | null;
  foundItem: { foundId: number; itemName: string } | null;
  matchedBy: { userId: number; username: string } | null;
  matchDate: string;
  status: string;
}

export const ManageClaims = () => {
  const { user } = useAuth();
  const { notifications, clearNotifications, addNotification } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchClaims = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching claims with token:', token);
        const response = await axios.get('http://localhost:8080/matches', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const rawData = response.data;
        console.log('Fetched raw claims data:', JSON.stringify(rawData, null, 2)); // Detailed logging
        // Map and handle potential nulls or unexpected structures
        const mappedClaims = rawData.map((item: any) => ({
          matchId: item.matchId,
          lostItem: item.lostItem ? { lostId: item.lostItem.lostId, itemName: item.lostItem.itemName || 'N/A' } : null,
          foundItem: item.foundItem ? { foundId: item.foundItem.foundId, itemName: item.foundItem.itemName || 'N/A' } : null,
          matchedBy: item.matchedBy ? { userId: item.matchedBy.userId, username: item.matchedBy.username || 'N/A' } : null,
          matchDate: item.matchDate,
          status: item.status || 'UNKNOWN',
        }));
        console.log('Mapped claims:', JSON.stringify(mappedClaims, null, 2)); // Log mapped data
        setClaims(mappedClaims);
        setFilteredClaims(mappedClaims);
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch claims:', error);
        setError(
          error.response?.data?.message ||
          'Unable to load claims. Please check if the backend server is running or try again later.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (user?.role === 'ADMIN') {
      fetchClaims();
    }
  }, [user]);

  // Filter claims based on search query
  useEffect(() => {
    const filtered = claims.filter((claim) => {
      const lostItemName = claim.lostItem?.itemName ?? 'N/A';
      const foundItemName = claim.foundItem?.itemName ?? 'N/A';
      const matchedByUsername = claim.matchedBy?.username ?? 'N/A';
      const formattedDate = new Date(claim.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      return (
        claim.matchId.toString().includes(searchQuery) ||
        lostItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        foundItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        matchedByUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formattedDate.toLowerCase().includes(searchQuery.toLowerCase()) ||
        claim.status.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
    setFilteredClaims(filtered);
    setCurrentPage(1);
  }, [searchQuery, claims]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  const handleClaimAction = async (matchId: number, action: 'APPROVE' | 'REJECT') => {
    try {
      const token = localStorage.getItem('token');
      const status = action;
      console.log(`Sending PUT /matches/${matchId} with status: ${status}`);
      /*
      await axios.put(
        `http://localhost:8080/matches/${matchId}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      */
      setClaims((prev) =>
        prev.map((claim) =>
          claim.matchId === matchId ? { ...claim, status } : claim
        )
      );
      setFilteredClaims((prev) =>
        prev.map((claim) =>
          claim.matchId === matchId ? { ...claim, status } : claim
        )
      );
      addNotification(`Claim ${matchId} ${action.toLowerCase()}d successfully`);
    } catch (error: any) {
      console.error(`Failed to ${action.toLowerCase()} claim:`, error);
      const errorMessage = error.response?.data?.error || 'Please try again.';
      alert(`Failed to ${action.toLowerCase()} claim: ${errorMessage}`);
      setError(`Failed to ${action.toLowerCase()} claim: ${errorMessage}`);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage);
  const currentClaims = filteredClaims.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="flex min-h-screen">
      <Sidebar activePage="/manage-claims" />
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
              <h2 className="text-2xl font-bold text-gray-800">Manage Claims</h2>
              <input
                type="text"
                placeholder="Search table..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-1/3 p-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-600 transition-all"
              />
            </div>
            {isLoading ? (
              <p className="text-gray-600">Loading claims...</p>
            ) : error ? (
              <p className="text-red-600">{error}</p>
            ) : filteredClaims.length === 0 ? (
              <p>No matching claims found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="p-4 text-left font-semibold">Claim ID</th>
                      <th className="p-4 text-left font-semibold">Lost Item</th>
                      <th className="p-4 text-left font-semibold">Found Item</th>
                      <th className="p-4 text-left font-semibold">Claimed By</th>
                      <th className="p-4 text-left font-semibold">Date</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentClaims.map((claim) => (
                      <tr key={claim.matchId} className="border-b hover:bg-gray-50">
                        <td className="p-4">{claim.matchId}</td>
                        <td className="p-4">{claim.lostItem?.itemName ?? 'N/A'}</td>
                        <td className="p-4">{claim.foundItem?.itemName ?? 'N/A'}</td>
                        <td className="p-4">{claim.matchedBy?.username ?? 'N/A'}</td>
                        <td className="p-4">{new Date(claim.matchDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="p-4">{claim.status}</td>
                        <td className="p-4 flex space-x-2">
                          {claim.status === 'OPEN' && (
                            <>
                              <button
                                onClick={() => handleClaimAction(claim.matchId, 'APPROVE')}
                                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleClaimAction(claim.matchId, 'REJECT')}
                                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </td>
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