import {
  Outlet,
  Navigate,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import useAuthStore from "@/store/authStore";
import {
  LayoutDashboard,
  LogOut,
  FileText,
  MessageSquare,
  Hexagon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Loading } from "@/components/ui/Loading";

const Layout = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  if (isLoading) return <Loading text="Loading Application..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      label: "Dashboard",
      path: "/",
      icon: LayoutDashboard,
      roles: [
        "MANAGER",
        "STAFF_LAPANGAN",
        "STAFF_OPERATIONAL",
        "PENERIMA_MANFAAT",
      ],
    },
    {
      label: "Programs",
      path: "/programs",
      icon: FileText,
      roles: ["MANAGER", "STAFF_OPERATIONAL", "STAFF_LAPANGAN"],
    },
    {
      label: "Feedbacks",
      path: "/feedbacks",
      icon: MessageSquare,
      roles: [
        "MANAGER",
        "STAFF_OPERATIONAL",
        "STAFF_LAPANGAN",
        "PENERIMA_MANFAAT",
      ],
    },
  ].filter((item) => item.roles.includes(user?.role));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
        <Sidebar
          variant="inset"
          className="border-r border-slate-200 dark:border-slate-800"
        >
          <SidebarHeader className="p-6">
            <div className="flex items-center gap-3">
              <div className="bg-primary/10 p-2 rounded-xl text-primary">
                <Hexagon className="w-6 h-6 fill-primary/20" />
              </div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                FeedbackSys
              </h2>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Main Menu
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="gap-2">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          className={`transition-all duration-200 py-3 ${isActive ? "bg-primary text-primary-foreground hover:bg-primary/90" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"}`}
                        >
                          <Link
                            to={item.path}
                            className="flex items-center gap-3 font-medium w-full h-full"
                          >
                            <item.icon
                              className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-slate-400 group-hover:text-primary"}`}
                            />
                            <span className="text-sm">{item.label}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-4">
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                {user?.username}
              </p>
              <p className="text-xs font-medium text-primary uppercase tracking-wide">
                {user?.role?.replace("_", " ")}
              </p>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className="cursor-pointer rounded-lg text-red-600 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 transition-colors py-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="font-semibold text-sm">Sign out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col overflow-hidden relative">
          <header className="flex h-16 items-center gap-4 px-6 lg:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-10">
            <SidebarTrigger className="text-slate-500 hover:text-primary transition-colors" />
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {menuItems.find((i) => i.path === location.pathname)?.label ||
                "FeedbackSys"}
            </h1>
          </header>

          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
