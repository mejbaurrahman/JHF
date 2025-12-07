import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance";
import {
  Save,
  Loader2,
  Home,
  Info,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  X,
  Plus,
  Trash2,
  Heart,
  Users,
  BookOpen,
} from "lucide-react";
import { MOCK_SITE_CONTENT } from "../../services/mockData";

const AdminCMS: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"home" | "about">("home");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [usingMock, setUsingMock] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  useEffect(() => {
    fetchContent(activeTab);
  }, [activeTab]);

  const fetchContent = async (section: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/content/site/${section}`);
      setFormData(
        res.data ||
          (section === "home"
            ? MOCK_SITE_CONTENT.home
            : MOCK_SITE_CONTENT.about)
      );
      setUsingMock(false);
    } catch (err) {
      console.warn("Failed to fetch content, using default.", err);
      // Fallback
      setFormData(
        section === "home" ? MOCK_SITE_CONTENT.home : MOCK_SITE_CONTENT.about
      );
      setUsingMock(true);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const uploadFileHandler = async (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string = "logoUrl"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if in mock mode
    if (usingMock) {
      // In mock mode, create a local object URL for preview
      const localUrl = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, [fieldName]: localUrl }));
      alert(
        "Note: This is demo mode. Image preview will work, but will not be saved without backend connection."
      );
      return;
    }

    // Validate file type
    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, GIF, or WebP)");
      e.target.value = "";
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      e.target.value = "";
      return;
    }

    const form = new FormData();
    form.append("image", file);

    // Set appropriate uploading state
    if (fieldName === "bannerBackgroundUrl") {
      setUploadingBanner(true);
    } else {
      setUploading(true);
    }

    try {
      console.log("Starting upload for file:", file.name, file.type, file.size);

      const response = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("Upload response received:", response);
      console.log("Response data:", response.data);

      const data = response.data;

      // Build full URL - handle different response formats
      let imageUrl = data?.imageUrl || data?.url || data?.filename;

      if (!imageUrl) {
        console.error("No image URL in response. Full response:", data);
        throw new Error(
          `No image URL in response. Response: ${JSON.stringify(data)}`
        );
      }

      // If imageUrl is just a filename, add the /uploads/ prefix
      if (!imageUrl.startsWith("/uploads/") && !imageUrl.startsWith("http")) {
        imageUrl = `/uploads/${imageUrl}`;
      }

      const fullUrl = imageUrl.startsWith("http")
        ? imageUrl
        : imageUrl.startsWith("/")
        ? `http://127.0.0.1:5000${imageUrl}`
        : `http://127.0.0.1:5000/${imageUrl}`;

      console.log("Image URL constructed:", fullUrl);

      setFormData((prev) => ({ ...prev, [fieldName]: fullUrl }));

      // Show success message
      console.log("Image uploaded successfully:", fullUrl);
    } catch (error: any) {
      console.error("Upload error:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);

      let errorMessage = "Upload failed. Please try again.";

      if (error.response) {
        // Server responded with error
        const responseData = error.response.data;
        errorMessage =
          responseData?.message ||
          responseData?.error ||
          error.message ||
          `Upload failed: ${
            error.response.statusText || error.response.status
          }`;

        // Log the full error response for debugging
        console.error("Server error response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: responseData,
        });
      } else if (error.request) {
        // Request made but no response
        errorMessage =
          "No response from server. Please check if the server is running.";
        console.error("No response received:", error.request);
      } else {
        // Error setting up request
        errorMessage = error.message || "Failed to upload image.";
        console.error("Request setup error:", error);
      }

      alert(errorMessage);
    } finally {
      if (fieldName === "bannerBackgroundUrl") {
        setUploadingBanner(false);
      } else {
        setUploading(false);
      }
      e.target.value = ""; // Reset input after upload attempt
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (usingMock) {
      alert("Cannot save in demo mode (Backend unavailable)");
      return;
    }
    try {
      setLoading(true);
      await api.put(`/content/site/${activeTab}`, formData);
      alert("Content updated successfully!");
    } catch (err) {
      alert("Failed to update content.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Site Content Management
        </h1>
        {usingMock && (
          <div className="flex items-center gap-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm border border-amber-200">
            <AlertTriangle size={16} />
            <span>Demo Data</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("home")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "home"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Home size={18} /> Home Page
        </button>
        <button
          onClick={() => setActiveTab("about")}
          className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors border-b-2 ${
            activeTab === "about"
              ? "border-emerald-600 text-emerald-600"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <Info size={18} /> About Page
        </button>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
      >
        {loading && (
          <div className="text-center py-4">
            <Loader2 className="animate-spin mx-auto text-emerald-600" />
          </div>
        )}

        {!loading && activeTab === "home" && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-800 border-b pb-2">
              Hero Section
            </h3>

            {/* Logo Upload Section */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon size={16} /> Banner Logo Image
              </label>

              <div className="space-y-4">
                <label
                  className={`inline-flex cursor-pointer bg-emerald-50 border border-emerald-200 text-emerald-700 px-5 py-2.5 rounded-lg hover:bg-emerald-100 transition items-center justify-center gap-2 ${
                    uploading ? "opacity-70 cursor-wait" : ""
                  }`}
                >
                  {uploading ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Upload size={18} />
                  )}
                  <span className="font-medium text-sm whitespace-nowrap">
                    {uploading ? "Uploading..." : "Upload Logo"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    onChange={uploadFileHandler}
                    accept="image/*"
                    disabled={uploading}
                  />
                </label>

                {formData.logoUrl && (
                  <div className="relative inline-block group">
                    <div className="border-2 border-emerald-200 rounded-lg p-2 bg-emerald-50">
                      <img
                        src={formData.logoUrl}
                        alt="Logo Preview"
                        className="w-32 h-32 object-contain rounded-lg"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, logoUrl: "" }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                      title="Remove logo"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName || ""}
                onChange={handleChange}
                placeholder="Jesobantapur Hilful Fuzul"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Suffix / Subtitle
              </label>
              <input
                type="text"
                name="organizationSuffix"
                value={formData.organizationSuffix || ""}
                onChange={handleChange}
                placeholder="Youth Association"
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quranic Ayah (Arabic)
              </label>
              <textarea
                name="heroAyahArabic"
                value={formData.heroAyahArabic || ""}
                onChange={handleChange}
                dir="rtl"
                rows={2}
                placeholder="Enter Arabic text..."
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ayah Translation (English)
              </label>
              <textarea
                name="heroAyah"
                value={formData.heroAyah || ""}
                onChange={handleChange}
                rows={2}
                placeholder="And cooperate in righteousness..."
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
          </div>
        )}

        {!loading && activeTab === "about" && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-800 border-b pb-2">
              Mission & Vision
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Us Description
              </label>
              <textarea
                name="aboutDesc"
                value={formData.aboutDesc || ""}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Our Mission
              </label>
              <textarea
                name="missionDesc"
                value={formData.missionDesc || ""}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Our Vision
              </label>
              <textarea
                name="visionDesc"
                value={formData.visionDesc || ""}
                onChange={handleChange}
                rows={3}
                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="font-bold text-gray-800 border-b pb-2 mb-4">
                Impacts Section
              </h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Impact Subtitle (Optional)
                </label>
                <input
                  type="text"
                  name="impactSubtitle"
                  value={formData.impactSubtitle || ""}
                  onChange={handleChange}
                  placeholder="See how your contributions are changing lives in our community."
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-gray-700">Impact Items</h4>
                <button
                  type="button"
                  onClick={() => {
                    const impacts = formData.impacts || [];
                    setFormData({
                      ...formData,
                      impacts: [
                        ...impacts,
                        { value: "", label: "", icon: "heart", color: "red" },
                      ],
                    });
                  }}
                  className="flex items-center gap-2 text-sm bg-emerald-600 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition"
                >
                  <Plus size={16} /> Add Impact
                </button>
              </div>

              <div className="space-y-4">
                {(formData.impacts || []).map((impact: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-gray-50"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-sm font-medium text-gray-700">
                        Impact {index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const impacts = formData.impacts || [];
                          setFormData({
                            ...formData,
                            impacts: impacts.filter(
                              (_: any, i: number) => i !== index
                            ),
                          });
                        }}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Value (Number)
                        </label>
                        <input
                          type="text"
                          value={impact.value || ""}
                          onChange={(e) => {
                            const impacts = [...(formData.impacts || [])];
                            impacts[index] = {
                              ...impact,
                              value: e.target.value,
                            };
                            setFormData({ ...formData, impacts });
                          }}
                          placeholder="500+"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Icon
                        </label>
                        <select
                          value={impact.icon || "heart"}
                          onChange={(e) => {
                            const impacts = [...(formData.impacts || [])];
                            impacts[index] = {
                              ...impact,
                              icon: e.target.value,
                            };
                            setFormData({ ...formData, impacts });
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="heart">Heart</option>
                          <option value="book">Book</option>
                          <option value="users">Users</option>
                          <option value="dollar">Dollar</option>
                          <option value="calendar">Calendar</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={impact.label || ""}
                          onChange={(e) => {
                            const impacts = [...(formData.impacts || [])];
                            impacts[index] = {
                              ...impact,
                              label: e.target.value,
                            };
                            setFormData({ ...formData, impacts });
                          }}
                          placeholder="Families Supported"
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Color
                        </label>
                        <select
                          value={impact.color || "red"}
                          onChange={(e) => {
                            const impacts = [...(formData.impacts || [])];
                            impacts[index] = {
                              ...impact,
                              color: e.target.value,
                            };
                            setFormData({ ...formData, impacts });
                          }}
                          className="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        >
                          <option value="red">Red</option>
                          <option value="blue">Blue</option>
                          <option value="teal">Teal</option>
                          <option value="emerald">Emerald</option>
                          <option value="purple">Purple</option>
                          <option value="amber">Amber</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}

                {(!formData.impacts || formData.impacts.length === 0) && (
                  <div className="text-center py-8 text-gray-400 text-sm">
                    No impacts added yet. Click "Add Impact" to create one.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading || usingMock}
            className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={18} /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminCMS;
