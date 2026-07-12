import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { LogIn, User, Lock, KeyRound, X, Eye, EyeOff, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import api from "@/lib/axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1 = input username, 2 = input new password
  const [forgotUsername, setForgotUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const { login, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login(username, password, rememberMe);
      navigate("/");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Step 1: validate username exists (just move to step 2, validation happens on submit)
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!forgotUsername.trim()) return;
    setForgotError("");
    setForgotStep(2);
  };

  // Step 2: submit new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError("");

    if (newPassword.length < 8) {
      setForgotError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError("Passwords do not match.");
      return;
    }

    setForgotLoading(true);
    try {
      await api.post("/users/forgot-password/", {
        username: forgotUsername,
        new_password: newPassword,
      });
      setForgotSuccess(true);
    } catch (err) {
      const msg =
        err.response?.data?.error || "Failed to reset password. Please try again.";
      setForgotError(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCloseForgotModal = () => {
    setShowForgotModal(false);
    setForgotStep(1);
    setForgotUsername("");
    setNewPassword("");
    setConfirmPassword("");
    setForgotError("");
    setForgotSuccess(false);
    setShowNewPass(false);
    setShowConfirmPass(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans relative">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-[420px] shadow-sm border-0 sm:border sm:border-slate-200 dark:sm:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="text-center pt-8 pb-6 space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Log in to the Puspadi Bali Portal to continue monitoring impact.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm font-medium border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              <div className="space-y-2 relative">
                <Label
                  htmlFor="username"
                  className="text-xs font-semibold text-slate-600 ml-1"
                >
                  Username / Email
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="name@organization.org"
                    className="h-10 pl-9 bg-slate-50/50 border-slate-200"
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <div className="flex items-center justify-between ml-1">
                  <Label
                    htmlFor="password"
                    className="text-xs font-semibold text-slate-600"
                  >
                    Password
                  </Label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="h-10 pl-9 bg-slate-50/50 border-slate-200"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 mt-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary cursor-pointer"
                />
                <label
                  htmlFor="remember"
                  className="text-[11px] font-medium text-slate-500 leading-none cursor-pointer"
                >
                  Remember my session for 30 days
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 mt-6 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Logging in..."
                ) : (
                  <>
                    Login <LogIn className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <p className="text-xs text-slate-500">
              New to the portal?{" "}
              <Link
                to="/register"
                className="font-semibold text-primary hover:underline"
              >
                Create Account
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            {/* Close button */}
            <button
              onClick={handleCloseForgotModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                <KeyRound className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Reset Password</h2>
              <div className="flex items-center gap-1.5 mt-2">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${forgotStep === 1 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                  1. Verify Account
                </span>
                <span className="text-slate-300 text-xs">→</span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${forgotStep === 2 ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                  2. New Password
                </span>
              </div>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100">
                {forgotError}
              </div>
            )}

            {/* Step 1 — Username */}
            {!forgotSuccess && forgotStep === 1 && (
              <form onSubmit={handleNextStep} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="forgot-username" className="text-xs font-semibold text-slate-600 ml-1">
                    Username / Email
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="forgot-username"
                      type="text"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value)}
                      required
                      placeholder="Enter your username or email"
                      className="h-10 pl-9 bg-slate-50/50 border-slate-200 text-sm"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full h-10 font-semibold">
                  Next →
                </Button>
              </form>
            )}

            {/* Step 2 — New Password */}
            {!forgotSuccess && forgotStep === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-xs text-slate-500 -mt-1">
                  Setting new password for:{" "}
                  <span className="font-semibold text-slate-700">{forgotUsername}</span>
                </p>

                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-xs font-semibold text-slate-600 ml-1">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="new-password"
                      type={showNewPass ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="Min. 8 characters"
                      className="h-10 pl-9 pr-9 bg-slate-50/50 border-slate-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirm-password" className="text-xs font-semibold text-slate-600 ml-1">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPass ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      placeholder="Re-enter new password"
                      className="h-10 pl-9 pr-9 bg-slate-50/50 border-slate-200 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-10 font-semibold"
                    onClick={() => { setForgotStep(1); setForgotError(""); }}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-10 font-semibold"
                    disabled={forgotLoading}
                  >
                    {forgotLoading ? "Saving..." : "Reset Password"}
                  </Button>
                </div>
              </form>
            )}

            {/* Success state */}
            {forgotSuccess && (
              <div className="space-y-4 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                  <Check className="w-7 h-7 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">Password Reset Successful!</p>
                  <p className="text-xs text-slate-500 mt-1">
                    You can now log in with your new password.
                  </p>
                </div>
                <Button className="w-full h-10 font-semibold" onClick={handleCloseForgotModal}>
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
