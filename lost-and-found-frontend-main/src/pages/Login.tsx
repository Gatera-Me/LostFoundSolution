// src/pages/Login.tsx
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useState } from 'react';

export const Login = () => {
    const navigate = useNavigate();
    const { login, verifyOtp } = useAuth();
    const [isOtpStep, setIsOtpStep] = useState(false);
    const [tempToken, setTempToken] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: { email: '', password: '', otp: '' },
        validationSchema: Yup.object().shape(
            isOtpStep
                ? {
                      otp: Yup.string()
                          .length(6, 'OTP must be 6 digits')
                          .matches(/^\d{6}$/, 'OTP must be numeric')
                          .required('Required'),
                  }
                : {
                      email: Yup.string().email('Invalid email').required('Required'),
                      password: Yup.string().required('Required'),
                  }
        ),
        onSubmit: async (values, { setSubmitting, setErrors }) => {
            try {
                if (!isOtpStep) {
                    // Step 1: Email/Password
                    const tempToken = await login(values.email, values.password);
                    console.log('Received tempToken from /auth/login:', tempToken);
                    setTempToken(tempToken);
                    setIsOtpStep(true);
                } else {
                    // Step 2: OTP
                    if (!tempToken) throw new Error('No temp token available');
                    console.log('Sending to /auth/verify-otp - tempToken:', tempToken, 'OTP:', values.otp);
                    await verifyOtp(tempToken, values.otp);
                    navigate('/');
                }
            } catch (error: any) {
                console.error('Login failed:', error);
                if (!isOtpStep) {
                    setErrors({ email: error.message || 'Invalid email or password' });
                } else {
                    setErrors({ otp: error.message || 'Invalid or expired OTP' });
                }
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-10 rounded-xl shadow-2xl max-w-md w-full border-t-4 border-green-600">
                <h2 className="text-4xl font-extrabold text-center text-green-600 mb-3">ReClaimIt</h2>
                <p className="text-center text-gray-500 mb-8 text-lg">
                    {isOtpStep ? 'Enter the OTP sent to your email' : 'Sign in to your account'}
                </p>
                {isOtpStep && (
                    <p className="text-center text-sm text-gray-600 mb-4">
                        Check your email for the OTP (e.g., "Your OTP is: 123456"). Also logged in backend console.
                    </p>
                )}
                <form onSubmit={formik.handleSubmit}>
                    {!isOtpStep ? (
                        <>
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                                <input
                                    name="email"
                                    type="email"
                                    onChange={formik.handleChange}
                                    value={formik.values.email}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                    placeholder="Enter your email"
                                    disabled={isOtpStep}
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
                                    disabled={isOtpStep}
                                />
                                {formik.errors.password && formik.touched.password && (
                                    <p className="text-red-500 text-xs mt-2">{formik.errors.password}</p>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">One-Time Password (OTP)</label>
                            <input
                                name="otp"
                                type="text"
                                onChange={formik.handleChange}
                                value={formik.values.otp}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 transition-colors"
                                placeholder="Enter 6-digit OTP"
                                maxLength={6}
                            />
                            {formik.errors.otp && formik.touched.otp && (
                                <p className="text-red-500 text-xs mt-2">{formik.errors.otp}</p>
                            )}
                        </div>
                    )}
                    <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className={`w-full py-3 rounded-lg transition-colors font-semibold ${
                            formik.isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                    >
                        {formik.isSubmitting ? (isOtpStep ? 'Verifying...' : 'Logging in...') : (isOtpStep ? 'Verify OTP' : 'Login')}
                    </button>
                </form>
                {!isOtpStep && (
                    <>
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Don’t have an account?{' '}
                            <Link to="/signup" className="text-green-600 hover:underline font-medium">
                                Sign Up
                            </Link>
                        </p>
                        <p className="mt-2 text-center text-sm text-gray-600">
                            <Link to="/forgot-password" className="text-green-600 hover:underline font-medium">
                                Forgot Password?
                            </Link>
                        </p>
                    </>
                )}
            </div>
        </div>
    );
};