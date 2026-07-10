import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Programs from "@/pages/Programs";
import Feedbacks from "@/pages/Feedbacks";
import Beneficiaries from "@/pages/Beneficiaries";
import Documentation from "@/pages/Documentation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LoadingScreen } from "@/components/ui/Loading";
import Users from "@/pages/Users";
import ActivityLogs from "@/pages/ActivityLogs";
import FeedbackCategories from "@/pages/FeedbackCategories";

function App() {
  const { fetchUser, isLoading } = useAuthStore();

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard is accessible to everyone */}
          <Route index element={<Dashboard />} />

          <Route
            path="programs"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "MANAGER",
                  "STAFF_OPERATIONAL",
                  "STAFF_LAPANGAN",
                ]}
              >
                <Programs />
              </ProtectedRoute>
            }
          />

          <Route
            path="feedbacks"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "MANAGER",
                  "STAFF_OPERATIONAL",
                  "STAFF_LAPANGAN",
                  "PENERIMA_MANFAAT",
                ]}
              >
                <Feedbacks />
              </ProtectedRoute>
            }
          />

          <Route
            path="beneficiaries"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "STAFF_LAPANGAN",
                  "ADMIN",
                ]}
              >
                <Beneficiaries />
              </ProtectedRoute>
            }
          />

          <Route
            path="users"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="activity-logs"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ActivityLogs />
              </ProtectedRoute>
            }
          />

          <Route
            path="feedback-categories"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <FeedbackCategories />
              </ProtectedRoute>
            }
          />

          <Route
            path="documentation"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "STAFF_LAPANGAN",
                ]}
              >
                <Documentation />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
