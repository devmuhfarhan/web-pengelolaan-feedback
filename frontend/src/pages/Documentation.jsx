import { useState, useEffect, useRef } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import { UploadCloud, FileText, Image as ImageIcon, Calendar, User, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const BACKEND_URL = "http://127.0.0.1:8000";

const Documentation = () => {
  const { user } = useAuthStore();
  const canUpload = user?.role === "STAFF_LAPANGAN";
  const fileInputRef = useRef(null);

  const [programs, setPrograms] = useState([]);
  const [documentations, setDocumentations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [programsLoading, setProgramsLoading] = useState(true);

  // Form States
  const [selectedProgram, setSelectedProgram] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState("");

  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchPrograms = async () => {
    setProgramsLoading(true);
    try {
      const response = await api.get("/programs/programs/");
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setProgramsLoading(false);
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

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;

    // Check size (Max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File terlalu besar. Maksimal ukuran file adalah 10MB.");
      return;
    }

    // Check type
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMsg("Format file tidak didukung. Harap unggah file JPG, PNG, atau PDF.");
      return;
    }

    setSelectedFile(file);
    setErrorMsg("");

    // Create preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreview("pdf"); // PDF indicator
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProgram) {
      setErrorMsg("Silakan pilih program kerja terlebih dahulu.");
      return;
    }
    if (!selectedFile) {
      setErrorMsg("Silakan pilih atau seret file dokumentasi.");
      return;
    }
    if (!description.trim()) {
      setErrorMsg("Silakan masukkan deskripsi/keterangan foto.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const formData = new FormData();
    formData.append("program", selectedProgram);
    formData.append("file", selectedFile);
    formData.append("description", description);

    try {
      await api.post("/programs/documentations/", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });
      
      setSuccessMsg("Dokumentasi berhasil diunggah!");
      setSelectedProgram("");
      setDescription("");
      setSelectedFile(null);
      setFilePreview("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      
      fetchDocumentations();
    } catch (error) {
      console.error("Error uploading documentation:", error);
      setErrorMsg("Gagal mengunggah dokumentasi. Silakan coba lagi.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus dokumentasi ini?")) {
      try {
        await api.delete(`/programs/documentations/${id}/`);
        fetchDocumentations();
      } catch (error) {
        console.error("Error deleting documentation:", error);
        alert("Gagal menghapus dokumentasi.");
      }
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
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-sans">Dokumentasi Lapangan</h1>
        <p className="text-sm text-slate-500 mt-1">Unggah dan tinjau bukti foto aktivitas program kemasyarakatan Puspadi Bali.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Upload Card Form */}
        {canUpload && (
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Unggah Bukti Kegiatan</h2>
              
              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {errorMsg && (
                  <div className="p-3 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg">
                    {errorMsg}
                  </div>
                )}
                {successMsg && (
                  <div className="p-3 text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    {successMsg}
                  </div>
                )}

                {/* Select Program */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pilih Program Kerja</label>
                  <Select
                    value={selectedProgram}
                    onValueChange={(val) => setSelectedProgram(val)}
                    disabled={programsLoading}
                  >
                    <SelectTrigger className="w-full h-10 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-955 text-sm text-slate-850 dark:text-slate-150">
                      <SelectValue placeholder="-- Pilih Program --">
                        {programs.find(p => p.id.toString() === selectedProgram.toString())?.title}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((prog) => (
                        <SelectItem key={prog.id} value={prog.id.toString()}>
                          {prog.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Drag and drop Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">File Dokumentasi</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`w-full py-8 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-200 min-h-[160px] ${
                      dragActive 
                        ? "border-primary bg-primary/5" 
                        : "border-slate-200 hover:border-primary/50 dark:border-slate-800 bg-slate-50/50 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {filePreview ? (
                      filePreview === "pdf" ? (
                        <div className="flex flex-col items-center gap-1.5">
                          <FileText className="w-10 h-10 text-rose-500" />
                          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{selectedFile?.name}</span>
                        </div>
                      ) : (
                        <div className="relative group rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 w-full max-h-[140px] flex justify-center bg-slate-100">
                          <img
                            src={filePreview}
                            alt="preview"
                            className="h-full object-cover max-h-[140px]"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                            Ubah File
                          </div>
                        </div>
                      )
                    ) : (
                      <>
                        <div className="bg-primary/10 p-3 rounded-full text-primary">
                          <UploadCloud className="w-6 h-6" />
                        </div>
                        <div className="text-center space-y-1">
                          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tarik dan lepas file di sini</p>
                          <p className="text-[10px] text-slate-400">Atau pilih dari perangkat untuk mengunggah bukti kegiatan</p>
                          <p className="text-[9px] text-slate-400 font-medium">Format: JPG, PNG, PDF (Max 10MB)</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Description Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Keterangan / Deskripsi</label>
                  <textarea
                    placeholder="Masukkan deskripsi singkat mengenai foto kegiatan ini..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-800 dark:text-slate-200"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={uploading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 mt-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mengunggah...
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      Unggah Dokumentasi
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* Right Side: Media Documentation Gallery */}
        <div className={canUpload ? "lg:col-span-2 space-y-6" : "lg:col-span-3 space-y-6"}>
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px]">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-6">Galeri Dokumentasi Lapangan</h2>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm text-slate-500">Memuat foto dokumentasi...</p>
              </div>
            ) : documentations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-2">
                <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
                <p className="text-base font-semibold text-slate-600 dark:text-slate-400">Belum ada foto dokumentasi</p>
                <p className="text-sm text-slate-400 text-center max-w-sm">Jadilah yang pertama untuk mengunggah bukti foto pelaksanaan program di lapangan!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {documentations.map((doc) => {
                  const isImage = doc.file && !doc.file.toLowerCase().endsWith(".pdf");
                  const canDelete = user?.role === "STAFF_OPERATIONAL" || user?.id === doc.uploaded_by;

                  return (
                    <div key={doc.id} className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col">
                      {/* Media Area */}
                      <div className="aspect-video w-full relative bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800">
                        {isImage ? (
                          <img
                            src={getMediaUrl(doc.file)}
                            alt={doc.description}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-rose-500">
                            <FileText className="w-12 h-12" />
                            <span className="text-xs font-semibold">Dokumen PDF</span>
                          </div>
                        )}

                        {/* Top float elements */}
                        <div className="absolute top-3 left-3 bg-primary/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                          {doc.program_detail?.title || "Program"}
                        </div>

                        {canDelete && (
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="absolute top-3 right-3 p-1.5 bg-white/90 hover:bg-rose-600 hover:text-white text-slate-700 rounded-lg shadow-sm transition-all opacity-0 group-hover:opacity-100"
                            title="Hapus"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Content Area */}
                      <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                        
                        {/* Footer Details */}
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span>{doc.uploaded_by_detail?.first_name || "Petugas"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{new Date(doc.uploaded_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
