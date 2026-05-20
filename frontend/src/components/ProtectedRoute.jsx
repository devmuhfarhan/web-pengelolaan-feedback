import { Navigate } from 'react-router-dom';
import useAuthStore from '@/store/authStore';
import { Loading } from '@/components/ui/Loading';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <Loading text="Verifying Access..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <h1 className="text-4xl font-bold text-destructive">403</h1>
        <h2 className="text-2xl font-semibold">Access Denied</h2>
        <p className="text-muted-foreground max-w-md">
          You do not have permission to view this page. If you believe this is an error, please contact your administrator.
        </p>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
