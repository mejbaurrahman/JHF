
import React, { useEffect, useState } from 'react';
import { Expense } from '../../types';
import api from '../../api/axiosInstance';
import { Plus, Trash2, Calendar, DollarSign, Tag, X, Save } from 'lucide-react';
import LoadingScreen from '../../components/common/LoadingScreen';

const AdminExpenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Other',
    description: ''
  });

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      const res = await api.get('/expenses');
      setExpenses(res.data);
    } catch (err) {
      console.error("Failed to fetch expenses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      await api.delete(`/expenses/${id}`);
      setExpenses(expenses.filter(e => (e._id || e.id) !== id));
    } catch (err) {
      alert("Failed to delete expense.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/expenses', {
        ...formData,
        amount: Number(formData.amount)
      });
      setExpenses([res.data, ...expenses]); // Add to top
      setIsModalOpen(false);
      setFormData({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: 'Other', description: '' });
    } catch (err) {
      alert("Failed to create expense.");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Expenses</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <Plus size={18} /> Add Expense
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Title / Desc</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {expenses.map((expense) => (
              <tr key={expense._id || expense.id}>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{expense.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{expense.description}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(expense.date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs uppercase font-bold">
                    {expense.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-bold text-red-600">
                  ৳ {expense.amount.toLocaleString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleDelete(expense._id || expense.id || '')}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No expense records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b pb-2">
              <h2 className="text-lg font-bold text-gray-900">Add New Expense</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
                <input 
                  type="text" required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                  placeholder="e.g. Stage Decoration"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input 
                    type="number" required 
                    value={formData.amount}
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input 
                    type="date" required 
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Event">Event</option>
                  <option value="Charity">Charity Distribution</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Transport">Transport</option>
                  <option value="Food">Food & Refreshment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea 
                  rows={2}
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-red-500 outline-none"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full bg-red-600 text-white font-bold py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <Save size={18} /> Save Expense
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExpenses;