import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/axios';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell, Line, LineChart } from "recharts"
import { Users, FileText, CheckCircle, Clock, AlertCircle, ArrowUpRight, TrendingUp, Info, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Loading } from '@/components/ui/Loading';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/programs/dashboard/');
        setStats(data);
      } catch (error) {
        console.error('Failed to load stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <Loading text="Loading Dashboard Stats..." />;
  if (!stats) return null;

  const barData = stats.monthly_trend?.length > 0 ? stats.monthly_trend : [];
  const pieData = stats.status_distribution?.length > 0 ? stats.status_distribution : [];
  
  const pendingCount = pieData.find(d => d.name === 'PENDING' || d.name === 'Pending')?.value || 0;
  
  const chartConfig = {
    feedbacks: {
      label: "Reports",
      color: "hsl(var(--primary))",
    },
  }

  // ---- ROLE: MANAGER ----
  if (user?.role === 'MANAGER') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Monitoring mission-critical feedback and program integrity.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="bg-emerald-100/50 dark:bg-emerald-900/20 p-2.5 rounded-xl">
                  <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <div className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +12% <ArrowUpRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-1">Total Reports</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total_feedbacks}</h3>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="bg-blue-100/50 dark:bg-blue-900/20 p-2.5 rounded-xl">
                  <Users className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">
                  Active
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-1">Active Programs</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total_programs}</h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="bg-purple-100/50 dark:bg-purple-900/20 p-2.5 rounded-xl">
                  <CheckCircle className="w-5 h-5 text-purple-600 dark:text-purple-500" />
                </div>
                <div className="flex items-center text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-full uppercase tracking-wider">
                  High
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-1">Feedback Score</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                  {Number(stats.average_rating).toFixed(1)}<span className="text-lg text-slate-400 font-medium">/5</span>
                </h3>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="bg-amber-100/50 dark:bg-amber-900/20 p-2.5 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                </div>
                <div className="flex items-center text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-full uppercase tracking-wider">
                  Pending
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500 mb-1">Pending Reviews</p>
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{pendingCount}</h3>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <CardTitle className="text-base text-slate-800 dark:text-slate-100">Recent Activity</CardTitle>
                <CardDescription className="text-xs">Latest feedback submitted to the portal</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-primary text-xs font-semibold">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm text-left">
                <thead className="text-[10px] text-slate-400 uppercase tracking-widest bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 font-semibold">Program</th>
                    <th className="px-6 py-3 font-semibold">Reporter</th>
                    <th className="px-6 py-3 font-semibold">Status</th>
                    <th className="px-6 py-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                  {stats.recent_feedbacks.slice(0, 5).map((fb) => (
                    <tr key={fb.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-3.5 font-medium max-w-[150px] truncate text-slate-700 dark:text-slate-300">{fb.program_detail?.title || 'Unknown'}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-500">
                            {fb.user_detail?.username?.substring(0, 2).toUpperCase() || 'U'}
                          </div>
                          <span className="text-slate-600 dark:text-slate-400 text-xs font-medium">{fb.user_detail?.username}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                          fb.status === 'RESOLVED' ? 'bg-emerald-100/50 text-emerald-700' :
                          fb.status === 'REVIEWED' ? 'bg-blue-100/50 text-blue-700' :
                          'bg-amber-100/50 text-amber-700'
                        }`}>
                          {fb.status}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400 text-xs text-right font-medium">{new Date(fb.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                  {stats.recent_feedbacks.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-8 text-center text-slate-400 text-xs">No recent activity found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800 flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-slate-800 dark:text-slate-100">Status Distribution</CardTitle>
              <CardDescription className="text-xs">Feedback volume by status</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-center">
              {pieData.map((item, index) => (
                <div key={index} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-xs mb-1 font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="text-slate-900 dark:text-slate-100">{item.value}</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${item.name === 'RESOLVED' ? 'bg-emerald-500' : item.name === 'REVIEWED' ? 'bg-blue-500' : 'bg-amber-400'}`} 
                      style={{ width: `${Math.max(5, (item.value / stats.total_feedbacks) * 100)}%` }} 
                    />
                  </div>
                </div>
              ))}
              
              <div className="mt-8 bg-slate-100 dark:bg-slate-800/50 p-4 rounded-xl flex items-start gap-3">
                <Info className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-500 leading-relaxed">
                  Status distribution indicates <span className="font-semibold text-slate-700 dark:text-slate-300">{pendingCount} pending</span> reports require attention.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ---- ROLE: STAFF_OPERATIONAL / STAFF_LAPANGAN ----
  if (user?.role === 'STAFF_OPERATIONAL' || user?.role === 'STAFF_LAPANGAN') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Operational Staff Dashboard</h1>
          <p className="text-slate-500 text-sm">Welcome back. Here's the latest operational data.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Laporan</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total_feedbacks}</h3>
              </div>
              <div className="bg-emerald-100/50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center">
                +12%
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Programs</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.total_programs}</h3>
              </div>
              <div className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Steady
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Alerts Pending</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{pendingCount}</h3>
              </div>
              <div className="bg-red-100/50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Action Req.
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardContent className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Integrity Score</p>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{Number((stats.average_rating / 5) * 100).toFixed(1)}%</h3>
              </div>
              <div className="bg-emerald-100/50 text-emerald-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Optimal
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="md:col-span-2 bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800 overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-base text-slate-800 dark:text-slate-100">Trend Pelaporan Berkala</CardTitle>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-2 py-1 rounded-md">Last 6 Months</span>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <LineChart data={barData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={10} tick={{ fontSize: 10, fill: 'var(--color-muted-foreground)' }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line type="monotone" dataKey="feedbacks" stroke="var(--color-primary)" strokeWidth={3} dot={{ r: 4, fill: "var(--color-primary)" }} activeDot={{ r: 6 }} />
                </LineChart>
              </ChartContainer>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base text-slate-800 dark:text-slate-100">View Laporan</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {stats.recent_feedbacks.slice(0, 4).map((fb) => (
                  <div key={fb.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <div className="min-w-0 pr-4">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{fb.program_detail?.title || 'Unknown Program'}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(fb.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide uppercase shrink-0 ${
                      fb.status === 'RESOLVED' ? 'bg-emerald-100/50 text-emerald-700' :
                      fb.status === 'REVIEWED' ? 'bg-blue-100/50 text-blue-700' :
                      'bg-amber-100/50 text-amber-700'
                    }`}>
                      {fb.status}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ---- ROLE: PENERIMA_MANFAAT ----
  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-4xl mx-auto mt-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Welcome to your Portal</h1>
        <p className="text-slate-500 text-sm">Track the status of your feedback and see your impact.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-primary/10 p-4 rounded-full mb-2">
              <MessageSquare className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.my_feedbacks_count || 0}</CardTitle>
            <CardDescription>Total Feedback Submitted</CardDescription>
          </CardHeader>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto bg-emerald-100/50 p-4 rounded-full mb-2">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-800 dark:text-slate-100">
              {stats.recent_feedbacks.filter(f => f.status === 'RESOLVED').length || 0}
            </CardTitle>
            <CardDescription>Resolved Issues</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="bg-white dark:bg-slate-900 shadow-sm border-0 ring-1 ring-slate-200 dark:ring-slate-800 mt-8">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Your Recent Feedback</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {stats.recent_feedbacks.map((fb) => (
              <div key={fb.id} className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{fb.program_detail?.title}</h3>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wide uppercase ${
                    fb.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700' :
                    fb.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {fb.status}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{fb.content}</p>
                <div className="text-xs text-slate-400 font-medium">{new Date(fb.created_at).toLocaleDateString()}</div>
              </div>
            ))}
            {stats.recent_feedbacks.length === 0 && (
              <div className="p-12 text-center text-slate-500 text-sm">
                You haven't submitted any feedback yet.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
