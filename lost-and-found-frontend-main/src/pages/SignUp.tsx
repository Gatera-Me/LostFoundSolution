import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export const SignUp = () => {
    const navigate = useNavigate();
    const { signup } = useAuth();

    const formik = useFormik({
        initialValues: {
            username: '',
            email: '',
            password: '',
            role: 'USER',
        },
        validationSchema: Yup.object({
            username: Yup.string().required('Required'),
            email: Yup.string().email('Invalid email').required('Required'),
            password: Yup.string().min(6, 'Must be at least 6 characters').required('Required'),
            role: Yup.string().oneOf(['USER', 'ADMIN'], 'Invalid role').required('Required'),
        }),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                await signup(values.username, values.email, values.password, values.role);
                navigate('/');
            } catch (error: any) {
                console.error('Signup failed:', error);
                setErrors({
                    email: error.message || 'Failed to create account',
                });
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-green-600">
                <h2 className="text-4xl font-extrabold text-center text-green-600 mb-3">AUCA: Lost and Found</h2>
                <p className="text-center text-gray-500 mb-8 text-lg">Create your account</p>
                <form onSubmit={formik.handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Username</label>
                        <input
                            name="username"
                            type="text"
                            onChange={formik.handleChange}
                            value={formik.values.username}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                            placeholder="Enter your username"
                        />
                        {formik.errors.username && formik.touched.username && (
                            <p className="text-red-500 text-xs mt-2">{formik.errors.username}</p>
                        )}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                        <input
                            name="email"
                            type="email"
                            onChange={formik.handleChange}
                            value={formik.values.email}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                            placeholder="Enter your email"
                        />
                        {formik.errors.email && formik.touched.email && (
                            <p className="text-red-500 text-xs mt-2">{formik.errors.email}</p>
                        )}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Password</label>
                        <input
                            name="password"
                            type="password"
                            onChange={formik.handleChange}
                            value={formik.values.password}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                            placeholder="Enter your password"
                        />
                        {formik.errors.password && formik.touched.password && (
                            <p className="text-red-500 text-xs mt-2">{formik.errors.password}</p>
                        )}
                    </div>
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                        <select
                            name="role"
                            onChange={formik.handleChange}
                            value={formik.values.role}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                        >
                            <option value="USER">User</option>
                            {/* <option value="ADMIN">Admin</option> */}
                        </select>
                        {formik.errors.role && formik.touched.role && (
                            <p className="text-red-500 text-xs mt-2">{formik.errors.role}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className={`w-full py-3 rounded-lg transition-colors font-semibold ${
                            formik.isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {formik.isSubmitting ? 'Signing up...' : 'Sign Up'}
                    </button>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 hover:underline font-medium">
                        Log In
                    </Link>
                </p>
            </div>
        </div>
    );
};