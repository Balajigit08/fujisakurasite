"use client";

import { FaPlus, FaImage } from "react-icons/fa";
import PositionCard from "../PositionCard/PositionCard";
import BrandLoader from "@/app/components/BrandLoader/BrandLoader";
import Button from "@/app/components/common/Button";

export default function CareerManagement({
  positions = [],
  loading = false,
  onAddPosition = () => {},
  onEditPosition = () => {},
  onDeletePosition = () => {},
  onPreviewPosition = () => {},
  onToggleStatus = () => {},
} = {}) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="flex flex-wrap items-baseline gap-x-3">
            <span className="text-2xl sm:text-3xl md:text-[clamp(1.75rem,2.2vw,2.75rem)] text-[#1B1B1B]">
              Careers
            </span>
            <span className="text-3xl sm:text-4xl md:text-[clamp(2.25rem,3vw,3.5rem)] font-bold text-[#34CBEA]">
              Management
            </span>
          </h1>
          <p className="mt-2 text-black text-base sm:text-lg md:text-[clamp(1.05rem,1.25vw,1.35rem)]">
            Manage available career positions from the admin panel.
          </p>
        </div>

        <Button
          onClick={onAddPosition}
          className="px-7 sm:px-9 py-3.5 sm:py-4 shrink-0 self-start sm:self-auto text-base sm:text-lg md:text-[clamp(1.05rem,1.2vw,1.35rem)] font-bold shadow-sm"
        >
          <FaPlus size={18} />
          <span>Add Position</span>
        </Button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <BrandLoader targetProgress={100} duration={3000} label="Loading Positions…" />
        ) : positions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-[#556ee6] rounded-full flex items-center justify-center mx-auto mb-4">
              <FaImage size={24} />
            </div>
            <h3 className="text-xl text-[#2d3a53]">No Position Available</h3>
            <p className="text-gray-500 mt-1 max-w-md mx-auto text-sm">
              Click the &quot;Add Position&quot; button above to create a new career opportunity listing.
            </p>
          </div>
        ) : (
          positions.map((job) => (
            <PositionCard
              key={job.id}
              job={job}
              onEdit={onEditPosition}
              onDelete={onDeletePosition}
              onPreview={onPreviewPosition}
              onToggleStatus={onToggleStatus}
            />
          ))
        )}
      </div>
    </div>
  );
}
