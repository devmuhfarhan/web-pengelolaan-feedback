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
  Link as LinkIcon,
  Info
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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

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
  const [editDriveLink, setEditDriveLink] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState("");

  // General Upload Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadFilePreview, setUploadFilePreview] = useState("");
  const [uploadDriveLink, setUploadDriveLink] = useState("");
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
      
      // Update selectedDoc if it is open
      if (selectedDoc) {
        const updated = response.data.find(d => d.id === selectedDoc.id);
        if (updated) {
          setSelectedDoc(updated);
        }
      }
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
    if (window.confirm("Are you sure you want to delete this documentation?")) {
      try {
        await api.delete(`/programs/documentations/${id}/`);
        setIsDetailModalOpen(false);
        fetchDocumentations();
      } catch (error) {
        console.error("Error deleting documentation:", error);
        alert("Failed to delete documentation.");
      }
    }
  };

  const handleOpenDetailModal = (doc) => {
    setSelectedDoc(doc);
    setEditFormData({
      program: doc.program ? doc.program.toString() : "",
      description: doc.description,
    });
    setEditDriveLink(doc.drive_link || "");
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
        setEditError("File is too large. Maximum file size is 10MB.");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".jpg") && !file.name.toLowerCase().endsWith(".jpeg")) {
        setEditError("Unsupported file format. Please upload JPG or JPEG format only.");
        return;
      }
      setEditFile(file);
      setEditError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setEditFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editFormData.description.trim()) {
      setEditError("Please enter description.");
      return;
    }

    setEditSubmitting(true);
    setEditError("");

    const updateData = new FormData();
    if (editFormData.program && editFormData.program !== "none") {
      updateData.append("program", editFormData.program);
    } else {
      updateData.append("program", "");
    }
    updateData.append("description", editFormData.description);
    updateData.append("drive_link", editDriveLink.trim());
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
      setEditError("Failed to update documentation. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleUploadFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setUploadError("File is too large. Maximum file size is 10MB.");
        return;
      }
      const allowedTypes = ["image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".jpg") && !file.name.toLowerCase().endsWith(".jpeg")) {
        setUploadError("Unsupported file format. Please upload JPG or JPEG format only.");
        return;
      }
      setUploadFile(file);
      setUploadError("");

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadFilePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadFile && !uploadDriveLink.trim()) {
      setUploadError("Please select a JPG photo file or enter a Google Drive link.");
      return;
    }

    setUploadSubmitting(true);
    setUploadError("");
    setUploadSuccess("");

    const formData = new FormData();
    if (uploadFile) {
      formData.append("file", uploadFile);
    }
    if (uploadDriveLink.trim()) {
      formData.append("drive_link", uploadDriveLink);
    }
    formData.append("description", uploadDescription);

    try {
      await api.post("/programs/documentations/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadSuccess("General documentation saved successfully!");
      setUploadDescription("");
      setUploadDriveLink("");
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
      setUploadError("Failed to upload general documentation. Please try again.");
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
            Field Documentation
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Photo archives and general report files for Puspadi Bali.
          </p>
        </div>
        {canUpload && (
          <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
            <Button
              onClick={() => {
                setUploadDescription("");
                setUploadDriveLink("");
                setUploadFile(null);
                setUploadFilePreview("");
                setUploadError("");
                setUploadSuccess("");
                setIsUploadModalOpen(true);
              }}
              className="h-11 px-5 flex items-center gap-2 font-bold shadow-md rounded-xl"
            >
              <Plus className="w-5 h-5" /> Upload General Documentation
            </Button>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle className="text-xl">
                  Upload General Documentation
                </DialogTitle>
                <DialogDescription>
                  Upload file as JPG/JPEG photo, or include a drive link.
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

                <div className="grid grid-cols-1 gap-4">
                  {/* File Upload Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                      Upload Photo (JPG/JPEG Format)
                    </label>
                    <div
                      onClick={() => uploadFileInputRef.current?.click()}
                      className="w-full py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-955 transition-all text-center"
                    >
                      <input
                        ref={uploadFileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        onChange={handleUploadFileChange}
                        className="hidden"
                      />
                      {uploadFilePreview ? (
                        <div className="relative rounded-lg overflow-hidden border border-slate-200 w-full max-h-[140px] flex justify-center bg-slate-100">
                          <img
                            src={uploadFilePreview}
                            alt="preview"
                            className="h-full object-cover max-h-[140px]"
                          />
                        </div>
                      ) : (
                        <>
                          <UploadCloud className="w-8 h-8 text-primary" />
                          <div className="text-center">
                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              Click to browse photo file
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Format: JPG / JPEG only (Maximum 10MB)
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Drive Link Input Option */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5 text-slate-400" /> Google Drive Link (Alternative)
                    </label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={uploadDriveLink}
                      onChange={(e) => setUploadDriveLink(e.target.value)}
                      className="h-10 text-xs rounded-lg"
                    />
                    <p className="text-[10px] text-slate-400">Enter Drive link to save internal storage.</p>
                  </div>
                </div>

                {/* Description input */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                    Evidence Description
                  </label>
                  <textarea
                    placeholder="Write description about this documentation..."
                    value={uploadDescription}
                    onChange={(e) => setUploadDescription(e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-55 dark:bg-slate-955 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary text-slate-850 dark:text-slate-100"
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setIsUploadModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={uploadSubmitting}
                    className="font-semibold px-6"
                  >
                    {uploadSubmitting && (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    )}
                    Save Archive
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
          General Documentation Gallery
        </h2>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">Loading documentation photos...</p>
          </div>
        ) : documentations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-2">
            <ImageIcon className="w-12 h-12 text-slate-300 dark:text-slate-700 animate-pulse" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
              No documentation photos yet
            </p>
            <p className="text-sm text-slate-400 text-center max-w-sm">
              No photo evidence of field program implementation has been uploaded yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {documentations.map((doc) => {
              const isImage = doc.file && !doc.file.toLowerCase().endsWith(".pdf");

              return (
                <div
                  key={doc.id}
                  className="group bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  {/* Media Area */}
                  <div
                    onClick={() => handleOpenDetailModal(doc)}
                    className="aspect-video w-full relative bg-slate-100 dark:bg-slate-900 overflow-hidden flex items-center justify-center border-b border-slate-100 dark:border-slate-800 cursor-pointer"
                    title="Click to view details"
                  >
                    {doc.file ? (
                      isImage ? (
                        <img
                          src={getMediaUrl(doc.file)}
                          alt={doc.description || "Documentation"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-rose-500">
                          <FileText className="w-12 h-12" />
                          <span className="text-xs font-semibold">
                            PDF Document
                          </span>
                        </div>
                      )
                    ) : doc.drive_link ? (
                      <div className="flex flex-col items-center gap-2 text-blue-500">
                        <LinkIcon className="w-12 h-12 text-blue-500" />
                        <span className="text-xs font-semibold">
                          Google Drive Link
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-slate-400">
                        <Info className="w-12 h-12" />
                        <span className="text-xs font-semibold">
                          No file
                        </span>
                      </div>
                    )}

                    {/* Top float elements */}
                    <div className="absolute top-3 left-3 bg-primary/95 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-xs">
                      {doc.program_detail?.title || "GENERAL"}
                    </div>

                    {/* Quick View Hover Indicator */}
                    <div className="absolute inset-0 bg-slate-955/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/95 text-slate-800 dark:bg-slate-900/95 dark:text-slate-100 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-sm uppercase tracking-wider">
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </span>
                    </div>
                  </div>

                  {/* Content Area */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                      {doc.description || (doc.drive_link ? "Google Drive Link" : "(No description)")}
                    </p>

                    {/* Footer Details */}
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-400" />
                        <span>
                          {doc.uploaded_by_detail?.username || "Staff"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>
                          {new Date(doc.uploaded_at).toLocaleDateString(
                            "en-US",
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
                  ? "Edit Documentation"
                  : "Activity Documentation Details"}
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
                      Program (Optional)
                    </label>
                    <Select
                      value={editFormData.program}
                      onValueChange={(val) =>
                        setEditFormData({ ...editFormData, program: val })
                      }
                    >
                      <SelectTrigger className="w-full h-10 border border-slate-200 dark:border-slate-855 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100">
                        <SelectValue placeholder="-- General (Not tied to program) --">
                          {programs.find(
                            (p) =>
                              p.id.toString() ===
                              editFormData.program.toString(),
                          )?.title || "-- General (Not tied to program) --"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">
                          -- General (Not tied to program) --
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
                      Change Documentation File (JPG/JPEG)
                    </label>
                    <div
                      onClick={() => editFileInputRef.current?.click()}
                      className="w-full py-5 px-4 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-955 transition-all text-center"
                    >
                      <input
                        ref={editFileInputRef}
                        type="file"
                        accept=".jpg,.jpeg,image/jpeg"
                        onChange={handleEditFileChange}
                        className="hidden"
                      />
                      {editFilePreview ? (
                        <div className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-350">
                          <img
                            src={editFilePreview}
                            alt="new preview"
                            className="w-10 h-10 object-cover rounded-md"
                          />
                          <span>New Image Selected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-slate-500 justify-center w-full">
                          <UploadCloud className="w-4 h-4 text-primary" />
                          <span>Click to replace with new JPG image</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Change Drive Link Input */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" /> Google Drive Link
                    </label>
                    <Input
                      placeholder="https://drive.google.com/..."
                      value={editDriveLink}
                      onChange={(e) => setEditDriveLink(e.target.value)}
                      className="h-10 text-xs rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Description / Evidence Information
                    </label>
                    <textarea
                      placeholder="Enter description of documentation photo..."
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          description: e.target.value,
                        })
                      }
                      rows="4"
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary outline-none transition-all text-slate-800 dark:text-slate-100"
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
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={editSubmitting}
                    className="flex items-center gap-2"
                  >
                    {editSubmitting && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </form>
            ) : (
              <div className="p-6 space-y-5">
                {/* Media Preview Box */}
                <div className="w-full overflow-hidden flex justify-center bg-slate-100 dark:bg-slate-950 rounded-xl relative max-h-[300px] border border-slate-200 dark:border-slate-800">
                  {selectedDoc.file ? (
                    selectedDoc.file.toLowerCase().endsWith(".pdf") ? (
                      <a
                        href={getMediaUrl(selectedDoc.file)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex flex-col items-center justify-center py-16 text-rose-500 hover:text-rose-450 w-full transition-all"
                      >
                        <FileText className="w-16 h-16 mb-2" />
                        <span className="text-sm font-bold flex items-center gap-1">
                          Open PDF Documentation File{" "}
                          <ExternalLink className="w-4 h-4" />
                        </span>
                      </a>
                    ) : (
                      <img
                        src={getMediaUrl(selectedDoc.file)}
                        alt={selectedDoc.description || "Documentation"}
                        className="max-h-[300px] w-auto object-contain rounded-xl"
                      />
                    )
                  ) : selectedDoc.drive_link ? (
                    <a
                      href={selectedDoc.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex flex-col items-center justify-center py-16 text-blue-500 hover:text-blue-400 w-full transition-all"
                    >
                      <LinkIcon className="w-16 h-16 mb-2 text-blue-500" />
                      <span className="text-sm font-bold flex items-center gap-1">
                        Open Google Drive Link <ExternalLink className="w-4 h-4" />
                      </span>
                    </a>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                      <Info className="w-16 h-16 mb-2" />
                      <span className="text-sm font-semibold">No file/drive link</span>
                    </div>
                  )}
                </div>

                {/* Meta details list */}
                <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-150 dark:border-slate-800">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Program
                    </span>
                    <p className="text-xs font-bold text-primary">
                      {selectedDoc.program_detail?.title || "GENERAL"}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Uploader
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {selectedDoc.uploaded_by_detail
                        ? `${selectedDoc.uploaded_by_detail.username || ""}`.trim()
                        : "Staff"}
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Uploaded Date
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-350">
                      {new Date(selectedDoc.uploaded_at).toLocaleString(
                        "en-US",
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
                  {selectedDoc.drive_link && (
                    <div className="space-y-1 col-span-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Google Drive Link
                      </span>
                      <a 
                        href={selectedDoc.drive_link} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-semibold text-blue-500 hover:text-blue-400 flex items-center gap-1 mt-0.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Drive Link
                      </a>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wide">
                    Activity Description
                  </h4>
                  <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-955 p-4 rounded-xl border border-slate-100 dark:border-slate-850 whitespace-pre-line">
                    {selectedDoc.description || "(No description)"}
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
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </Button>
                    </div>
                  ) : (
                    <div />
                  )}
                  <Button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="h-9 text-xs font-semibold"
                  >
                    Close
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
