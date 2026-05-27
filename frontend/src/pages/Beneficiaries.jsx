import { useState, useEffect } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { Plus, Edit2, Trash2, Search, Filter, Loader2, MapPin, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Beneficiaries = () => {
  const { user } = useAuthStore();
  const canManage = user?.role === "STAFF_OPERATIONAL" || user?.role === "STAFF_LAPANGAN";

  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("ADD"); // ADD or EDIT
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    lokasi: "",
    status: "PENDING"
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
    setFormData({ lokasi: "", status: "PENDING" });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (beneficiary) => {
    setModalType("EDIT");
    setSelectedBeneficiary(beneficiary);
    setFormData({
      lokasi: beneficiary.lokasi,
      status: beneficiary.status
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.lokasi.trim()) {
      setFormError("Lokasi tidak boleh kosong.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    try {
      if (modalType === "ADD") {
        await api.post("/users/beneficiaries/", formData);
      } else {
        await api.put(`/users/beneficiaries/${selectedBeneficiary.id}/`, formData);
      }
      setIsModalOpen(false);
      fetchBeneficiaries();
    } catch (error) {
      console.error("Error saving beneficiary:", error);
      setFormError("Gagal menyimpan data. Silakan coba lagi.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus data penerima ini?")) {
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
    const matchesSearch = item.lokasi.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "ALL" || item.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case "VERIFIED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50">
            <CheckCircle className="w-3.5 h-3.5" />
            Terverifikasi
          </span>
        );
      case "INCOMPLETE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50">
            <AlertTriangle className="w-3.5 h-3.5" />
            Data Kurang
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200 dark:bg-sky-950/30 dark:text-sky-400 dark:border-sky-900/50">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Data Penerima Manfaat</h1>
          <p className="text-sm text-slate-500 mt-1">Kelola dan pantau data status verifikasi seluruh lokasi penerima bantuan Puspadi Bali.</p>
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
            placeholder="Cari lokasi penerima bantuan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 focus:bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-slate-400 w-4 h-4" />
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val)}
          >
            <SelectTrigger className="w-[160px] border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-slate-700 dark:text-slate-300 h-9 text-sm">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Semua Status</SelectItem>
              <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
              <SelectItem value="INCOMPLETE">Data Kurang</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
            </SelectContent>
          </Select>
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
            <MapPin className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">Tidak ada data penerima</p>
            <p className="text-sm text-slate-400 text-center max-w-md">Cobalah untuk mengubah filter pencarian Anda atau menambahkan lokasi baru.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Lokasi</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
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
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{item.lokasi}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
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
                {modalType === "ADD" ? "Tambah Data Penerima" : "Edit Data Penerima"}
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
              <div className="p-6 space-y-4">
                {formError && (
                  <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                    {formError}
                  </div>
                )}
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Lokasi</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Kec. Bojonggede, Bogor"
                    value={formData.lokasi}
                    onChange={(e) => setFormData({ ...formData, lokasi: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-850 dark:text-slate-150"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Status Verifikasi</label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm">
                      <SelectValue placeholder="Pilih Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="VERIFIED">Terverifikasi</SelectItem>
                      <SelectItem value="INCOMPLETE">Data Kurang</SelectItem>
                    </SelectContent>
                  </Select>
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
