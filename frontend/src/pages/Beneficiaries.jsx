import { useState, useEffect } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { Plus, Edit2, Trash2, Search, Loader2, User as UserIcon, Mail, Phone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const Beneficiaries = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === "STAFF_LAPANGAN";

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("ADD"); // ADD or EDIT
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    password: ""
  });

  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchBeneficiaries = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users/beneficiaries/");
      setBeneficiaries(response.data);
    } catch (error) {
      console.error("Error fetching beneficiaries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
  }, []);

  const handleOpenAddModal = () => {
    setModalType("ADD");
    setFormData({
      username: "",
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      password: ""
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (beneficiary) => {
    setModalType("EDIT");
    setSelectedBeneficiary(beneficiary);
    setFormData({
      username: beneficiary.username,
      email: beneficiary.email,
      first_name: beneficiary.first_name,
      last_name: beneficiary.last_name,
      phone_number: beneficiary.phone_number || "",
      password: "" // Blank when editing unless they want to change it
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.username.trim() || !formData.email.trim()) {
      setFormError("Username dan Email tidak boleh kosong.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    // Prepare submit data, omit password if blank when editing
    const submitData = { ...formData };
    if (modalType === "EDIT" && !submitData.password) {
      delete submitData.password;
    }

    try {
      if (modalType === "ADD") {
        await api.post("/users/beneficiaries/", submitData);
      } else {
        await api.put(`/users/beneficiaries/${selectedBeneficiary.id}/`, submitData);
      }
      setIsModalOpen(false);
      fetchBeneficiaries();
    } catch (error) {
      console.error("Error saving beneficiary:", error);
      const serverMsg = error.response?.data?.username?.[0] || error.response?.data?.email?.[0] || "Gagal menyimpan data. Silakan coba lagi.";
      setFormError(serverMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus akun penerima manfaat ini?")) {
      try {
        await api.delete(`/users/beneficiaries/${id}/`);
        fetchBeneficiaries();
      } catch (error) {
        console.error("Error deleting beneficiary:", error);
        alert("Gagal menghapus data.");
      }
    }
  };

  // Filter and Search Logic
  const filteredBeneficiaries = beneficiaries.filter((item) => {
    const fullName = `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone_number && item.phone_number.includes(searchTerm));
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Manajemen Data Penerima</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola akun pengguna dan data profil penerima manfaat (beneficiary) Puspadi Bali.</p>
        </div>
        {canManage && (
          <Button onClick={handleOpenAddModal} className="flex items-center gap-2 self-start md:self-auto">
            <Plus className="w-4 h-4" />
            Tambah Penerima
          </Button>
        )}
      </div>

      {/* Filter and Search Section */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Cari penerima berdasarkan nama, username, atau email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 focus:bg-white dark:bg-slate-955 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Table Data Penerima */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">Memuat data penerima...</p>
          </div>
        ) : filteredBeneficiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <UserIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">Tidak ada data penerima</p>
            <p className="text-sm text-slate-400 text-center max-w-md">Cobalah untuk mengubah pencarian Anda atau menambahkan akun penerima baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Nama Lengkap</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Username</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">No. Telepon</th>
                  {canManage && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Aksi</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredBeneficiaries.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                          {`${item.first_name || ""} ${item.last_name || ""}`.trim() || item.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">{item.username}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.phone_number || "-"}</span>
                      </div>
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {modalType === "ADD" ? "Tambah Akun Penerima" : "Edit Akun Penerima"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleFormSubmit}>
              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                {formError && (
                  <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                    {formError}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Depan</label>
                    <input
                      type="text"
                      required
                      placeholder="Siti"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Nama Belakang</label>
                    <input
                      type="text"
                      placeholder="Aminah"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Username</label>
                  <input
                    type="text"
                    required
                    placeholder="penerima01"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="penerima01@stewardship.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">No. Telepon</label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {modalType === "ADD" ? "Password" : "Ganti Password (Kosongkan jika tidak ingin diubah)"}
                  </label>
                  <input
                    type="password"
                    placeholder={modalType === "ADD" ? "Password123!" : "********"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formSubmitting}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2"
                >
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {modalType === "ADD" ? "Simpan" : "Perbarui"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Beneficiaries;
