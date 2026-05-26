import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiPencil, HiPlus, HiTrash } from 'react-icons/hi';
import api from '../utils/api';

const emptyForm = {
  slug: '',
  name: '',
  type: '',
  summary: '',
  stack: '',
  results: '',
  color: 'from-blue-600 to-cyan-500',
  image: '',
  order: 0,
  active: true,
};

const slugify = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const toForm = (project) => ({
  slug: project.slug || '',
  name: project.name || '',
  type: project.type || '',
  summary: project.summary || '',
  stack: Array.isArray(project.stack) ? project.stack.join(', ') : (project.stack || ''),
  results: Array.isArray(project.results) ? project.results.join(', ') : (project.results || ''),
  color: project.color || emptyForm.color,
  image: project.image || '',
  order: project.order ?? 0,
  active: project.active ?? true,
});

const toPayload = (form) => ({
  ...form,
  slug: slugify(form.slug || form.name),
  stack: form.stack.split(',').map(item => item.trim()).filter(Boolean),
  results: form.results.split(',').map(item => item.trim()).filter(Boolean),
  order: Number(form.order || 0),
  active: !!form.active,
});

export default function AdminShowcase() {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await api.get('/admin/showcase');
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load showcase projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleEdit = (project) => {
    setEditingId(project._id);
    setForm(toForm(project));
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await api.patch(`/admin/showcase/${editingId}`, payload);
        toast.success('Showcase project updated');
      } else {
        await api.post('/admin/showcase', payload);
        toast.success('Showcase project created');
      }
      resetForm();
      fetchProjects();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save showcase project');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    if (!confirm(`Delete ${project.name}?`)) return;
    try {
      await api.delete(`/admin/showcase/${project._id}`);
      toast.success('Showcase project deleted');
      if (editingId === project._id) resetForm();
      fetchProjects();
    } catch {
      toast.error('Delete failed');
    }
  };

  const previewResults = useMemo(() => form.results.split(',').map(item => item.trim()).filter(Boolean), [form.results]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
      <div className="xl:col-span-2 space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Showcase Manager</h1>
          <p className="text-gray-400 text-sm mt-1">Create and publish portfolio projects for the public showcase.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl border border-gray-800 p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-1">
              <label className="label">Project Name</label>
              <input className="input-field" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Slug</label>
              <input className="input-field" value={form.slug} onChange={e => setForm(prev => ({ ...prev, slug: e.target.value }))} placeholder="auto-generated from name" />
            </div>
            <div>
              <label className="label">Type</label>
              <input className="input-field" value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))} required />
            </div>
            <div>
              <label className="label">Order</label>
              <input type="number" className="input-field" value={form.order} onChange={e => setForm(prev => ({ ...prev, order: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="label">Summary</label>
            <textarea className="input-field min-h-28" value={form.summary} onChange={e => setForm(prev => ({ ...prev, summary: e.target.value }))} required />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Stack</label>
              <input className="input-field" value={form.stack} onChange={e => setForm(prev => ({ ...prev, stack: e.target.value }))} placeholder="React, Node.js, MongoDB" />
            </div>
            <div>
              <label className="label">Results</label>
              <input className="input-field" value={form.results} onChange={e => setForm(prev => ({ ...prev, results: e.target.value }))} placeholder="42% faster checkout, 2.4x repeat orders" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Image URL</label>
              <input className="input-field" value={form.image} onChange={e => setForm(prev => ({ ...prev, image: e.target.value }))} />
            </div>
            <div>
              <label className="label">Gradient Class</label>
              <input className="input-field" value={form.color} onChange={e => setForm(prev => ({ ...prev, color: e.target.value }))} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input type="checkbox" checked={form.active} onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))} />
            Publish on public showcase
          </label>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2">
              <HiPlus size={16} />
              {editingId ? 'Update Project' : 'Create Project'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors">
                Cancel Edit
              </button>
            )}
          </div>

          {previewResults.length > 0 && (
            <div className="pt-2 border-t border-gray-800">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Results Preview</div>
              <div className="space-y-2">
                {previewResults.map(item => (
                  <div key={item} className="text-xs text-cyan-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>

      <div className="xl:col-span-3">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="font-display font-semibold text-white">Published Projects</h2>
              <p className="text-xs text-gray-400 mt-1">{projects.length} items in the showcase</p>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No showcase projects yet</div>
          ) : (
            <div className="divide-y divide-gray-800">
              {projects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="p-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-medium text-white truncate">{project.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wide ${project.active ? 'bg-green-500/20 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                        {project.active ? 'Live' : 'Hidden'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{project.type} · {project.slug}</p>
                    <p className="text-sm text-gray-300 line-clamp-2">{project.summary}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(project)} className="p-2 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all">
                      <HiPencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(project)} className="p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <HiTrash size={16} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}