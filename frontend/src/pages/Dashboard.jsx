import { useEffect, useState } from 'react';
import useAuthStore from '@/store/authStore';
import api from '@/lib/axios';
import { Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell } from "recharts"
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Loading } from '@/components/ui/Loading';

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

  const chartConfig = {
    feedbacks: {
      label: "Feedbacks",
      color: "hsl(var(--primary))",
    },
  }

  const pieChartConfig = {
    value: {
      label: "Count",
    },
    Pending: {
      label: "Pending",
      color: "var(--chart-5)", 
    },
    Reviewed: {
      label: "Reviewed",
      color: "var(--chart-1)", 
    },
    Resolved: {
      label: "Resolved",
      color: "var(--chart-2)", 
    },
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Dashboard</h1>
        <p className="text-slate-500 text-lg">Welcome back, <span className="font-semibold text-primary">{user?.first_name || user?.username}</span>. Here's what's happening today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Programs</CardTitle>
            <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded-full">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total_programs}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Total Feedbacks</CardTitle>
            <div className="bg-emerald-100 dark:bg-emerald-900/40 p-2 rounded-full">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total_feedbacks}</div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">Avg Rating</CardTitle>
            <div className="bg-amber-100 dark:bg-amber-900/40 p-2 rounded-full">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{Number(stats.average_rating).toFixed(1)} <span className="text-lg text-slate-400 font-medium">/ 5.0</span></div>
          </CardContent>
        </Card>

        {(user.role === 'PENERIMA_MANFAAT' || user.role === 'STAFF_LAPANGAN') && (
          <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-semibold text-slate-600 dark:text-slate-400">My Feedbacks</CardTitle>
              <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded-full">
                <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.my_feedbacks_count || 0}</div>
            </CardContent>
          </Card>
        )}
      </div>

      {user.role !== 'PENERIMA_MANFAAT' && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Feedback Trends</CardTitle>
              <CardDescription>Number of feedbacks received in the last 6 months</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <ChartContainer config={chartConfig} className="min-h-[220px] w-full">
                <BarChart accessibilityLayer data={barData}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="feedbacks" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
            <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Status Distribution</CardTitle>
              <CardDescription>Current status of all feedbacks</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center pt-6">
              <ChartContainer config={pieChartConfig} className="min-h-[220px] w-full max-w-[300px]">
                <PieChart>
                  <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    paddingAngle={3}
                    stroke="none"
                  >
                    {pieData.map((entry, index) => {
                      const colorName = entry.name === 'Pending' ? 'var(--color-Pending)' : entry.name === 'Reviewed' ? 'var(--color-Reviewed)' : 'var(--color-Resolved)';
                      return <Cell key={`cell-${index}`} fill={colorName} />
                    })}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-lg text-slate-800 dark:text-slate-100">Recent Feedbacks</CardTitle>
          <CardDescription>The latest feedback submissions</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-100/50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 font-semibold tracking-wider">Content</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Rating</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Status</th>
                  <th className="px-6 py-4 font-semibold tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {stats.recent_feedbacks.map((fb) => (
                  <tr key={fb.id} className="hover:bg-blue-50/30 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium max-w-md truncate text-slate-700 dark:text-slate-300">{fb.content}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg key={i} className={`w-4 h-4 ${i < fb.rating ? 'fill-current' : 'text-slate-300 dark:text-slate-700 fill-current'}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        fb.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                        fb.status === 'REVIEWED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                        'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      }`}>
                        {fb.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">{new Date(fb.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
                {stats.recent_feedbacks.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500 bg-slate-50/50 dark:bg-slate-900/20">
                      No recent feedbacks found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
