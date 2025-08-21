import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login.tsx';
import { SignUp } from './pages/SignUp.tsx';
import { Dashboard } from './pages/Dashboard.tsx';
import { ViewLostItems } from './pages/ViewLostItems.tsx';
import { ViewFoundItems } from './pages/ViewFoundItems.tsx';
import { ClaimConfirmation } from './pages/ClaimConfirmation.tsx';
import { ReportMissing } from './pages/ReportMissing.tsx';
import { ReportFound } from './pages/ReportFound.tsx';
import { FAQs } from './pages/FAQs.tsx';
import { Messaging } from './pages/Messaging.tsx';
import { Account } from './pages/Account.tsx';
import { Notifications } from './pages/Notifications.tsx';
import { ManageClaims } from './pages/ManageClaims.tsx';
import { ViewUsers } from './pages/ViewUsers.tsx';
import { ForgotPassword } from './pages/ForgotPassword.tsx';
import { ResetPassword } from './pages/ResetPassword.tsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { NotificationProvider } from './context/NotificationContext.tsx';


interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const App = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/lost-items" element={<ViewLostItems />} />
            <Route path="/found-items" element={<ViewFoundItems />} />
            <Route path="/claim-confirmation/:id" element={<ClaimConfirmation />} />
            <Route path="/report-missing" element={<ReportMissing />} />
            <Route path="/report-found" element={<ReportFound />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/messaging" element={<Messaging />} />
            <Route path="/account" element={<Account />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route
              path="/manage-claims"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  
                    <ManageClaims />
                  
                </ProtectedRoute>
              }
            />
            <Route
              path="/view-users"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <ViewUsers />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;