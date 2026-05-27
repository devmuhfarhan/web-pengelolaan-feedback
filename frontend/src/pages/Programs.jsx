import { useState, useEffect, useRef } from "react";
import useAuthStore from "@/store/authStore";
import api from "@/lib/axios";
import { Plus, Edit2, Trash2, Calendar, Users, Eye, UploadCloud, FileText, CheckCircle2, Loader2, Info, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loading } from "@/components/ui/Loading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = "http://127.0.0.1:8000";

const Programs = () => {
  const { user } = useAuthStore();
  const isStaffLapangan = user?.role === "STAFF_LAPANGAN";
  const canManage = user?.role === "STAFF_OPERATIONAL";

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  // Program Form States
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    start_date: "",
    target_beneficiaries: 0,
    status: "PLANNED",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Program Detail & Context-aware Upload States
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isUploadPanelOpen, setIsUploadPanelOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFilePreview, setUploadFilePreview] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const programFileInputRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const { data } = await api.get("/programs/programs/");
      setPrograms(data);
      // Update selected program if currently viewed in detail modal
      if (selectedProgram) {
        const updated = data.find(p => p.id === selectedProgram.id);
        if (updated) setSelectedProgram(updated);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await api.put(`/programs/programs/${editingId}/`, formData);
      } else {
        await api.post("/programs/programs/", formData);
      }
      resetForm();
      fetchPrograms();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({
      title: "",
      description: "",
      start_date: "",
      target_beneficiaries: 0,
      status: "PLANNED",
    });
  };

  const handleEdit = (e, program) => {
    e.stopPropagation(); // Avoid opening details modal
    setEditingId(program.id);
    setFormData({
      title: program.title,
      description: program.description,
      start_date: program.start_date,
      target_beneficiaries: program.target_beneficiaries,
      status: program.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Avoid opening details modal
    if (!window.confirm("Apakah Anda yakin ingin menghapus program kerja ini beserta seluruh datanya?")) return;
    try {
      await api.delete(`/programs/programs/${id}/`);
      fetchPrograms();
    } catch (error) {
      console.error(error);
    }
  };

  const handleOpenDetailModal = (program) => {
    setSelectedProgram(program);
    setIsUploadPanelOpen(false);
    setUploadFile(null);
    setUploadFilePreview("");
    setUploadDescription("");
    setUploadError("");
    setUploadSuccess("");
    setIsDetailModalOpen(true);
  };

  // Program Context-Aware File Upload Handling
  const handleProgramFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File terlalu besar. Maksimal ukuran file adalah 10MB.");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
      if (!allowedTypes.includes(file.type)) {
        setUploadError("Format file tidak didukung. Harap unggah file JPG, PNG, atau PDF.");
        return;
      }
      setUploadFile(file);
      setUploadError("");

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setUploadFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadFilePreview("pdf");
      }
    }
  };

  const handleProgramUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Silakan pilih file bukti foto/laporan terlebih dahulu.");
      return;
    }

    setUploadSubmitting(true);
    setUploadError("");
    setUploadSuccess("");

    const formDataUpload = new FormData();
    formDataUpload.append("program", selectedProgram.id);
    formDataUpload.append("file", uploadFile);
    formDataUpload.append("description", uploadDescription);

    try {
      await api.post("/programs/documentations/", formDataUpload, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess("Bukti foto kegiatan berhasil diunggah!");
      setUploadDescription("");
      setUploadFile(null);
      setUploadFilePreview("");
      setIsUploadPanelOpen(false);
      if (programFileInputRef.current) programFileInputRef.current.value = "";
      
      // Refresh database records
      fetchPrograms();
    } catch (error) {
      console.error("Error uploading program documentation:", error);
      setUploadError("Gagal mengunggah foto. Silakan coba lagi.");
    } finally {
      setUploadSubmitting(false);
    }
  };

  const getMediaUrl = (urlPath) => {
    if (!urlPath) return "";
    if (urlPath.startsWith("http://") || urlPath.startsWith("https://")) {
      return urlPath;
    }
    return `${BACKEND_URL}${urlPath}`;
  };

  if (loading) return <Loading text="Memuat data program..." />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end gap-4 flex-wrap bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            Program Kerja & Bukti Kegiatan
          </h1>
          <p className="text-slate-500 text-sm">
            Pantau detail program kerja dan unggah bukti pelaksanaan kegiatan lapangan secara spesifik.
          </p>
        </div>
        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            if (!open) resetForm();
            else setModalOpen(true);
          }}>
            <DialogTrigger asChild>
              <Button className="px-5 font-bold shadow-md rounded-xl" onClick={() => resetForm()}>
                <Plus className="mr-1.5 h-5 w-5" /> Buat Program Baru
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  {editingId ? "Edit Program Kerja" : "Buat Program Baru"}
                </DialogTitle>
                <DialogDescription>
                  {editingId ? "Perbarui informasi rincian program kerja." : "Masukkan data rincian program kerja baru untuk dijalankan."}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="font-semibold text-slate-700 dark:text-slate-300">
                    Nama Program Kerja
                  </Label>
                  <Input
                    id="title"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    className="h-11 rounded-lg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description" className="font-semibold text-slate-700 dark:text-slate-300">
                    Deskripsi Program
                  </Label>
                  <textarea
                    id="description"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className="flex min-h-[100px] w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-4 py-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary outline-none transition-all resize-none shadow-sm text-slate-800 dark:text-slate-100"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start_date" className="font-semibold text-slate-700 dark:text-slate-300">
                      Tanggal Mulai
                    </Label>
                    <Input
                      id="start_date"
                      type="date"
                      required
                      value={formData.start_date}
                      onChange={(e) =>
                        setFormData({ ...formData, start_date: e.target.value })
                      }
                      className="h-11 rounded-lg"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target" className="font-semibold text-slate-700 dark:text-slate-300">
                      Target Penerima
                    </Label>
                    <Input
                      id="target"
                      type="number"
                      required
                      value={formData.target_beneficiaries}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          target_beneficiaries: parseInt(e.target.value),
                        })
                      }
                      className="h-11 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="font-semibold text-slate-700 dark:text-slate-300">
                    Status Pelaksanaan
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger className="h-11 rounded-lg">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLANNED">Planned (Direncanakan)</SelectItem>
                      <SelectItem value="ONGOING">Ongoing (Berlangsung)</SelectItem>
                      <SelectItem value="COMPLETED">Completed (Selesai)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="button" variant="ghost" onClick={() => resetForm()}>
                    Batal
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="px-8 font-semibold">
                    {isSubmitting ? "Menyimpan..." : "Simpan Program"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Program Work Cards List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {programs.map((program) => (
          <Card
            key={program.id}
            onClick={() => handleOpenDetailModal(program)}
            className="flex flex-col border-0 ring-1 ring-slate-200 dark:ring-slate-800 shadow-sm bg-white dark:bg-slate-900 overflow-hidden group hover:shadow-md hover:ring-primary/40 dark:hover:ring-primary/40 transition-all duration-200 cursor-pointer"
          >
            <CardHeader className="pb-4 relative">
              <div className="flex justify-between items-start gap-4 pt-2">
                <CardTitle className="text-lg line-clamp-2 leading-tight font-bold text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                  {program.title}
                </CardTitle>
                <span
                  className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
                    program.status === "COMPLETED"
                      ? "bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                      : program.status === "ONGOING"
                        ? "bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
                        : "bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                  }`}
                >
                  {program.status}
                </span>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <p className="text-slate-600 dark:text-slate-350 line-clamp-3 mb-6 text-sm leading-relaxed">
                {program.description}
              </p>
              <div className="space-y-2.5 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-800 mt-auto">
                <div className="flex items-center text-slate-600 dark:text-slate-455 text-xs font-semibold">
                  <Users className="w-4 h-4 text-primary mr-2.5" />
                  <span>
                    Target:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {program.target_beneficiaries}
                    </strong>{" "}
                    Penerima Manfaat
                  </span>
                </div>
                <div className="flex items-center text-slate-600 dark:text-slate-455 text-xs font-semibold">
                  <Calendar className="w-4 h-4 text-primary mr-2.5" />
                  <span>
                    Dimulai:{" "}
                    <strong className="text-slate-800 dark:text-slate-200">
                      {new Date(program.start_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                    </strong>
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3 pb-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/40 dark:bg-slate-900/20 px-6 flex justify-between items-center text-xs font-bold text-primary group-hover:text-primary-hover">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" /> Detail Kegiatan
              </span>
              {canManage && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="xs"
                    className="p-1 h-7 w-7 text-slate-500 hover:text-primary hover:bg-slate-100"
                    onClick={(e) => handleEdit(e, program)}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    className="p-1 h-7 w-7 text-rose-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                    onClick={(e) => handleDelete(e, program.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </CardFooter>
          </Card>
        ))}
        {programs.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg border border-dashed border-slate-200 dark:border-slate-800">
            <FileText size={48} className="mb-4 text-slate-300 dark:text-slate-700 animate-bounce" strokeWidth={1} />
            <p className="text-lg font-bold text-slate-700 dark:text-slate-350">Tidak ada program kerja</p>
            <p className="text-sm text-slate-400">Belum ada program kerja Puspadi Bali yang terdaftar.</p>
          </div>
        )}
      </div>

      {/* Program Detail & Context-aware Proof Upload Modal */}
      {isDetailModalOpen && selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Rincian & Bukti Program Kerja
                </h3>
              </div>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Program Information */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <h4 className="text-lg font-bold text-slate-850 dark:text-slate-100 leading-tight">
                    {selectedProgram.title}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                    {selectedProgram.status}
                  </span>
                </div>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-350 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-850 whitespace-pre-line">
                  {selectedProgram.description}
                </p>
              </div>

              {/* Upload Proof photo Form Panel (Expanding on click) */}
              {isStaffLapangan && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900/50">
                  <button
                    onClick={() => {
                      setIsUploadPanelOpen(!isUploadPanelOpen);
                      setUploadFile(null);
                      setUploadFilePreview("");
                      setUploadDescription("");
                      setUploadError("");
                      setUploadSuccess("");
                    }}
                    className="w-full px-5 py-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-primary">
                      <UploadCloud className="w-4 h-4" /> Upload Foto Kegiatan (Bukti Pelaksanaan)
                    </span>
                    <span>{isUploadPanelOpen ? "Tutup Form" : "Buka Form"}</span>
                  </button>

                  {isUploadPanelOpen && (
                    <form onSubmit={handleProgramUploadSubmit} className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-955 space-y-4">
                      {uploadError && (
                        <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                          {uploadError}
                        </div>
                      )}
                      {uploadSuccess && (
                        <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5 animate-pulse">
                          <CheckCircle2 className="w-4 h-4" />
                          {uploadSuccess}
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Pilih atau Ambil Foto</label>
                          <div
                            onClick={() => programFileInputRef.current?.click()}
                            className="w-full py-6 px-3 border border-dashed border-slate-250 hover:border-primary rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50/50 transition-all text-center"
                          >
                            <input
                              ref={programFileInputRef}
                              type="file"
                              accept="image/*,application/pdf"
                              onChange={handleProgramFileChange}
                              className="hidden"
                            />
                            {uploadFilePreview ? (
                              uploadFilePreview === "pdf" ? (
                                <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold">
                                  <FileText className="w-4 h-4" />
                                  <span className="truncate max-w-[120px]">{uploadFile?.name}</span>
                                </div>
                              ) : (
                                <img src={uploadFilePreview} alt="preview" className="h-10 w-auto object-cover rounded-md" />
                              )
                            ) : (
                              <>
                                <UploadCloud className="w-5 h-5 text-primary" />
                                <span className="text-[10px] text-slate-450 font-bold">Pilih berkas pembuktian</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Keterangan / Keterangan Bukti</label>
                          <textarea
                            placeholder="Deskripsikan bukti foto pelaksanaan ini..."
                            value={uploadDescription}
                            onChange={(e) => setUploadDescription(e.target.value)}
                            rows="3"
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary text-slate-800"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button type="button" size="sm" variant="ghost" onClick={() => setIsUploadPanelOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" size="sm" disabled={uploadSubmitting} className="font-bold flex items-center gap-1.5 px-4">
                          {uploadSubmitting && <Loader2 className="w-3 h-3 animate-spin" />} Upload Bukti
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Gallery of Proof of Implementation Specific to this program */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Galeri Bukti Pelaksanaan (Hanya untuk program ini)
                </h4>
                {selectedProgram.documentations && selectedProgram.documentations.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {selectedProgram.documentations.map((doc) => {
                      const isImg = doc.file && !doc.file.toLowerCase().endsWith(".pdf");
                      return (
                        <div key={doc.id} className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col justify-between group relative">
                          <div className="aspect-video flex items-center justify-center bg-slate-100 dark:bg-slate-900 border-b border-slate-200/50 overflow-hidden">
                            {isImg ? (
                              <img
                                src={getMediaUrl(doc.file)}
                                alt={doc.description || "Bukti"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="flex flex-col items-center gap-1 text-rose-500">
                                <FileText className="w-8 h-8" />
                                <span className="text-[9px] font-bold">PDF Laporan</span>
                              </div>
                            )}
                          </div>
                          <div className="p-2.5 text-[11px] text-slate-655 leading-relaxed truncate">
                            {doc.description || "(Tanpa keterangan)"}
                          </div>
                          {/* Floating open full button */}
                          <a
                            href={getMediaUrl(doc.file)}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute top-2 right-2 p-1 bg-white/95 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-primary hover:text-white text-slate-600 shadow-sm"
                            title="Buka Berkas Penuh"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 text-slate-400 text-xs">
                    Belum ada bukti pelaksanaan/foto kegiatan yang terunggah untuk program kerja ini.
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <Button onClick={() => setIsDetailModalOpen(false)} className="h-9 px-6 text-xs font-semibold">
                Tutup
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default Programs;
