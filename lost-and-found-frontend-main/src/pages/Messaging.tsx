import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useState } from 'react';

export const Messaging = () => {
    const { user, logout } = useAuth();
    const [formData, setFormData] = useState({ subject: '', message: '' });

    if (!user) {
        return <Navigate to="/login" />;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Mock submission (replace with API call to POST /messages later)
        alert(`Message sent:\nSubject: ${formData.subject}\nMessage: ${formData.message}`);
        // In a real app, this would send data to the server and reset the form
        setFormData({ subject: '', message: '' });
    };

    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <div className="w-64 bg-gray-200 p-6">
                <div className="mb-10">
                    <h3 className="text-xl font-bold text-gray-800">{user.username}</h3>
                    <p className="text-sm text-gray-600">{user.role} | Level 1</p>
                </div>
                <nav className="space-y-3">
                    <Link to="/" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Dashboard</Link>
                    <Link to="/lost-items" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">View Lost Items</Link>
                    <Link to="/report-missing" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Report Missing Items</Link>
                    <Link to="/claim-confirmation" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Claim Confirmation</Link>
                    <Link to="/faqs" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">FAQs</Link>
                    <Link to="/messaging" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">Messaging</Link>
                    <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
                    <button onClick={logout} className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left">Logout</button>
                </nav>
            </div>
            {/* Main Content */}
            <div className="flex-1 bg-gray-100">
                {/* Header */}
                <header className="bg-green-600 text-white p-5 flex justify-between items-center shadow-md">
                    <h1 className="text-3xl font-extrabold">AUCA: Lost and Found</h1>
                    <button className="text-3xl focus:outline-none hover:text-gray-200">🔔</button>
                </header>
                <div className="p-10">
                    {/* Messaging Form */}
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                                <input
                                    type="text"
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    placeholder="Enter the subject"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
                                <textarea
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    placeholder="Type your message here"
                                    rows={6}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                            >
                                Send Message
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