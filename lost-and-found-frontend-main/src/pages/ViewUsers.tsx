import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useNotifications } from '../context/NotificationContext.tsx';
import { useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  userId: number;
  username: string;
  email: string;
  role: string;
}

export const ViewUsers = () => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, addNotification } = useNotifications();
  const [users, setUsers] = useState<User[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [updateFormData, setUpdateFormData] = useState({ username: '', email: '', role: 'USER' });
  const [searchQuery, setSearchQuery] = useState(''); // Add search state
  const [filteredItems, setFilteredItems] = useState<User[]>([]); // Add filtered state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('Fetching users with token:', token);
        const response = await axios.get('http://localhost:8080/users', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mappedUsers = response.data.map((u: any) => ({
          userId: u.userId,
          username: u.username,
          email: u.email,
          role: u.role,
        }));
        setUsers(mappedUsers);
        setFilteredItems(mappedUsers); // Initialize filtered items
        setError(null);
      } catch (error: any) {
        console.error('Failed to fetch users:', error);
        setError('Unable to load users. Please try again later.');
      }
    };
    if (user?.role === 'ADMIN') {
      fetchUsers();
    }
  }, [user]);

  // Filter items based on search query
  useEffect(() => {
    const filtered = users.filter((item) =>
      Object.values(item)
        .map((value) => value.toString()) // Convert all values to string
        .some((value) =>
          value.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
    setFilteredItems(filtered);
    setCurrentPage(1); // Reset to first page on search
  }, [searchQuery, users]);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (user.role !== 'ADMIN') {
    return <Navigate to="/" />;
  }

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:8080/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'User-Id': user.userId,
          },
        });
        setUsers(users.filter((u) => u.userId !== userId));
        setFilteredItems(filteredItems.filter((u) => u.userId !== userId)); // Update filtered items
        addNotification(`User with ID ${userId} deleted successfully`);
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        alert(`Failed to delete user: ${error.response?.data?.error || 'Please try again.'}`);
      }
    }
  };

  const openUpdateModal = (user: User) => {
    console.log('Opening update modal for user:', user);
    setSelectedUser(user);
    setUpdateFormData({ username: user.username, email: user.email, role: user.role });
    setIsUpdateModalOpen(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Handling update for selectedUser:', selectedUser);
    if (!selectedUser || !selectedUser.userId) {
      console.error('No selected user or invalid user ID');
      alert('Error: No user selected for update.');
      return;
    }

    try {
      console.log('Sending PUT /users/' + selectedUser.userId + ' with data:', updateFormData);
      const response = await axios.put(
        `http://localhost:8080/users/${selectedUser.userId}`,
        updateFormData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'User-Id': user.userId,
          },
        }
      );
      const updatedUsers = users.map((u) => (u.userId === selectedUser.userId ? { ...u, ...response.data } : u));
      setUsers(updatedUsers);
      setFilteredItems(updatedUsers); // Update filtered items
      setIsUpdateModalOpen(false);
      setSelectedUser(null);
      addNotification(`User ${updateFormData.username} updated successfully`);
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const errorMessage = error.response?.data?.error || 'Please try again.';
      alert(`Failed to update user: ${errorMessage}`);
    }
  };

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setUpdateFormData({ ...updateFormData, [e.target.name]: e.target.value });
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
          <Link to="/manage-claims" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Manage Claims</Link>
          <Link to="/view-users" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">View Users</Link>
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
              <h2 className="text-2xl font-bold text-gray-800">Manage Users</h2>
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
              <p className="text-gray-600">No matching users found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-green-600 text-white">
                      <th className="p-4 text-left font-semibold">ID</th>
                      <th className="p-4 text-left font-semibold">Username</th>
                      <th className="p-4 text-left font-semibold">Email</th>
                      <th className="p-4 text-left font-semibold">Role</th>
                      <th className="p-4 text-left font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((user) => (
                      <tr key={user.userId} className="border-b hover:bg-gray-50">
                        <td className="p-4">{user.userId}</td>
                        <td className="p-4">{user.username}</td>
                        <td className="p-4">{user.email}</td>
                        <td className="p-4">{user.role}</td>
                        <td className="p-4 flex space-x-2">
                          <button
                            onClick={() => openUpdateModal(user)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.userId)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                          >
                            Delete
                          </button>
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

      {/* Update User Modal */}
      {isUpdateModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Update User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={updateFormData.username}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={updateFormData.email}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <select
                  name="role"
                  value={updateFormData.role}
                  onChange={handleUpdateChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                >
                  <option value="USER">User</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdateModalOpen(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-300 text-gray-800 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};