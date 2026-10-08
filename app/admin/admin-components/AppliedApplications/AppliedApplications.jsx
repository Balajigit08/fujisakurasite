"use client";

import { FaSearch, FaDownload, FaTrashAlt, FaEye } from "react-icons/fa";
import BrandLoader from "@/app/components/BrandLoader/BrandLoader";
import Button from "@/app/components/common/Button";

export default function AppliedApplications({
  applications = [],
  loading = false,
  appSearch = "",
  setAppSearch = () => { },
  appStatusFilter = "all",
  setAppStatusFilter = () => { },
  onStatusChange = () => { },
  onSelectApp = () => { },
  onDownloadResume = () => { },
  onDeleteApp = () => { },
  updatingAppId = null,
  deletingAppId = null,
  statusOptions = [],
  statusColors = {},
  formatDate = () => "",
} = {}) {
  const filteredApps = applications.filter((app) => {
    const matchStatus = appStatusFilter === "all" || app.status === appStatusFilter;
    const matchQuery =
      !appSearch.trim() ||
      app.full_name?.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.email?.toLowerCase().includes(appSearch.toLowerCase()) ||
      app.job_title?.toLowerCase().includes(appSearch.toLowerCase());
    return matchStatus && matchQuery;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.2vw,2.75rem)] text-[#1B1B1B]">
              Applied
            </span>
            <span className="text-3xl sm:text-4xl md:text-[clamp(2.25rem,3vw,3.5rem)] font-bold text-[#34CBEA]">
              Applications
            </span>
          </h1>
          <p className="mt-2 text-black text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)]">
            Review candidate job applications.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FaSearch size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by candidate name, email, or position…"
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] text-[#1B1B1B] bg-white focus:outline-none focus:ring-2 focus:ring-[#34CBEA]"
          />
        </div>

        <select
          value={appStatusFilter}
          onChange={(e) => setAppStatusFilter(e.target.value)}
          className="custom-select pl-5 pr-12 py-3.5 border border-gray-200 rounded-xl text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] font-bold text-[#1B1B1B] bg-white focus:outline-none focus:ring-2 focus:ring-[#34CBEA] cursor-pointer"
        >
          <option value="all">All Statuses</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <BrandLoader targetProgress={100} label="Loading Applications…" />
      ) : filteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <h3 className="text-xl sm:text-2xl font-bold text-[#1B1B1B]">No applications found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#f8fafc] border-b border-gray-200 text-gray-700 uppercase text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] tracking-wider">
                  <th className="px-6 py-4.5 font-bold">#</th>
                  <th className="px-6 py-4.5 font-bold">Applicant</th>
                  <th className="px-6 py-4.5 font-bold">Position</th>
                  <th className="px-6 py-4.5 font-bold">Phone</th>
                  <th className="px-6 py-4.5 font-bold text-center">JLPT</th>
                  <th className="px-6 py-4.5 font-bold">Applied On</th>
                  <th className="px-6 py-4.5 font-bold">Status</th>
                  <th className="px-6 py-4.5 font-bold">Details</th>
                  <th className="px-6 py-4.5 font-bold">Resume</th>
                  <th className="px-6 py-4.5 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-base">
                {filteredApps.map((app, idx) => {
                  return (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-5 text-gray-400 font-bold text-base sm:text-lg">{idx + 1}</td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-[#1B1B1B] text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.3rem)] max-w-[180px] sm:max-w-[220px] truncate" title={app.full_name}>{app.full_name}</div>
                        <div className="text-gray-500 text-sm sm:text-base mt-0.5 font-normal max-w-[180px] sm:max-w-[220px] truncate" title={app.email}>{app.email}</div>
                      </td>
                      <td className="px-6 py-5 text-[#1B1B1B] font-semibold text-base sm:text-lg md:text-[clamp(1rem,1.15vw,1.25rem)] max-w-[180px] sm:max-w-[220px] truncate" title={app.job_title}>{app.job_title}</td>
                      <td className="px-6 py-5 text-gray-700 whitespace-nowrap text-sm sm:text-base md:text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium">{app.phone}</td>
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        {app.is_jp_bilingual ? (
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">
                            ✓ {app.jp_level || "—"}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm font-medium">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5 text-gray-600 whitespace-nowrap text-sm sm:text-base md:text-[clamp(0.95rem,1.05vw,1.15rem)] font-medium">{formatDate(app.created_at)}</td>
                      <td className="px-6 py-5">
                        <select
                          value={app.status}
                          disabled={updatingAppId === app.id}
                          onChange={(e) => onStatusChange(app.id, e.target.value)}
                          className={`status-select-pill text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold border rounded-full pl-3.5 pr-7 py-2 focus:outline-none cursor-pointer disabled:opacity-50 ${statusColors[app.status] || "bg-gray-50"}`}
                        >
                          {statusOptions.map((s) => (
                            <option key={s} value={s}>
                              {s.charAt(0).toUpperCase() + s.slice(1)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => onSelectApp(app)}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold rounded-xl transition-colors cursor-pointer"
                        >
                          <FaEye size={15} />
                          <span>Read</span>
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <Button
                          onClick={() => onDownloadResume(app.id, app.full_name)}
                          size="sm"
                          className="text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold px-4 py-2.5"
                        >
                          <FaDownload size={12} />
                          <span>Resume</span>
                        </Button>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => onDeleteApp(app.id)}
                          disabled={deletingAppId === app.id}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs sm:text-sm md:text-[clamp(0.85rem,0.95vw,1.05rem)] font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <FaTrashAlt size={14} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
