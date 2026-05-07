import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { HiMail, HiCode, HiPhone, HiTrendingUp, HiRefresh } from 'react-icons/hi';
import api from '../utils/api';

const StatCard = ({ icon: Icon, label, value, sub, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-2">{label}</p>
        <p className="text-3xl font-display font-bold text-white">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={20} className="text-white" />
      </div>
    </div>
  </motion.div>
);

const COLORS = ['#3699f3', '#06b6d4', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get('/admin/analytics');
      setData(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = data?.monthlyInquiries?.map(m => ({
    month: monthNames[m._id.month - 1],
    inquiries: m.count
  })) || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Overview of NexCode business metrics</p>
        </div>
        <button onClick={fetchAnalytics} className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-xl text-gray-300 hover:text-white text-sm transition-colors">
          <HiRefresh size={16} /> Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={HiMail} label="Total Inquiries" value={data?.totalInquiries || 0} sub={`${data?.newInquiries || 0} new`} color="bg-blue-600" delay={0} />
        <StatCard icon={HiCode} label="Project Requests" value={data?.totalProjects || 0} sub={`${data?.pendingProjects || 0} pending`} color="bg-purple-600" delay={0.1} />
        <StatCard icon={HiPhone} label="Contact Messages" value={data?.totalContacts || 0} sub={`${data?.unreadContacts || 0} unread`} color="bg-cyan-600" delay={0.2} />
        <StatCard icon={HiTrendingUp} label="Conversion Rate" value={`${data?.conversionRate || 0}%`} sub={`${data?.convertedInquiries || 0} converted`} color="bg-green-600" delay={0.3} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 bg-gray-900 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="font-display font-semibold text-white mb-6">Monthly Inquiries</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                <XAxis dataKey="month" stroke="#6b7280" tick={{ fontSize: 12 }} />
                <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '12px', color: '#fff' }} />
                <Bar dataKey="inquiries" fill="url(#blueGrad)" radius={[6, 6, 0, 0]} />
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3699f3" />
                    <stop offset="100%" stopColor="#1a7de8" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </motion.div>

        {/* Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gray-900 rounded-2xl p-6 border border-gray-800"
        >
          <h2 className="font-display font-semibold text-white mb-6">Services Breakdown</h2>
          {data?.serviceBreakdown?.length > 0 ? (
            <>
              <PieChart width={200} height={180} style={{ margin: 'auto' }}>
                <Pie data={data.serviceBreakdown} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {data.serviceBreakdown.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#fff', fontSize: 12 }} />
              </PieChart>
              <div className="space-y-2 mt-4">
                {data.serviceBreakdown.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-xs text-gray-400 truncate flex-1">{item._id || 'Other'}</span>
                    <span className="text-xs text-white font-medium">{item.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-500 text-sm">No data yet</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
