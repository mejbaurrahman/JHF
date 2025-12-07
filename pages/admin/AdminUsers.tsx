import React, { useEffect, useState } from "react";
import { User, UserRole } from "../../types";
import api from "../../api/axiosInstance";
import {
  User as UserIcon,
  Trash2,
  Shield,
  Loader,
  AlertTriangle,
  Download,
  FileText,
  UserPlus,
  X,
  Phone,
  Mail,
  Lock,
} from "lucide-react";
import { MOCK_USERS } from "../../services/mockData";
import { exportToExcel, exportMultipleSheets } from "../../utils/excelExport";

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "user" as "admin" | "user" | "advisor" | "other",
    customRole: "",
  });
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/auth/users");
      setUsers(res.data);
      setUsingMock(false);
    } catch (err) {
      console.warn("Failed to fetch users, using mock data", err);
      setUsers(MOCK_USERS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/auth/users/${id}`);
      setUsers(users.filter((u) => u._id !== id && u.id !== id));
    } catch (err) {
      alert("Failed to delete user. Backend might be offline.");
    }
  };

  const toggleRole = async (user: User) => {
    const newRole =
      user.role === UserRole.ADMIN ? UserRole.USER : UserRole.ADMIN;
    if (!window.confirm(`Change role to ${newRole}?`)) return;

    try {
      const id = user._id || user.id;
      await api.put(`/auth/users/${id}/role`, { role: newRole });
      setUsers(
        users.map((u) =>
          u._id === id || u.id === id ? { ...u, role: newRole } : u
        )
      );
    } catch (err) {
      alert("Failed to update role. Backend might be offline.");
    }
  };

  const handleExportUsers = async () => {
    const data = users.map((u) => ({
      Name: u.name,
      Email: u.email,
      Phone: u.phone,
      Role: u.role,
      "Join Date": u.joinDate
        ? new Date(u.joinDate).toLocaleDateString()
        : "N/A",
      Occupation: u.occupation || "N/A",
      Address: u.address || "N/A",
    }));
    await exportToExcel(
      data,
      `Members_List_${new Date().toISOString().split("T")[0]}`
    );
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);

    // Validate required fields
    if (!formData.name || !formData.phone || !formData.password) {
      setFormError(
        "Please fill in all required fields (Name, Mobile Number, Password)"
      );
      setIsSubmitting(false);
      return;
    }

    // If role is "other", validate custom role
    if (formData.role === "other" && !formData.customRole.trim()) {
      setFormError("Please specify the custom role");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("/auth/users", {
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        customRole: formData.role === "other" ? formData.customRole : undefined,
      });

      // Add the new user to the list
      setUsers([...users, response.data]);

      // Reset form and close modal
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user",
        customRole: "",
      });
      setIsModalOpen(false);
      setFormError("");
    } catch (err: any) {
      setFormError(
        err.response?.data?.message ||
          "Failed to create member. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadReport = async (user: User) => {
    if (usingMock) {
      alert("Report generation unavailable in demo mode.");
      return;
    }
    const userId = user._id || user.id;
    setDownloadingId(userId || "");

    try {
      // Fetch Fees
      const feesRes = await api.get(`/fees?userId=${userId}`);
      const feesData = feesRes.data.map((f: any) => ({
        Month: `${f.month}/${f.year}`,
        Amount: f.amount,
        Status: f.status,
        "Payment Method": f.paymentMethod,
        "Paid At": f.paidAt ? new Date(f.paidAt).toLocaleDateString() : "N/A",
      }));

      // Fetch Donations
      const donationsRes = await api.get(`/donations?userId=${userId}`);
      const donationsData = donationsRes.data.map((d: any) => ({
        Date: new Date(d.donationDate).toLocaleDateString(),
        Amount: d.amount,
        Event: d.eventId?.title || "General",
        Status: d.status,
        Method: d.paymentMethod,
        TrxID: d.transactionId,
      }));

      // Export
      await exportMultipleSheets(
        [
          { sheetName: "Fees History", data: feesData },
          { sheetName: "Donations History", data: donationsData },
        ],
        `${user.name}_Report_${new Date().toISOString().split("T")[0]}`
      );
    } catch (error) {
      console.error(error);
      alert("Failed to generate report. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-center">
        <Loader className="animate-spin mx-auto" />
      </div>
    );

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <div className="flex gap-2">
          {usingMock && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded text-sm border border-amber-100">
              <AlertTriangle size={14} /> Demo Data
            </div>
          )}
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition flex items-center gap-2"
          >
            <UserPlus size={16} /> Add Member
          </button>
          <button
            onClick={handleExportUsers}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-emerald-700 transition flex items-center gap-2"
          >
            <Download size={16} /> Export Member List
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                User Info
              </th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                Phone
              </th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase">
                Role
              </th>
              <th className="px-6 py-4 text-xs font-medium text-gray-500 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user._id || user.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold overflow-hidden">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        user.name[0]
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {user.phone}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "advisor"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {(user as any).customRole || user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button
                    onClick={() => handleDownloadReport(user)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded"
                    title="Download Report"
                    disabled={downloadingId === (user._id || user.id)}
                  >
                    {downloadingId === (user._id || user.id) ? (
                      <Loader size={16} className="animate-spin" />
                    ) : (
                      <FileText size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => toggleRole(user)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                    title="Change Role"
                  >
                    <Shield size={16} />
                  </button>
                  <button
                    onClick={() => deleteUser(user._id || user.id || "")}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Member Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Add Member</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    password: "",
                    role: "user",
                    customRole: "",
                  });
                  setFormError("");
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm border border-red-200">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <div className="relative">
                  <UserIcon
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Full Name"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mobile Number *
                </label>
                <div className="relative">
                  <Phone
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="01XXXXXXXXX"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email (Optional)
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="email@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter password"
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value as any,
                      customRole: "",
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="advisor">Advisor</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {formData.role === "other" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Role *
                  </label>
                  <input
                    type="text"
                    value={formData.customRole}
                    onChange={(e) =>
                      setFormData({ ...formData, customRole: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter custom role"
                    required={formData.role === "other"}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setFormData({
                      name: "",
                      email: "",
                      phone: "",
                      password: "",
                      role: "user",
                      customRole: "",
                    });
                    setFormError("");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader size={16} className="animate-spin" /> Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={16} /> Add Member
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
