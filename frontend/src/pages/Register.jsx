import { useState } from "react";
import { useNavigate, Navigate, Link } from "react-router-dom";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { User, Mail, Lock, Check, ChevronDown, ArrowRight } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    role: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      await api.post("/users/register/", formData);
      navigate("/login");
    } catch (err) {
      if (err.response?.data?.email) {
        setError("Email is already taken or invalid.");
      } else {
        setError(
          "Registration failed. Please check your inputs and try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans relative">
      <div className="flex-1 flex flex-col items-center justify-center p-4 py-12 relative z-10">
        <Card className="w-full max-w-[460px] shadow-sm border-0 sm:border sm:border-slate-200 dark:sm:border-slate-800 bg-white dark:bg-slate-950">
          <CardHeader className="text-center pt-8 pb-4 space-y-1.5">
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white text-left">
              Create Account
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 text-left">
              Join our network of field agents and managers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-md text-sm font-medium border border-red-100 dark:border-red-800">
                  {error}
                </div>
              )}

              <div className="space-y-1.5 relative">
                <Label
                  htmlFor="fullName"
                  className="text-[10px] uppercase font-bold tracking-wider text-slate-500"
                >
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    placeholder="Enter your full name"
                    className="h-9 pl-9 bg-slate-50/50 border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <Label
                  htmlFor="email"
                  className="text-[10px] uppercase font-bold tracking-wider text-slate-500"
                >
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    placeholder="name@organization.org"
                    className="h-9 pl-9 bg-slate-50/50 border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5 relative">
                <Label
                  htmlFor="role"
                  className="text-[10px] uppercase font-bold tracking-wider text-slate-500"
                >
                  Organizational Role
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 z-10" />
                  <Select
                    value={formData.role}
                    onValueChange={(val) =>
                      setFormData({ ...formData, role: val })
                    }
                  >
                    <SelectTrigger className="h-9 pl-9 bg-slate-50/50 border-slate-200 text-sm">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MANAGER">Manager</SelectItem>
                      <SelectItem value="OPERATIONAL_STAFF">
                        Operational Staff
                      </SelectItem>
                      <SelectItem value="FIELD_STAFF">Field Staff</SelectItem>
                      <SelectItem value="BENEFICIARY">Beneficiary</SelectItem>
                      <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5 relative">
                  <Label
                    htmlFor="password"
                    className="text-[10px] uppercase font-bold tracking-wider text-slate-500"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      placeholder="••••••••"
                      className="h-9 pl-9 bg-slate-50/50 border-slate-200 text-sm"
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-1">
                    Min. 8 characters
                  </p>
                </div>
                <div className="space-y-1.5 relative">
                  <Label
                    htmlFor="confirmPassword"
                    className="text-[10px] uppercase font-bold tracking-wider text-slate-500"
                  >
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      required
                      placeholder="••••••••"
                      className="h-9 pl-9 bg-slate-50/50 border-slate-200 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-2 mt-4">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 text-primary focus:ring-primary mt-0.5 shrink-0 cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-[10px] font-medium text-slate-500 leading-tight cursor-pointer"
                >
                  I agree to the{" "}
                  <span className="text-primary font-bold">
                    Terms of Puspadi Bali
                  </span>{" "}
                  and{" "}
                  <span className="text-primary font-bold">
                    Data Privacy Policy
                  </span>
                  .
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 mt-6 font-semibold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    Create Account <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center pb-8 gap-6">
            <p className="text-xs text-slate-500 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-primary hover:underline"
              >
                Sign In
              </Link>
            </p>

            <div className="text-[9px] text-slate-400 flex flex-col items-center gap-1">
              <p>
                &copy; {new Date().getFullYear()} Puspadi Bali. All Rights
                Reserved.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-slate-600">
                  Help Center
                </a>
                <a href="#" className="hover:text-slate-600">
                  System Status
                </a>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Light green background overlay for the whole page behind the card */}
      <div className="fixed inset-0 bg-emerald-50/50 z-0"></div>
    </div>
  );
};

export default Register;
