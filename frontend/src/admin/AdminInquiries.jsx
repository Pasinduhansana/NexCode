import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiSearch, HiTrash, HiPencil, HiEye, HiX } from 'react-icons/hi';
import api from '../utils/api';

const STATUS_COLORS = {
  'new': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'in-review': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'contacted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'converted': 'bg-green-500/20 text-green-300 border-green-500/30',
  'closed': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
};

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchInquiries = async () => {
    try {
      const params = new URLSearchParams();
      if (filter) params.set('status', filter);
      if (search) params.set('search', search);
      const res = await api.get(`/inquiries?${params}`);
      setInquiries(res.data.data);
    } catch (err) {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, [filter, search]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/inquiries/${id}`, { status });
      toast.success('Status updated');
      fetchInquiries();
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this inquiry?')) return;
    try {
      await api.delete(`/inquiries/${id}`);
      toast.success('Deleted');
      setSelected(null);
      fetchInquiries();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Customer Inquiries</h1>
          <p className="text-gray-400 text-sm mt-1">{inquiries.length} total inquiries</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            className="w-full pl-9 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-500"
            placeholder="Search by name, email, company..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          value={filter}
          onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No inquiries found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Name</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Service</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inq, i) => (
                  <motion.tr
                    key={inq._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{inq.name}</div>
                      <div className="text-xs text-gray-400">{inq.email}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-300">{inq.service}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${STATUS_COLORS[inq.status]}`}>{inq.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(inq)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <HiEye size={14} />
                        </button>
                        <button onClick={() => handleDelete(inq._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <HiTrash size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={e => e.stopPropagation()}
            className="bg-gray-900 rounded-2xl border border-gray-700 p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between mb-5">
              <h2 className="font-display font-semibold text-white">Inquiry Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Name', selected.name], ['Email', selected.email],
                  ['Phone', selected.phone || '-'], ['Company', selected.company || '-'],
                  ['Service', selected.service], ['Budget', selected.budget],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">{k}</div>
                    <div className="text-sm text-white font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">Message</div>
                <div className="text-sm text-gray-200 leading-relaxed">{selected.message}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Update Status</div>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(STATUS_COLORS).map(s => (
                    <button key={s} onClick={() => handleUpdateStatus(selected._id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected.status === s ? STATUS_COLORS[s] : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
