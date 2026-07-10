import { useState, useEffect } from "react";
import api from "@/lib/axios";
import { Plus, Edit2, Trash2, Loader2, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

const FeedbackCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("ADD");
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await api.get("/feedbacks/feedback-categories/");
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAdd = () => {
    setModalType("ADD");
    setFormData({ name: "", description: "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEdit = (category) => {
    setModalType("EDIT");
    setSelectedCategory(category);
    setFormData({ name: category.name, description: category.description || "" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    setFormSubmitting(true);
    setFormError("");

    try {
      if (modalType === "ADD") {
        await api.post("/feedbacks/feedback-categories/", formData);
      } else {
        await api.put(`/feedbacks/feedback-categories/${selectedCategory.id}/`, formData);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      setFormError("Failed to save category");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await api.delete(`/feedbacks/feedback-categories/${id}/`);
        fetchCategories();
      } catch (err) {
        alert("Failed to delete category");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Feedback Categories</h1>
          <p className="text-sm text-slate-500 mt-1">Manage categories for feedback questions.</p>
        </div>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <Settings className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">No categories found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4 text-sm font-semibold text-slate-800 dark:text-slate-200">{cat.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">{cat.description || "-"}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(cat)}
                          className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {modalType === "ADD" ? "Add Category" : "Edit Category"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold">&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-4">
                {formError && <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">{formError}</div>}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Category Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 focus:bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 focus:bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                    rows="3"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={formSubmitting}>
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                  Save
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedbackCategories;
