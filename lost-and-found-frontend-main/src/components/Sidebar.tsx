import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

interface SidebarProps {
  activePage: string;
}

export const Sidebar = ({ activePage }: SidebarProps) => {
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/lost-items', label: 'View Lost Items' },
    { to: '/found-items', label: 'View Found Items' },
    { to: '/report-missing', label: 'Report Missing Items' },
    { to: '/report-found', label: 'Report Found Items' },
    { to: '/faqs', label: 'FAQs' },
    { to: '/account', label: 'Account' },
    { to: '/notifications', label: 'Notifications' },
  ];

  const adminNavItems = [
    { to: '/manage-claims', label: 'Manage Claims' },
    { to: '/view-users', label: 'View Users' },
  ];

  return (
    <div className="w-64 bg-gray-200 p-6">
      <div className="mb-10">
        <h3 className="text-xl font-bold text-gray-800">{user?.username || 'Guest'}</h3>
        <p className="text-sm text-gray-600">{user?.role || 'N/A'} | Level 1</p>
      </div>
      <nav className="space-y-3">
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`block py-3 px-4 rounded-lg font-medium ${
              activePage === item.to
                ? 'bg-gray-300 text-gray-800 font-semibold'
                : 'hover:bg-gray-300 text-gray-700'
            }`}
          >
            {item.label}
          </Link>
        ))}
        {user?.role === 'ADMIN' &&
          adminNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`block py-3 px-4 rounded-lg font-medium ${
                activePage === item.to
                  ? 'bg-gray-300 text-gray-800 font-semibold'
                  : 'hover:bg-gray-300 text-gray-700'
              }`}
            >
              {item.label}
            </Link>
          ))}
        <button
          onClick={logout}
          className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left"
        >
          Logout
        </button>
      </nav>
    </div>
  );
};