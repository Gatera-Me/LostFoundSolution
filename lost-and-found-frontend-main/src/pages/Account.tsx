import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useState } from 'react';

export const Account = () => {
  const { user, logout, updateUser } = useAuth();
  const [formData, setFormData] = useState({ username: user?.username || '', role: user?.role || '' });

  if (!user) {
    return <Navigate to="/login" />;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser = {
      userId: user.userId,
      username: formData.username,
      role: formData.role,
    };
    updateUser(updatedUser);
    alert(`Profile updated: Username set to ${formData.username}`);
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-64 bg-gray-200 p-6">
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
          <p className="text-sm text-gray-600">{user.role} </p>
        </div>
        <nav className="space-y-3">
          <Link to="/" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Dashboard</Link>
          <Link to="/lost-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Lost Items</Link>
          <Link to="/found-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Found Items</Link>
          <Link to="/report-missing" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Missing Items</Link>
          <Link to="/report-found" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Found Items</Link>
          <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
          <Link to="/account" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">Account</Link>
          <Link to="/notifications" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Notifications</Link>
          {user.role === 'ADMIN' && (
            <Link to="/manage-claims" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Manage Claims</Link>
          )}
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
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Account Settings</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                <input
                  type="text"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                  placeholder="Enter your role"
                  required
                  disabled
                />
              </div>
              <button
                type="submit"
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Update Profile
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