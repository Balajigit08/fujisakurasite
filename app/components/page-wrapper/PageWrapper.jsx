"use client";
import { forwardRef } from "react";

const Page = forwardRef(({ children, className = "", number }, ref) => {
    return (
        <div
            ref={ref}
            className={`relative w-full h-full  overflow-hidden ${className}`}
        >
            <div className="w-full h-full flex flex-col overflow-y-auto">
                {children}
            </div>
            {number && (
                <span className="absolute bottom-3 right-4 text-[10px] sm:text-xs text-gray-400 tracking-wide">
                    {String(number).padStart(2, "0")}
                </span>
            )}
        </div>
    );
});

Page.displayName = "Page";
export default Page;