import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { LogIn, User, Lock, Check } from "lucide-react";
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

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans relative">
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-[420px] shadow-sm border-0 sm:border sm:border-slate-200 dark:sm:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="text-center pt-8 pb-6 space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight text-primary">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">
              Log in to the Stewardship Portal to continue monitoring impact.
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
                  <a
                    href="#"
                    className="text-[10px] font-semibold text-primary hover:underline"
                  >
                    Forgot Password?
                  </a>
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
                <label htmlFor="remember" className="text-[11px] font-medium text-slate-500 leading-none cursor-pointer">
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
    </div>
  );
};

export default Login;
