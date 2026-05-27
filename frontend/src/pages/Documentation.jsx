import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import {
  FileText,
  Image as ImageIcon,
  Calendar,
  User,
  Loader2,
  Trash2,
  Edit2,
  Eye,
  ExternalLink,
  UploadCloud,
  Plus,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const BACKEND_URL = "http://127.0.0.1:8000";

const Documentation = () => {
  const { user } = useAuthStore();
  const canUpload = user?.role === "STAFF_LAPANGAN";
  const editFileInputRef = useRef(null);
  const uploadFileInputRef = useRef(null);

  const [programs, setPrograms] = useState([]);
  const [documentations, setDocumentations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Detail & Edit Modal States
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    program: "",
    description: "",
  });
  const [editFile, setEditFile] = useState(null);
  const [editFilePreview, setEditFilePreview] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // General Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFilePreview, setUploadFilePreview] = useState("");
  const [uploadSubmitting, setUploadSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const fetchPrograms = async () => {
    try {
      const response = await api.get("/programs/programs/");
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  const fetchDocumentations = async () => {
    setLoading(true);
    try {
      const response = await api.get("/programs/documentations/");
      setDocumentations(response.data);
    } catch (error) {
      console.error("Error fetching documentations:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchDocumentations();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumentasi ini?")) {
      try {
        await api.delete(`/programs/documentations/${id}/`);
        setIsDetailModalOpen(false);
        fetchDocumentations();
      } catch (error) {
        console.error("Error deleting documentation:", error);
        alert("Gagal menghapus dokumentasi.");
      }
    }
  };

  const handleOpenDetailModal = (doc) => {
    setSelectedDoc(doc);
    setEditFormData({
      program: doc.program ? doc.program.toString() : "",
      description: doc.description,
    });
    setEditFile(null);
    setEditFilePreview("");
    setIsEditMode(false);
    setEditError("");
    setIsDetailModalOpen(true);
  };

  const handleEditFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setEditError("File terlalu besar. Maksimal ukuran file adalah 10MB.");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setEditError(
          "Format file tidak didukung. Harap unggah file JPG, PNG, atau PDF.",
        );
        return;
      }
      setEditFile(file);
      setEditError("");

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setEditFilePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setEditFilePreview("pdf");
      }
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.description.trim()) {
      setEditError("Silakan masukkan keterangan.");
      return;
    }

    setEditSubmitting(true);
    setEditError("");

    const updateData = new FormData();
    if (editFormData.program) {
      updateData.append("program", editFormData.program);
    } else {
      updateData.append("program", ""); // Clear program association
    }
    updateData.append("description", editFormData.description);
    if (editFile) {
      updateData.append("file", editFile);
    }

    try {
      const response = await api.patch(
        `/programs/documentations/${selectedDoc.id}/`,
        updateData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      setSelectedDoc(response.data);
      setIsEditMode(false);
      setEditFile(null);
      setEditFilePreview("");
      fetchDocumentations();
    } catch (error) {
      console.error("Error updating documentation:", error);
      setEditError("Gagal memperbarui dokumentasi. Silakan coba lagi.");
    } finally {
      setEditSubmitting(false);
    }
  };

  // General Upload Logic
  const handleUploadFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File terlalu besar. Maksimal ukuran file adalah 10MB.");
        return;
      }
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/jpg",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setUploadError(
          "Format file tidak didukung. Harap unggah file JPG, PNG, atau PDF.",
        );
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

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError("Silakan pilih file berkas dokumentasi.");
      return;
    }

    setUploadSubmitting(true);
    setUploadError("");
    setUploadSuccess("");

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("description", uploadDescription);

    try {
      await api.post("/programs/documentations/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess("Dokumentasi umum berhasil disimpan!");
      setUploadDescription("");
      setUploadFile(null);
      setUploadFilePreview("");
      if (uploadFileInputRef.current) uploadFileInputRef.current.value = "";

      // Close modal after brief success presentation
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess("");
        fetchDocumentations();
      }, 1000);
    } catch (error) {
      console.error("Error uploading general documentation:", error);
      setUploadError("Gagal mengunggah dokumentasi umum. Silakan coba lagi.");
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

  return (
    <div className="space-y-8">
      {/* Top Title Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans">
            Dokumentasi Lapangan
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Arsip foto dan berkas laporan umum.
          </p>
        </div>
        {canUpload && (
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <Button
              onClick={() => {
                setUploadDescription("");
                setUploadFile(null);
                setUploadFilePreview("");
                setUploadError("");
                setUploadSuccess("");
                setIsUploadModalOpen(true);
              }}
              className="h-11 px-5 flex items-center gap-2 font-bold shadow-md rounded-xl"
            >
              <Plus className="w-5 h-5" /> Upload Dokumentasi Umum
            </Button>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Upload Dokumentasi Umum
                </DialogTitle>
                <DialogDescription>
                  Unggah file arsip berupa foto, laporan PDF, dll.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleUploadSubmit} className="space-y-4 pt-4">
                {uploadError && (
                  <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                    {uploadError}
                  </div>
                )}
                {uploadSuccess && (
                  <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5 animate-bounce">
                    <CheckCircle2 className="w-4 h-4" />
                    {uploadSuccess}
                  </div>
                )}

                {/* File Upload Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Pilih File Berkas
                  </label>
                  <div
                    onClick={() => uploadFileInputRef.current?.click()}
                    className="w-full py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950 transition-all"
                  >
                    <input
                      ref={uploadFileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleUploadFileChange}
                      className="hidden"
                    />
                    {uploadFilePreview ? (
                      uploadFilePreview === "pdf" ? (
                        <div className="flex flex-col items-center gap-1">
                          <FileText className="w-10 h-10 text-rose-500" />
                          <span className="text-xs font-semibold text-slate-700 dark:text-slate-350">
                            {uploadFile?.name}
                          </span>
                        </div>
                      ) : (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 w-full max-h-[140px] flex justify-center bg-slate-100">
                          <img
                            src={uploadFilePreview}
                            alt="preview"
                            className="h-full object-cover max-h-[140px]"
                          />
                        </div>
                      )
                    ) : (
                      <>
                        <UploadCloud className="w-8 h-8 text-primary" />
                        <div className="text-center">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            Klik untuk mencari file berkas
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Format: JPG, PNG, PDF (Maksimal 10MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Keterangan (Opsional)
                  </label>
                  <textarea
                    placeholder="Tulis keterangan opsional mengenai file dokumentasi ini..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-850 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary text-slate-850"
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploadSubmitting}
                    className="font-semibold px-6"
                  >
                    {uploadSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Simpan Arsip
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Media Documentation Gallery Grid */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[450px]">
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">
          Galeri Dokumentasi Umum
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">Memuat foto dokumentasi...</p>
          </div>
        ) : documentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
              Belum ada foto dokumentasi
            </p>
            <p className="text-sm text-slate-400 text-center max-w-sm">
              Belum ada bukti foto pelaksanaan program di lapangan yang
              diunggah.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {documentations.map((doc) => {
              const isImage =
                doc.file && !doc.file.toLowerCase().endsWith(".pdf");

              return (
                <div
                  key={doc.id}
                  className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {/* Media Area */}
                  <div
                    onClick={() => handleOpenDetailModal(doc)}
                    className="aspect-video w-full relative bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                    title="Klik untuk melihat detail"
                  >
                    {isImage ? (
                      <img
                        src={getMediaUrl(doc.file)}
                        alt={doc.description || "Dokumentasi"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-rose-500">
                        <FileText className="w-12 h-12" />
                        <span className="text-xs font-semibold">
                          Dokumen PDF
                        </span>
                      </div>
                    )}

                    {/* Top float elements */}
                    <div className="absolute top-3 left-3 bg-primary/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {doc.program_detail?.title || "UMUM"}
                    </div>

                    {/* Quick View Hover Indicator */}
                    <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 text-slate-800 dark:bg-slate-900/95 dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                        <Eye className="w-3.5 h-3.5" /> Lihat Detail
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {doc.description || "(Tanpa keterangan)"}
                    </p>

                    {/* Footer Details */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>
                          {doc.uploaded_by_detail?.username || "Petugas"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(doc.uploaded_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Interactive Detail & Edit Modal Dialog */}
      {isDetailModalOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                {isEditMode
                  ? "Edit Dokumentasi"
                  : "Detail Dokumentasi Kegiatan"}
              </h3>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            {isEditMode ? (
              <form onSubmit={handleEditSubmit}>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                  {editError && (
                    <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                      {editError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Program Kerja (Opsional, pilih jika ingin mengaitkan ke
                      program)
                    </label>
                    <Select
                      value={editFormData.program}
                      onValueChange={(val) =>
                        setEditFormData({ ...editFormData, program: val })
                      }
                    >
                      <SelectTrigger className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-sm text-slate-850 dark:text-slate-150">
                        <SelectValue placeholder="-- Umum (Tidak terikat program) --">
                          {programs.find(
                            (p) =>
                              p.id.toString() ===
                              editFormData.program.toString(),
                          )?.title || "-- Umum (Tidak terikat program) --"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          -- Umum (Tidak terikat program) --
                        </SelectItem>
                        {programs.map((prog) => (
                          <SelectItem key={prog.id} value={prog.id.toString()}>
                            {prog.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Change Media Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Ubah File Dokumentasi (Biarkan kosong jika tidak ingin
                      diubah)
                    </label>
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full py-5 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-955 transition-all"
                    >
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleEditFileChange}
                        className="hidden"
                      />
                      {editFilePreview ? (
                        editFilePreview === "pdf" ? (
                          <div className="flex items-center gap-2 text-rose-500 text-xs font-semibold">
                            <FileText className="w-5 h-5" />
                            <span>PDF Baru: {editFile?.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                            <img
                              src={editFilePreview}
                              alt="new preview"
                              className="w-10 h-10 object-cover rounded-md"
                            />
                            <span>Gambar Baru Terpilih</span>
                          </div>
                        )
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <UploadCloud className="w-4 h-4 text-primary" />
                          <span>Klik untuk mengganti gambar/file baru</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Deskripsi / Keterangan (Opsional)
                    </label>
                    <textarea
                      placeholder="Masukkan keterangan foto dokumentasi..."
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      rows="4"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 focus:bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Modal Footer (Edit Mode) */}
                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditMode(false)}
                    disabled={editSubmitting}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex items-center gap-2"
                  >
                    {editSubmitting && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Simpan Perubahan
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-5">
                {/* Media Preview Box */}
                <div className="w-full overflow-hidden flex justify-center bg-slate-955 dark:bg-slate-955 rounded-xl relative max-h-[300px]">
                  {selectedDoc.file &&
                  !selectedDoc.file.toLowerCase().endsWith(".pdf") ? (
                    <img
                      src={getMediaUrl(selectedDoc.file)}
                      alt={selectedDoc.description || "Dokumentasi"}
                      className="max-h-[300px] w-auto object-contain rounded-xl"
                    />
                  ) : (
                    <a
                      href={getMediaUrl(selectedDoc.file)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center py-16 text-rose-500 hover:text-rose-450 w-full transition-all"
                    >
                      <FileText className="w-16 h-16 mb-2" />
                      <span className="text-sm font-bold flex items-center gap-1">
                        Buka File PDF Dokumentasi{" "}
                        <ExternalLink className="w-4 h-4" />
                      </span>
                      <span className="text-xs opacity-70 mt-1">
                        Klik untuk membuka di tab baru
                      </span>
                    </a>
                  )}
                </div>

                {/* Meta details list */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Program Kerja
                    </span>
                    <p className="text-xs font-bold text-primary">
                      {selectedDoc.program_detail?.title || "UMUM / BEBAS"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pengunggah
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {selectedDoc.uploaded_by_detail
                        ? `${selectedDoc.uploaded_by_detail.username || ""}`.trim()
                        : "Petugas"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Tanggal Diunggah
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {new Date(selectedDoc.uploaded_at).toLocaleString(
                        "id-ID",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}{" "}
                      WITA
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                    Keterangan Kegiatan
                  </h4>
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-955 p-4 rounded-xl border border-slate-100 dark:border-slate-850 whitespace-pre-line">
                    {selectedDoc.description || "(Tanpa keterangan)"}
                  </div>
                </div>

                {/* Modal Footer Controls (View Mode) */}
                <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-5">
                  {canUpload ? (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setIsEditMode(true)}
                        variant="outline"
                        className="flex items-center gap-1.5 text-xs font-semibold h-9"
                      >
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(selectedDoc.id)}
                        variant="outline"
                        className="flex items-center gap-1.5 text-xs font-semibold h-9 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-250 dark:border-rose-900/30"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                  <Button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="h-9 text-xs font-semibold"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Documentation;
