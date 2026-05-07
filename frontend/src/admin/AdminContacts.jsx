import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiTrash, HiEye, HiX, HiMail } from 'react-icons/hi';
import api from '../utils/api';

const STATUS_COLORS = {
  'unread': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'read': 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  'replied': 'bg-green-500/20 text-green-300 border-green-500/30',
};

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter, setFilter] = useState('');

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      setContacts(res.data.data);
    } catch { toast.error('Failed to load messages'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchContacts(); }, []);

  const filtered = filter ? contacts.filter(c => c.status === filter) : contacts;

  const handleView = async (contact) => {
    setSelected(contact);
    if (contact.status === 'unread') {
      try {
        await api.patch(`/contacts/${contact._id}`, { status: 'read' });
        setContacts(prev => prev.map(c => c._id === contact._id ? { ...c, status: 'read' } : c));
      } catch {}
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await api.patch(`/contacts/${id}`, { status });
      toast.success('Status updated');
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.delete(`/contacts/${id}`);
      toast.success('Message deleted');
      setSelected(null);
      fetchContacts();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Contact Messages</h1>
          <p className="text-gray-400 text-sm mt-1">
            {contacts.filter(c => c.status === 'unread').length} unread · {contacts.length} total
          </p>
        </div>
        <select
          className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:border-blue-500"
          value={filter} onChange={e => setFilter(e.target.value)}
        >
          <option value="">All Messages</option>
          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <HiMail size={40} className="text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No messages found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Sender</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Subject</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-xs text-gray-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((msg, i) => (
                  <motion.tr
                    key={msg._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className={`border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors ${msg.status === 'unread' ? 'bg-blue-500/5' : ''}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {msg.status === 'unread' && <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />}
                        <div>
                          <div className="text-sm font-medium text-white">{msg.name}</div>
                          <div className="text-xs text-gray-400">{msg.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 max-w-48 truncate">{msg.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`badge border ${STATUS_COLORS[msg.status]}`}>{msg.status}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleView(msg)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                          <HiEye size={14} />
                        </button>
                        <button onClick={() => handleDelete(msg._id)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
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
              <h2 className="font-display font-semibold text-white">Message Details</h2>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white"><HiX size={20} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ['From', selected.name],
                  ['Email', selected.email],
                  ['Phone', selected.phone || '-'],
                  ['Subject', selected.subject],
                ].map(([k, v]) => (
                  <div key={k} className="bg-gray-800 rounded-xl p-3">
                    <div className="text-xs text-gray-400 mb-1">{k}</div>
                    <div className="text-sm text-white font-medium break-all">{v}</div>
                  </div>
                ))}
              </div>
              <div className="bg-gray-800 rounded-xl p-4">
                <div className="text-xs text-gray-400 mb-2">Message</div>
                <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap">{selected.message}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Update Status</div>
                <div className="flex gap-2">
                  {Object.keys(STATUS_COLORS).map(s => (
                    <button key={s} onClick={() => handleUpdateStatus(selected._id, s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${selected.status === s ? STATUS_COLORS[s] : 'border-gray-600 text-gray-400 hover:border-gray-500'}`}
                    >{s}</button>
                  ))}
                </div>
              </div>
              <a
                href={`mailto:${selected.email}?subject=Re: ${selected.subject}`}
                className="btn-primary w-full justify-center"
              >
                <HiMail size={16} /> Reply via Email
              </a>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
