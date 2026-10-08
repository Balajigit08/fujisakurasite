"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FaCheck, FaArrowRight, FaDownload } from "react-icons/fa";
import { MdLogout } from "react-icons/md";

import CareerManagement from "./admin-components/CareerManagement/CareerManagement";
import AppliedApplications from "./admin-components/AppliedApplications/AppliedApplications";
import ClientContact from "./admin-components/ClientContact/ClientContact";
import PositionFormModal from "./admin-components/PositionFormModal/PositionFormModal";
import PositionPreviewModal from "./admin-components/PositionPreviewModal/PositionPreviewModal";
import Footer from "@/app/footer/page";

const APP_STATUS_COLORS = {
  new: "bg-blue-50 text-blue-600 border-blue-200",
  reviewed: "bg-amber-50 text-amber-700 border-amber-200",
  shortlisted: "bg-emerald-50 text-emerald-600 border-emerald-200",
  rejected: "bg-red-50 text-red-500 border-red-200",
};

const INQUIRY_STATUS_COLORS = {
  new: "bg-blue-50 text-blue-600 border-blue-200",
  in_progress: "bg-amber-50 text-amber-700 border-amber-200",
  resolved: "bg-emerald-50 text-emerald-600 border-emerald-200",
  archived: "bg-gray-100 text-gray-500 border-gray-200",
};

const APP_STATUS_OPTIONS = ["new", "reviewed", "shortlisted", "rejected"];
const INQUIRY_STATUS_OPTIONS = ["new", "in_progress", "resolved", "archived"];

export default function AdminHubPage() {
  const router = useRouter();
  const [activeView, setActiveViewState] = useState("hub");

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveViewState(params.get("view") || "hub");
    };

    window.addEventListener("popstate", handlePopState);
    handlePopState();

    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const setActiveView = (newView) => {
    setActiveViewState(newView);
    const url = newView === "hub" ? "/admin" : `/admin?view=${newView}`;
    window.history.pushState({ view: newView }, "", url);
  };

  const [positions, setPositions] = useState([]);
  const [careersLoading, setCareersLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [previewPosition, setPreviewPosition] = useState(null);

  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(true);
  const [appSearch, setAppSearch] = useState("");
  const [appStatusFilter, setAppStatusFilter] = useState("all");
  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [deletingAppId, setDeletingAppId] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  const [inquiries, setInquiries] = useState([]);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryStatusFilter, setInquiryStatusFilter] = useState("all");
  const [updatingInquiryId, setUpdatingInquiryId] = useState(null);
  const [deletingInquiryId, setDeletingInquiryId] = useState(null);
  const [selectedInquiry, setSelectedInquiry] = useState(null);

  useEffect(() => {
    if (!selectedInquiry && !selectedApp) return;
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setSelectedInquiry(null);
        setSelectedApp(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedInquiry, selectedApp]);

  const [toastMessage, setToastMessage] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [savingJob, setSavingJob] = useState(false);
  const [deletingJob, setDeletingJob] = useState(false);

  const showToast = (text, type = "success") => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/jobs");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPositions(data.jobs || []);
    } catch {
      showToast("Failed to load positions.", "error");
    } finally {
      setCareersLoading(false);
    }
  }, []);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/applications");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setApplications(data.applications || []);
    } catch {
      showToast("Failed to load applications.", "error");
    } finally {
      setAppsLoading(false);
    }
  }, []);

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/inquiries");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch {
      showToast("Failed to load inquiries.", "error");
    } finally {
      setInquiriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchInquiries();
  }, [fetchJobs, fetchApplications, fetchInquiries]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login");
    }
  };

  const handleOpenCreateModal = () => {
    setEditingPosition(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (pos) => {
    setEditingPosition(pos);
    setIsModalOpen(true);
  };

  const handleSavePosition = async (payload) => {
    setSavingJob(true);
    try {
      const isEdit = !!editingPosition;
      const url = isEdit
        ? `/api/admin/jobs/${editingPosition.id}`
        : "/api/admin/jobs";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        showToast(data.error || "Failed to save position.", "error");
        return;
      }

      showToast(isEdit ? "Position updated successfully." : "Position added successfully.");
      setIsModalOpen(false);
      setEditingPosition(null);
      await fetchJobs();
    } catch {
      showToast("Failed to save position.", "error");
    } finally {
      setSavingJob(false);
    }
  };

  const handleToggleStatus = async (job) => {
    try {
      const res = await fetch(`/api/admin/jobs/${job.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !job.is_active }),
      });
      if (!res.ok) throw new Error();
      showToast(job.is_active ? "Position deactivated." : "Position activated.");
      await fetchJobs();
    } catch {
      showToast("Failed to update status.", "error");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    setDeletingJob(true);
    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { method: "DELETE" });

      if (!res.ok) {
        const data = await res.json();
        if (res.status === 400 && data.error?.includes("existing applications")) {
          const deactivateRes = await fetch(
            `/api/admin/jobs/${jobId}/status`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ is_active: false }),
            }
          );
          if (deactivateRes.ok) {
            showToast("Position has applications — deactivated instead of deleted.");
          } else {
            showToast("Could not delete or deactivate this position.", "error");
          }
          await fetchJobs();
          return;
        }
        showToast(data.error || "Failed to delete position.", "error");
        return;
      }

      showToast("Position deleted successfully.");
      await fetchJobs();
    } catch {
      showToast("Failed to delete position.", "error");
    } finally {
      setDeletingJob(false);
    }
  };

  const handleAppStatusChange = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      const res = await fetch(`/api/admin/applications/${appId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      showToast("Application status updated.");
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingAppId(null);
    }
  };

  const handleDownloadResume = (appId, fullName) => {
    const a = document.createElement("a");
    a.href = `/api/admin/resumes/${appId}`;
    a.download = `${fullName.replace(/\s+/g, "_")}_resume.pdf`;
    a.click();
  };

  const handleDeleteApp = async (appId) => {
    if (!confirm("Delete this candidate application?")) return;
    setDeletingAppId(appId);
    try {
      const res = await fetch(`/api/admin/applications/${appId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setApplications((prev) => prev.filter((a) => a.id !== appId));
      showToast("Application deleted.");
    } catch {
      showToast("Failed to delete application.", "error");
    } finally {
      setDeletingAppId(null);
    }
  };

  const handleInquiryStatusChange = async (inquiryId, newStatus) => {
    setUpdatingInquiryId(inquiryId);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId ? { ...inq, status: newStatus } : inq
        )
      );
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }
      showToast("Inquiry status updated.");
    } catch {
      showToast("Failed to update status.", "error");
    } finally {
      setUpdatingInquiryId(null);
    }
  };

  const handleDeleteInquiry = async (inquiryId) => {
    if (!confirm("Delete this inquiry message?")) return;
    setDeletingInquiryId(inquiryId);
    try {
      const res = await fetch(`/api/admin/inquiries/${inquiryId}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      setInquiries((prev) => prev.filter((i) => i.id !== inquiryId));
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(null);
      }
      showToast("Inquiry deleted.");
    } catch {
      showToast("Failed to delete inquiry.", "error");
    } finally {
      setDeletingInquiryId(null);
    }
  };

  const formatDate = (val) => {
    if (!val) return "—";
    return new Date(val).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div data-navbar="light" className="overflow-x-hidden w-full max-w-[2050px] mx-auto font-sans min-h-screen flex flex-col justify-between pt-12 sm:pt-28 lg:pt-24 bg-[#EDF6FA]">
      {toastMessage && (
        <div
          className={`fixed top-24 right-4 z-[10000] px-5 py-3 rounded-xl text-white flex items-center gap-3 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 ${toastMessage.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}
        >
          <FaCheck size={16} />
          <span>{toastMessage.text}</span>
        </div>
      )}
      <main id="admin-main-content" className="flex-1 w-full max-w-[1800px] 2xl:max-w-[2050px] mx-auto px-[clamp(1rem,2vw,2rem)] py-6">
        <div className="w-full">
          {activeView === "hub" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
                <div>
                  <h1 className="flex flex-wrap items-baseline gap-x-3">
                    <span className="text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.2vw,2.75rem)] text-[#1B1B1B]">
                      Admin
                    </span>
                    <span className="text-3xl sm:text-4xl md:text-[clamp(2.25rem,3vw,3.5rem)] font-bold text-[#34CBEA]">
                      Dashboard
                    </span>
                  </h1>
                  <p className="mt-2 text-black text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)]">
                    Select an option below to manage site content.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-full bg-gray-100 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors font-bold text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] cursor-pointer disabled:opacity-50 shrink-0 self-start sm:self-auto shadow-xs"
                >
                  <MdLogout size={20} />
                  <span>Logout</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 pt-2">
                <div
                  onClick={() => setActiveView("careers")}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="p-6 sm:p-8 text-center">
                      <h2 className="text-xl sm:text-2xl md:text-[clamp(1.35rem,1.65vw,2rem)] font-bold text-[#1B1B1B]">
                        Career Management
                      </h2>
                      <p className="mt-2.5 text-black text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.3rem)]">
                        Add, edit, or remove available job positions.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 sm:pb-8 flex justify-center">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#ffb54e] text-black flex items-center justify-center group-hover:bg-[#e09e42] transition-colors shadow-xs">
                      <FaArrowRight size={20} />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveView("applications")}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="p-6 sm:p-8 text-center">
                      <h2 className="text-xl sm:text-2xl md:text-[clamp(1.35rem,1.65vw,2rem)] font-bold text-[#1B1B1B]">
                        Applied Applications
                      </h2>
                      <p className="mt-2.5 text-black text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.3rem)]">
                        View candidate applications &amp; download resumes.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 sm:pb-8 flex justify-center">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#ffb54e] text-black flex items-center justify-center group-hover:bg-[#e09e42] transition-colors shadow-xs">
                      <FaArrowRight size={20} />
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setActiveView("inquiries")}
                  className="bg-white rounded-3xl border border-gray-200 shadow-xs hover:shadow-md transition-shadow cursor-pointer flex flex-col justify-between overflow-hidden group"
                >
                  <div>
                    <div className="p-6 sm:p-8 text-center">
                      <h2 className="text-xl sm:text-2xl md:text-[clamp(1.35rem,1.65vw,2rem)] font-bold text-[#1B1B1B]">
                        Client Contact
                      </h2>
                      <p className="mt-2.5 text-black text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.3rem)]">
                        Check client inquiries &amp; messages from website.
                      </p>
                    </div>
                  </div>
                  <div className="px-6 pb-6 sm:pb-8 flex justify-center">
                    <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#ffb54e] text-black flex items-center justify-center group-hover:bg-[#e09e42] transition-colors shadow-xs">
                      <FaArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeView === "careers" && (
            <CareerManagement
              onBack={() => setActiveView("hub")}
              positions={positions}
              loading={careersLoading}
              onAddPosition={handleOpenCreateModal}
              onEditPosition={handleOpenEditModal}
              onDeletePosition={handleDeleteJob}
              onPreviewPosition={(j) => setPreviewPosition(j)}
              onToggleStatus={handleToggleStatus}
            />
          )}

          {activeView === "applications" && (
            <AppliedApplications
              onBack={() => setActiveView("hub")}
              applications={applications}
              loading={appsLoading}
              appSearch={appSearch}
              setAppSearch={setAppSearch}
              appStatusFilter={appStatusFilter}
              setAppStatusFilter={setAppStatusFilter}
              onStatusChange={handleAppStatusChange}
              onSelectApp={setSelectedApp}
              onDownloadResume={handleDownloadResume}
              onDeleteApp={handleDeleteApp}
              updatingAppId={updatingAppId}
              deletingAppId={deletingAppId}
              statusOptions={APP_STATUS_OPTIONS}
              statusColors={APP_STATUS_COLORS}
              formatDate={formatDate}
            />
          )}

          {activeView === "inquiries" && (
            <ClientContact
              onBack={() => setActiveView("hub")}
              inquiries={inquiries}
              loading={inquiriesLoading}
              inquirySearch={inquirySearch}
              setInquirySearch={setInquirySearch}
              inquiryStatusFilter={inquiryStatusFilter}
              setInquiryStatusFilter={setInquiryStatusFilter}
              onStatusChange={handleInquiryStatusChange}
              onSelectInquiry={setSelectedInquiry}
              onDeleteInquiry={handleDeleteInquiry}
              updatingInquiryId={updatingInquiryId}
              deletingInquiryId={deletingInquiryId}
              statusOptions={INQUIRY_STATUS_OPTIONS}
              statusColors={INQUIRY_STATUS_COLORS}
              formatDate={formatDate}
            />
          )}
        </div>
      </main>

      <PositionFormModal
        key={
          editingPosition
            ? `edit-${editingPosition.id}`
            : isModalOpen
              ? "create-open"
              : "create-closed"
        }
        isOpen={isModalOpen}
        editingPosition={editingPosition}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPosition(null);
        }}
        onSave={handleSavePosition}
        saving={savingJob}
      />

      <PositionPreviewModal
        previewPosition={previewPosition}
        onClose={() => setPreviewPosition(null)}
        onEdit={handleOpenEditModal}
      />

      {selectedApp && (
        <div
          onClick={() => setSelectedApp(null)}
          onWheel={(e) => e.stopPropagation()}
          className="fixed inset-0 z-[999] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overscroll-contain"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
        relative
        w-full
        max-w-2xl
        bg-white
        rounded-2xl
        shadow-2xl
        border border-gray-200
        overflow-hidden
        animate-in fade-in zoom-in-95 duration-200
        max-h-[90vh]
        flex flex-col
      "
          >
            {/* Header */}
            <div className="relative px-5 py-5 sm:px-8 sm:py-6 border-b border-gray-100 shrink-0">
              <div className="pr-10">
                <h3 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.7vw,2rem)] font-bold text-[#1B1B1B]">
                  Applicant Details
                </h3>

                <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.9rem,1vw,1.1rem)] text-gray-500">
                  Applied on {formatDate(selectedApp.created_at)}
                </p>
              </div>

              <button
                onClick={() => setSelectedApp(null)}
                className="
            absolute
            top-5
            right-5
            w-9
            h-9
            flex
            items-center
            justify-center
            rounded-full
            text-gray-400
            hover:text-gray-700
            hover:bg-gray-100
            transition-colors
            cursor-pointer
            text-lg
          "
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-5 sm:px-8 sm:py-7">
              <div className="space-y-6">

                {/* Full Name */}
                <div>
                  <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                    Full Name
                  </p>

                  <p className="mt-1 text-lg sm:text-xl md:text-[clamp(1.2rem,1.35vw,1.5rem)] font-bold text-[#1B1B1B] break-words">
                    {selectedApp.full_name}
                  </p>
                </div>

                {/* Applied Position */}
                <div>
                  <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                    Applied Position
                  </p>

                  <p className="mt-1 text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] font-semibold text-[#1B1B1B] break-words">
                    {selectedApp.job_title || "—"}
                  </p>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Email Address
                    </p>

                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="
                  mt-1
                  block
                  text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)]
                  text-[#556ee6]
                  hover:underline
                  font-medium
                  break-all
                "
                    >
                      {selectedApp.email}
                    </a>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Phone Number
                    </p>

                    {selectedApp.phone ? (
                      <a
                        href={`tel:${selectedApp.phone}`}
                        className="
                    mt-1
                    block
                    text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)]
                    text-gray-800
                    font-medium
                    break-words
                    hover:underline
                  "
                      >
                        {selectedApp.phone}
                      </a>
                    ) : (
                      <p className="mt-1 text-base sm:text-lg text-gray-400">
                        —
                      </p>
                    )}
                  </div>
                </div>

                {/* DOB + Qualification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Date of Birth
                    </p>

                    <p className="mt-1 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] font-medium text-gray-800">
                      {selectedApp.date_of_birth
                        ? formatDate(selectedApp.date_of_birth)
                        : "—"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Qualification
                    </p>

                    <p className="mt-1 text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] font-medium text-gray-800 break-words">
                      {selectedApp.qualification || "—"}
                    </p>
                  </div>
                </div>

                {/* Japanese + Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Japanese Bilingual / JLPT
                    </p>

                    <div className="mt-2">
                      {selectedApp.is_jp_bilingual ? (
                        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-600 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-semibold border border-emerald-200">
                          <span>✓</span>
                          <span>
                            Bilingual
                            {selectedApp.jp_level
                              ? ` (${selectedApp.jp_level})`
                              : ""}
                          </span>
                        </span>
                      ) : (
                        <span className="text-sm sm:text-base font-medium text-gray-500">
                          No / None
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Current Status
                    </p>

                    <div className="mt-2">
                      <span
                        className={`
                    inline-flex
                    items-center
                    px-3.5
                    py-1.5
                    rounded-full
                    text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)]
                    font-bold
                    border
                    ${APP_STATUS_COLORS[selectedApp.status] ||
                          "bg-gray-50 text-gray-700 border-gray-200"
                          }
                  `}
                      >
                        {selectedApp.status
                          ? selectedApp.status.charAt(0).toUpperCase() +
                          selectedApp.status.slice(1)
                          : "New"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div
              className="
          shrink-0
          px-5
          py-4
          sm:px-8
          sm:py-5
          border-t
          border-gray-100
          bg-white
          flex
          flex-col-reverse
          sm:flex-row
          sm:items-center
          sm:justify-between
          gap-3
        "
            >
              <button
                onClick={() =>
                  handleDownloadResume(
                    selectedApp.id,
                    selectedApp.full_name
                  )
                }
                className="
            inline-flex
            items-center
            justify-center
            gap-2.5
            w-full
            sm:w-auto
            px-6
            py-3
            bg-[#ffb54e]
            hover:bg-[#e09e42]
            text-black
            text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.15rem)]
            font-bold
            rounded-xl
            transition-colors
            cursor-pointer
            shadow-sm
          "
              >
                <FaDownload size={14} />
                <span>Download Resume</span>
              </button>

              <button
                onClick={() => setSelectedApp(null)}
                className="
            w-full
            sm:w-auto
            px-7
            py-3
            bg-gray-100
            hover:bg-gray-200
            text-gray-800
            text-sm sm:text-base md:text-[clamp(0.95rem,1.1vw,1.15rem)]
            font-bold
            rounded-xl
            transition-colors
            cursor-pointer
          "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedInquiry && (
        <div
          onClick={() => setSelectedInquiry(null)}
          onWheel={(e) => e.stopPropagation()}
          className="
      fixed
      inset-0
      z-[999]
      bg-black/50
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
      sm:p-6
      overscroll-contain
      animate-in
      fade-in
      duration-200
    "
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
        relative
        w-full
        max-w-2xl
        bg-white
        rounded-2xl
        shadow-2xl
        border
        border-gray-200
        overflow-hidden
        animate-in
        fade-in
        zoom-in-95
        duration-200
        max-h-[90vh]
        flex
        flex-col
      "
          >
            {/* Header */}
            <div
              className="
          relative
          px-5
          py-5
          sm:px-8
          sm:py-6
          border-b
          border-gray-100
          shrink-0
        "
            >
              <div className="flex items-center gap-3 pr-10">
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl md:text-[clamp(1.4rem,1.7vw,2rem)] font-bold text-[#1B1B1B]">
                    Client Message
                  </h3>

                  <p className="mt-1 text-xs sm:text-sm md:text-[clamp(0.9rem,1vw,1.1rem)] text-gray-500">
                    Received on {formatDate(selectedInquiry.created_at)}
                  </p>
                </div>
              </div>

              {/* Close Icon */}
              <button
                onClick={() => setSelectedInquiry(null)}
                className="
            absolute
            top-5
            right-5
            w-9
            h-9
            flex
            items-center
            justify-center
            rounded-full
            text-gray-400
            hover:text-gray-700
            hover:bg-gray-100
            transition-colors
            cursor-pointer
            text-lg
          "
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto flex-1 px-5 py-5 sm:px-8 sm:py-7">
              <div className="space-y-6">

                {/* Sender */}
                <div>
                  <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                    Sender
                  </p>

                  <p className="mt-1 text-lg sm:text-xl md:text-[clamp(1.2rem,1.35vw,1.5rem)] font-bold text-[#1B1B1B] break-words">
                    {selectedInquiry.full_name}
                  </p>
                </div>

                {/* Email + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  {/* Email */}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Email
                    </p>

                    <a
                      href={`mailto:${selectedInquiry.email}`}
                      className="
                  mt-1
                  block
                  text-base
                  sm:text-lg
                  md:text-[clamp(1rem,1.15vw,1.25rem)]
                  text-[#556ee6]
                  hover:underline
                  font-medium
                  break-all
                "
                    >
                      {selectedInquiry.email}
                    </a>
                  </div>

                  {/* Phone */}
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                      Phone
                    </p>

                    {selectedInquiry.phone ? (
                      <a
                        href={`tel:${selectedInquiry.phone}`}
                        className="
                    mt-1
                    block
                    text-base
                    sm:text-lg
                    md:text-[clamp(1rem,1.15vw,1.25rem)]
                    text-gray-800
                    font-medium
                    break-words
                    hover:underline
                  "
                      >
                        {selectedInquiry.phone}
                      </a>
                    ) : (
                      <p className="mt-1 text-base sm:text-lg text-gray-400">
                        —
                      </p>
                    )}
                  </div>
                </div>

                {/* Subject */}
                <div>
                  <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase">
                    Subject
                  </p>

                  <p className="mt-1 text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] font-semibold text-[#1B1B1B] break-words">
                    {selectedInquiry.subject || "General Inquiry"}
                  </p>
                </div>

                {/* Message */}
                <div>
                  <p className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold text-gray-500 tracking-wider uppercase mb-2">
                    Message Body
                  </p>

                  <div
                    className="
                p-4
                sm:p-6
                bg-gray-50
                rounded-xl
                border
                border-gray-200
                text-gray-800
                text-base
                sm:text-lg
                md:text-[clamp(1rem,1.15vw,1.25rem)]
                leading-relaxed
                whitespace-pre-wrap
                break-words
                [overflow-wrap:anywhere]
                max-h-64
                overflow-y-auto
              "
                  >
                    {selectedInquiry.message}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer */}
            <div
              className="
          shrink-0
          px-5
          py-4
          sm:px-8
          sm:py-5
          border-t
          border-gray-100
          bg-white
          flex
          flex-col-reverse
          sm:flex-row
          sm:items-center
          sm:justify-end
          gap-3
        "
            >
              <button
                onClick={() => setSelectedInquiry(null)}
                className="
            w-full
            sm:w-auto
            px-7
            py-3
            bg-gray-100
            hover:bg-gray-200
            text-gray-800
            text-sm
            sm:text-base
            md:text-[clamp(0.95rem,1.1vw,1.15rem)]
            font-bold
            rounded-xl
            transition-colors
            cursor-pointer
          "
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}



      <Footer />
    </div>
  );
}
