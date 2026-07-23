import { useState, useEffect } from "react";
import api from "@/lib/axios";
import useAuthStore from "@/store/authStore";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Loader2,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  Calendar,
  ArrowUpDown,
  UserCheck,
  RefreshCw,
  Award,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const maskEmail = (email, username) => {
  if (!email) return "";
  if (
    username === "penerima01" ||
    username === "penerima02" ||
    username === "penerima03" ||
    email.startsWith("penerima01@") ||
    email.startsWith("penerima02@") ||
    email.startsWith("penerima03@")
  ) {
    const parts = email.split("@");
    if (parts.length === 2) {
      const name = parts[0];
      const domain = parts[1];
      if (name.length > 2) {
        return name.slice(0, 2) + "*".repeat(name.length - 2) + "@" + domain;
      }
      return "*".repeat(name.length) + "@" + domain;
    }
    return "******";
  }
  return email;
};

const Beneficiaries = () => {
  const { user } = useAuthStore();
  const canManage =
    user?.role === "MANAGER" ||
    user?.role === "OPERATIONAL_STAFF" ||
    user?.role === "FIELD_STAFF" ||
    user?.role === "ADMIN";
  const canEditDelete =
    user?.role === "MANAGER" ||
    user?.role === "OPERATIONAL_STAFF" ||
    user?.role === "ADMIN";
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("ADD"); // ADD or EDIT
  const [isReplacementModalOpen, setIsReplacementModalOpen] = useState(false);
  const [selectedBeneficiary, setSelectedBeneficiary] = useState(null);

  // Detail View State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailBeneficiary, setDetailBeneficiary] = useState(null);

  // Sorting State
  const [sortField, setSortField] = useState(""); // "program", "gender", or ""
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"

  // Form State
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    birth_date: "",
    gender: "",
    program: "",
    date_provided: "",
  });

  const [replacementData, setReplacementData] = useState({
    program: "",
    date_replaced: "",
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

  const fetchPrograms = async () => {
    try {
      const response = await api.get("/programs/programs/");
      setPrograms(response.data);
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };

  useEffect(() => {
    fetchBeneficiaries();
    fetchPrograms();
  }, []);

  const handleOpenAddModal = () => {
    setModalType("ADD");
    setFormData({
      username: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      birth_date: "",
      gender: "",
      program: "",
      date_provided: "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (beneficiary) => {
    setModalType("EDIT");
    setSelectedBeneficiary(beneficiary);
    setFormData({
      username: beneficiary.username,
      first_name: beneficiary.first_name,
      last_name: beneficiary.last_name,
      phone_number: beneficiary.phone_number || "",
      birth_date: beneficiary.birth_date || "",
      gender: beneficiary.gender || "",
      program: beneficiary.program ? beneficiary.program.toString() : "",
      date_provided: beneficiary.date_provided || "",
    });
    setFormError("");
    setIsModalOpen(true);
  };

  const handleRowClick = (beneficiary) => {
    setDetailBeneficiary(beneficiary);
    setIsDetailModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (modalType === "EDIT" && !formData.username.trim()) {
      setFormError("Username cannot be empty.");
      return;
    }

    setFormSubmitting(true);
    setFormError("");

    // Prepare submit data, convert empty fields to null, parse program ID
    const submitData = {
      ...formData,
      program:
        formData.program && formData.program !== ""
          ? parseInt(formData.program)
          : null,
      birth_date: formData.birth_date || null,
      date_provided: formData.date_provided || null,
      gender: formData.gender || null,
    };

    try {
      if (modalType === "ADD") {
        await api.post("/users/beneficiaries/", submitData);
      } else {
        await api.put(
          `/users/beneficiaries/${selectedBeneficiary.id}/`,
          submitData,
        );
      }
      setIsModalOpen(false);
      fetchBeneficiaries();
    } catch (error) {
      console.error("Error saving beneficiary:", error);
      const serverMsg =
        error.response?.data?.username?.[0] ||
        error.response?.data?.email?.[0] ||
        "Failed to save data. Please try again.";
      setFormError(serverMsg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleReplacementSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError("");
    try {
      await api.post(
        `/users/beneficiaries/${selectedBeneficiary.id}/add_replacement/`,
        {
          program: replacementData.program
            ? parseInt(replacementData.program)
            : null,
          date_replaced: replacementData.date_replaced,
        },
      );
      setIsReplacementModalOpen(false);
      fetchBeneficiaries();
    } catch (error) {
      console.error("Error adding replacement:", error);
      setFormError("Failed to add replacement date.");
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      window.confirm(
        "Are you sure you want to delete this beneficiary account?",
      )
    ) {
      try {
        await api.delete(`/users/beneficiaries/${id}/`);
        fetchBeneficiaries();
      } catch (error) {
        console.error("Error deleting beneficiary:", error);
        alert("Failed to delete data.");
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter Logic
  const filteredBeneficiaries = beneficiaries.filter((item) => {
    const fullName =
      `${item.first_name || ""} ${item.last_name || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      item.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.phone_number && item.phone_number.includes(searchTerm));
    return matchesSearch;
  });

  // Sorting Logic
  const sortedBeneficiaries = [...filteredBeneficiaries].sort((a, b) => {
    if (!sortField) return 0;

    if (sortField === "program") {
      const valA = a.program_detail?.title || "";
      const valB = b.program_detail?.title || "";
      if (valA !== valB) {
        if (valA < valB) return sortDirection === "asc" ? -1 : 1;
        if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      }
      const ageA = a.age !== null ? a.age : -1;
      const ageB = b.age !== null ? b.age : -1;
      return sortDirection === "asc" ? ageA - ageB : ageB - ageA;
    } else if (sortField === "age") {
      const ageA = a.age !== null ? a.age : -1;
      const ageB = b.age !== null ? b.age : -1;
      if (ageA !== ageB) {
        return sortDirection === "asc" ? ageA - ageB : ageB - ageA;
      }
      const valA = a.program_detail?.title || "";
      const valB = b.program_detail?.title || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    } else if (sortField === "gender") {
      const valA = a.gender || "";
      const valB = b.gender || "";
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
            Beneficiary Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage user accounts and profile data for Puspadi Bali
            beneficiaries.
          </p>
        </div>
        {canManage && (
          <Button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 self-start md:self-auto"
          >
            <Plus className="w-4 h-4" />
            Add Beneficiary
          </Button>
        )}
      </div>

      {/* Filter, Search and Sorting Section */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search beneficiary by name, username, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 focus:bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">
            Sort By:
          </label>
          <select
            value={sortField}
            onChange={(e) => {
              if (e.target.value === "") {
                setSortField("");
              } else {
                handleSort(e.target.value);
              }
            }}
            className="px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 text-xs focus:ring-2 focus:ring-primary outline-none"
          >
            <option value="">Default (No Sorting)</option>
            <option value="program">Program</option>
            <option value="age">Age</option>
          </select>

          {sortField && (
            <button
              onClick={() =>
                setSortDirection(sortDirection === "asc" ? "desc" : "asc")
              }
              className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
              title={sortDirection === "asc" ? "Ascending" : "Descending"}
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Table Data Penerima */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-slate-500">
              Loading beneficiary data...
            </p>
          </div>
        ) : sortedBeneficiaries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2">
            <UserIcon className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">
              No beneficiary data
            </p>
            <p className="text-sm text-slate-400 text-center max-w-md">
              Try changing your search terms or adding a new beneficiary
              account.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Full Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Gender
                  </th>
                  <th
                    className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleSort("age")}
                  >
                    <div className="flex items-center gap-1">
                      Age{" "}
                      {sortField === "age" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </div>
                  </th>
                  <th
                    className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => handleSort("program")}
                  >
                    <div className="flex items-center gap-1">
                      Program{" "}
                      {sortField === "program" &&
                        (sortDirection === "asc" ? "▲" : "▼")}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Date Provided
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    All Programs
                  </th>
                  {canEditDelete && (
                    <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedBeneficiaries.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                          <UserIcon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                            {`${item.first_name || ""} ${item.last_name || ""}`.trim() ||
                              item.username}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-medium">
                            {maskEmail(item.email, item.username)}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {item.gender === "L"
                          ? "Male"
                          : item.gender === "P"
                            ? "Female"
                            : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {item.age !== null ? `${item.age} yrs` : "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item.program_detail?.title || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {item.date_provided || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {/* Program utama */}
                        {item.program_detail && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            {item.program_detail.title}
                          </span>
                        )}
                        {/* Program dari replacements */}
                        {item.replacements &&
                          item.replacements
                            .filter((rep) => rep.program_detail)
                            .map((rep) => (
                              <span
                                key={rep.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                              >
                                {rep.program_detail.title}
                              </span>
                            ))}
                        {!item.program_detail &&
                          (!item.replacements ||
                            item.replacements.length === 0) && (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                      </div>
                    </td>
                    {canEditDelete && (
                      <td
                        className="px-6 py-4 text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
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
                            title="Delete"
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

      {/* Detail Beneficiary Modal */}
      {isDetailModalOpen && detailBeneficiary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Beneficiary Details
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
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-850 pb-5">
                <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {detailBeneficiary.first_name?.[0]?.toUpperCase() ||
                    detailBeneficiary.username?.[0]?.toUpperCase() ||
                    "B"}
                </div>
                <div>
                  <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                    {`${detailBeneficiary.first_name || ""} ${detailBeneficiary.last_name || ""}`.trim() ||
                      detailBeneficiary.username}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Username: {detailBeneficiary.username}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {maskEmail(
                      detailBeneficiary.email,
                      detailBeneficiary.username,
                    )}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Phone Number
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {detailBeneficiary.phone_number || "-"}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> Date of Birth
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {detailBeneficiary.birth_date || "-"}
                    {detailBeneficiary.age !== null &&
                      ` (${detailBeneficiary.age} yrs)`}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5" /> Gender
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {detailBeneficiary.gender === "L"
                      ? "Male"
                      : detailBeneficiary.gender === "P"
                        ? "Female"
                        : "-"}
                  </p>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" /> Program History
                  </span>
                  <div className="space-y-2">
                    {/* Program Utama */}
                    {detailBeneficiary.program_detail && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                          {detailBeneficiary.program_detail.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({detailBeneficiary.date_provided || "date n/a"})
                        </span>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-wide">
                          Current
                        </span>
                      </div>
                    )}
                    {/* Program dari replacements */}
                    {detailBeneficiary.replacements &&
                    detailBeneficiary.replacements.length > 0
                      ? detailBeneficiary.replacements.map((rep) => (
                          <div key={rep.id} className="flex items-center gap-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                              {rep.program_detail?.title || "Unknown Program"}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ({rep.date_replaced})
                            </span>
                          </div>
                        ))
                      : !detailBeneficiary.program_detail && (
                          <p className="text-sm font-medium text-slate-400">
                            No program assigned
                          </p>
                        )}
                  </div>
                  {canManage && (
                    <button
                      onClick={() => {
                        setSelectedBeneficiary(detailBeneficiary);
                        setIsReplacementModalOpen(true);
                      }}
                      className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 border border-primary/30 hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-all"
                    >
                      {canEditDelete ? "+ Add Program" : "+ Add Replacement Date"}
                    </button>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" /> Last Modified By
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {detailBeneficiary.updated_by
                      ? `User ID ${detailBeneficiary.updated_by}`
                      : "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
              <Button onClick={() => setIsDetailModalOpen(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Dialog Add/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {modalType === "ADD" ? "Add Beneficiary" : "Edit Beneficiary"}
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
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Siti"
                      value={formData.first_name}
                      onChange={(e) =>
                        setFormData({ ...formData, first_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Aminah"
                      value={formData.last_name}
                      onChange={(e) =>
                        setFormData({ ...formData, last_name: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
                </div>

                {modalType === "EDIT" && (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="beneficiary01"
                        value={formData.username}
                        onChange={(e) =>
                          setFormData({ ...formData, username: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="0812xxxxxxxx"
                    value={formData.phone_number}
                    onChange={(e) =>
                      setFormData({ ...formData, phone_number: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birth_date}
                      onChange={(e) =>
                        setFormData({ ...formData, birth_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Gender
                    </label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) =>
                        setFormData({ ...formData, gender: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Gender</option>
                      <option value="L">Male</option>
                      <option value="P">Female</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Program
                  </label>
                  <select
                    required
                    value={formData.program}
                    onChange={(e) =>
                      setFormData({ ...formData, program: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  >
                    <option value="">Select Program</option>
                    {programs.map((prog) => (
                      <option key={prog.id} value={prog.id.toString()}>
                        {prog.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Date Provided
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_provided}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          date_provided: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    />
                  </div>
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
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={formSubmitting}
                  className="flex items-center gap-2"
                >
                  {formSubmitting && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  {modalType === "ADD" ? "Save" : "Update"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Dialog Add Replacement */}
      {isReplacementModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                {canEditDelete ? "Add Program / Replacement" : "Add Replacement Date"}
              </h3>
              <button
                onClick={() => setIsReplacementModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleReplacementSubmit}>
              <div className="p-6 space-y-4">
                {canEditDelete && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                      Program
                    </label>
                    <select
                      required
                      value={replacementData.program}
                      onChange={(e) =>
                        setReplacementData({
                          ...replacementData,
                          program: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                    >
                      <option value="">Select Program</option>
                      {programs.map((prog) => (
                        <option key={prog.id} value={prog.id.toString()}>
                          {prog.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    {canEditDelete ? "Start Date" : "Replacement Date"}
                  </label>
                  <input
                    type="date"
                    required={!canEditDelete}
                    value={replacementData.date_replaced}
                    onChange={(e) =>
                      setReplacementData({
                        ...replacementData,
                        date_replaced: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50 dark:bg-slate-955 focus:bg-white text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsReplacementModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formSubmitting}>
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

export default Beneficiaries;
