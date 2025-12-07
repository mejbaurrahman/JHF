import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import { CommitteeMember } from "../../types";
import {
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  Upload,
  Loader2,
  AlertTriangle,
  Phone,
} from "lucide-react";
import LoadingScreen from "../../components/common/LoadingScreen";
import { MOCK_COMMITTEE_MEMBERS } from "../../services/mockData";

const AdminCommittee: React.FC = () => {
  const [members, setMembers] = useState<CommitteeMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [usingMock, setUsingMock] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    roleKey: "member",
    imageUrl: "",
    order: 0,
    phone: "",
    customRole: "",
  });

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const res = await api.get("/content/committee");
      if (res.data.length > 0) {
        setMembers(res.data);
        setUsingMock(false);
      } else {
        // Fallback if empty array returned (DB empty)
        setMembers([]);
      }
    } catch (err) {
      console.warn("Failed to fetch members, using mock data.");
      setMembers(MOCK_COMMITTEE_MEMBERS);
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member?: CommitteeMember) => {
    if (member) {
      const predefinedRoles = [
        "president",
        "vicePresident",
        "generalSecretary",
        "treasurer",
        "organizingSecretary",
        "educationSecretary",
        "advisor",
        "member",
      ];
      const isCustomRole = !predefinedRoles.includes(member.roleKey);

      setEditingId(member._id || member.id || "");
      setFormData({
        name: member.name,
        roleKey: isCustomRole ? "other" : member.roleKey,
        imageUrl: member.imageUrl || "",
        order: member.order,
        phone: member.phone || "",
        customRole: isCustomRole ? member.roleKey : "",
      });
    } else {
      setEditingId(null);
      setFormData({
        name: "",
        roleKey: "member",
        imageUrl: "",
        order: 0,
        phone: "",
        customRole: "",
      });
    }
    setIsModalOpen(true);
  };

  const uploadFileHandler = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const form = new FormData();
      form.append("image", file);
      setUploading(true);
      try {
        const { data } = await api.post("/upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const fullUrl = data.imageUrl.startsWith("http")
          ? data.imageUrl
          : `http://127.0.0.1:5000${data.imageUrl}`;
        setFormData((prev) => ({ ...prev, imageUrl: fullUrl }));
      } catch (error) {
        alert("Upload failed");
      } finally {
        setUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: if roleKey is 'other', customRole must be provided
    if (formData.roleKey === "other" && !formData.customRole.trim()) {
      alert("Please enter a custom role");
      return;
    }

    if (usingMock) {
      alert("Cannot edit in demo mode (Backend unavailable)");
      return;
    }

    // Prepare data: if roleKey is 'other', use customRole as the roleKey value
    const submitData: any = {
      name: formData.name,
      roleKey:
        formData.roleKey === "other" ? formData.customRole : formData.roleKey,
      imageUrl: formData.imageUrl,
      order: formData.order,
      phone: formData.phone || undefined,
    };

    try {
      if (editingId) {
        await api.put(`/content/committee/${editingId}`, submitData);
      } else {
        await api.post("/content/committee", submitData);
      }
      setIsModalOpen(false);
      setFormData({
        name: "",
        roleKey: "member",
        imageUrl: "",
        order: 0,
        phone: "",
        customRole: "",
      });
      fetchMembers();
    } catch (err) {
      alert("Failed to save member");
    }
  };

  const handleDelete = async (id: string) => {
    if (usingMock) {
      alert("Cannot delete in demo mode");
      return;
    }
    if (!window.confirm("Delete this member?")) return;
    try {
      await api.delete(`/content/committee/${id}`);
      setMembers(members.filter((m) => (m._id || m.id) !== id));
    } catch (err) {
      alert("Failed to delete");
    }
  };

  if (loading) return <LoadingScreen />;

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Executive Committee
        </h1>

        <div className="flex items-center gap-4">
          {usingMock && (
            <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm border border-amber-200">
              <AlertTriangle size={16} />
              <span>Demo Data</span>
            </div>
          )}
          <button
            onClick={() => handleOpenModal()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 disabled:opacity-50"
            disabled={usingMock}
          >
            <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-4 font-medium text-gray-500">Order</th>
              <th className="px-6 py-4 font-medium text-gray-500">Member</th>
              <th className="px-6 py-4 font-medium text-gray-500">Role Key</th>
              <th className="px-6 py-4 font-medium text-gray-500 text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member._id || member.id}>
                <td className="px-6 py-4">{member.order}</td>
                <td className="px-6 py-4 flex items-center gap-3">
                  <img
                    src={member.imageUrl || "https://via.placeholder.com/40"}
                    className="w-10 h-10 rounded-full object-cover"
                    alt=""
                  />
                  <div>
                    <div className="font-bold">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.phone}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {member.roleKey}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => handleOpenModal(member)}
                    className="text-blue-600 hover:bg-blue-50 p-2 rounded mr-2"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(member._id || member.id || "")}
                    className="text-red-600 hover:bg-red-50 p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Member" : "Add Member"}
              </h2>
              <button onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        order: Number(e.target.value),
                      })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Mobile Number(WhatsApp)
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
                    className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="01XXXXXXXXX"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Role Key (for translation)
                </label>
                <select
                  value={formData.roleKey}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roleKey: e.target.value,
                      customRole:
                        e.target.value === "other" ? formData.customRole : "",
                    })
                  }
                  className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="president">president</option>
                  <option value="vicePresident">vicePresident</option>
                  <option value="generalSecretary">generalSecretary</option>
                  <option value="treasurer">treasurer</option>
                  <option value="organizingSecretary">
                    organizingSecretary
                  </option>
                  <option value="educationSecretary">educationSecretary</option>
                  <option value="advisor">advisor</option>
                  <option value="member">member</option>
                  <option value="other">other</option>
                </select>
              </div>
              {formData.roleKey === "other" && (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Custom Role *
                  </label>
                  <input
                    type="text"
                    value={formData.customRole}
                    onChange={(e) =>
                      setFormData({ ...formData, customRole: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Enter custom role"
                    required={formData.roleKey === "other"}
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1">Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) =>
                      setFormData({ ...formData, imageUrl: e.target.value })
                    }
                    className="w-full border rounded p-2"
                    placeholder="Image URL"
                  />
                  <label className="bg-gray-100 p-2 rounded cursor-pointer border hover:bg-emerald-50">
                    {uploading ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Upload size={20} />
                    )}
                    <input
                      type="file"
                      className="hidden"
                      onChange={uploadFileHandler}
                      accept="image/*"
                    />
                  </label>
                </div>
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    className="w-16 h-16 object-cover rounded mt-2"
                  />
                )}
              </div>
              <button
                type="submit"
                className="w-full bg-emerald-600 text-white py-2 rounded font-bold hover:bg-emerald-700"
              >
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCommittee;
