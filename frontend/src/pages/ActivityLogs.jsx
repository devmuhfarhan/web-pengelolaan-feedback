import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Loader2, Activity, Search } from "lucide-react";

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/activity-logs/");
      setLogs(response.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const search = searchTerm.toLowerCase();
    return (
      (log.username && log.username.toLowerCase().includes(search)) ||
      (log.action && log.action.toLowerCase().includes(search)) ||
      (log.description && log.description.toLowerCase().includes(search))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Activity Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Track user activities, logins, and data modifications.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search logs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 focus:bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">Loading activity logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Activity className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">No logs found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
                      {log.username}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        log.action === 'DELETE' ? 'bg-rose-100 text-rose-700' :
                        log.action === 'CREATE' ? 'bg-emerald-100 text-emerald-700' :
                        log.action === 'LOGIN' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {log.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityLogs;
