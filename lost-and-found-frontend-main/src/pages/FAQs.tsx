import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useState } from 'react';

export const FAQs = () => {
    const { user, logout } = useAuth();
    const [openFAQ, setOpenFAQ] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I report a missing item?",
            answer: "To report a missing item, navigate to the 'Report Missing Items' page from the sidebar. Fill in the item name, description, and location, then submit the form. You'll receive a confirmation once submitted."
        },
        {
            question: "How can I claim a lost item?",
            answer: "Go to the 'View Lost Items' page to see available items. If you find your item, click the 'Claim' button, then fill out the claim form on the 'Claim Confirmation' page with your name and contact information."
        },
        {
            question: "What happens after I submit a claim?",
            answer: "After submitting a claim, an admin will review your request. You'll be notified via the app or your provided contact information about the status of your claim."
        },
        {
            question: "Can I report a found item?",
            answer: "Currently, users can only report missing items. If you found an item, please contact an admin through the 'Messaging' feature to report it."
        },
        {
            question: "How do I contact support?",
            answer: "You can reach out to support via the 'Messaging' feature in the app. Alternatively, check the 'Account' page for contact details of the Lost and Found team."
        }
    ];

    if (!user) {
        return <Navigate to="/login" />;
    }

    const toggleFAQ = (index: number) => {
        setOpenFAQ(openFAQ === index ? null : index);
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
                    <Link to="/faqs" className="block py-3 px-4 rounded-lg bg-gray-300 text-gray-800 font-semibold">FAQs</Link>
                    <Link to="/account" className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium">Account</Link>
                    <button onClick={logout} className="block py-3 px-4 rounded-lg hover:bg-gray-300 text-gray-700 font-medium w-full text-left">Logout</button>
                </nav>
            </div>
            {/* Main Content */}
            <div className="flex-1 bg-gray-100">
                {/* Header */}
                <header className="bg-green-600 text-white p-5 flex justify-between items-center shadow-md">
                    <h1 className="text-3xl font-extrabold">ReClaimIt</h1>
                    <button className="text-3xl focus:outline-none hover:text-gray-200">🔔</button>
                </header>
                <div className="p-10">
                    {/* FAQs Section */}
                    <div className="bg-white p-8 rounded-xl shadow-lg">
                        <h2 className="text-2xl font-bold mb-6 text-gray-800">Frequently Asked Questions</h2>
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <div key={index} className="border-b border-gray-200">
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full text-left py-4 flex justify-between items-center focus:outline-none"
                                    >
                                        <span className="text-lg font-semibold text-gray-700">{faq.question}</span>
                                        <span className="text-green-600 text-xl">
                                            {openFAQ === index ? '−' : '+'}
                                        </span>
                                    </button>
                                    {openFAQ === index && (
                                        <div className="pb-4 text-gray-600">
                                            {faq.answer}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <p className="mt-6 text-sm text-gray-600">
                            <Link to="/" className="text-green-600 hover:underline font-medium">
                                Return to Dashboard
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};