import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiTrash, HiEye, HiX } from 'react-icons/hi';
import api from '../utils/api';

const STATUS_COLORS = {
  'pending': 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  'under-review': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'quoted': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'approved': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'in-progress': 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  'completed': 'bg-green-500/20 text-green-300 border-green-500/30',
  'rejected': 'bg-red-500/20 text-red-300 border-red-500/30',
};

export default function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchProjects = async () => {
    try {
      const params = filter ? `?status=${filter}` : '';
      const res = await api.get(`/projects${params}`);
      setProjects(res.data.data);
    } catch { toast.error('Failed to load projects'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, [filter]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/projects/${id}`, { status });
      toast.success('Status updated');
      fetchProjects();
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this project request?')) return;
    try {
      await api.delete(`/projects/${id}`);
      toast.success('Deleted');
      setSelected(null);
      fetchProjects();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Project Requests</h1>
          <p className="text-gray-400 text-sm mt-1">{projects.length} total requests</p>
        </div>
        <select
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          value={filter} onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Status</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center text-gray-400">No project requests yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs text-gray-400">Client</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400">Project</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((proj, i) => (
                  <motion.tr
                    key={proj._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-white">{proj.clientName}</div>
                      <div className="text-xs text-gray-400">{proj.clientEmail}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 max-w-32 truncate">{proj.projectTitle}</td>
                    <td className="px-4 py-3 text-xs text-gray-400">{proj.projectType}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${STATUS_COLORS[proj.status]}`}>{proj.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelected(proj)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <HiEye size={14} />
                        </button>
                        <button onClick={() => handleDelete(proj._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
              <h2 className="font-display font-semibold text-white">Project Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['Title', selected.projectTitle], ['Type', selected.projectType],
                  ['Client', selected.clientName], ['Email', selected.clientEmail],
                  ['Timeline', selected.timeline || '-'], ['Budget', selected.budget || '-'],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">{k}</div>
                    <div className="text-sm text-white font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800 rounded-xl p-3">
                <div className="text-xs text-gray-400 mb-1">Description</div>
                <div className="text-sm text-gray-200 leading-relaxed">{selected.description}</div>
              </div>
              {selected.features?.length > 0 && (
                <div className="bg-gray-800 rounded-xl p-3">
                  <div className="text-xs text-gray-400 mb-2">Features</div>
                  <ul className="space-y-1">
                    {selected.features.map((f, i) => <li key={i} className="text-sm text-gray-200 flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-400" />{f}</li>)}
                  </ul>
                </div>
              )}
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
