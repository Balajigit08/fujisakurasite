

import React from "react";
import Link from "next/link";

/**
 * Standardized Button / CTA Component
 * Matches the signature 'Let's Talk' design:
 * - Gold (#FFB54E) brand pill
 * - Hover transition to #e09e42
 * - Satisfying active:scale-95 press feedback
 * - Rounded-full pill shape with smooth transition
 */
export default function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  target,
  rel,
  title,
  ...props
}) {
  const baseStyles =
    "inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 cursor-pointer select-none touch-manipulation whitespace-nowrap active:scale-95 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

  const variantStyles = {
    primary:
      "bg-[#FFB54E] text-[#1a1a1a] hover:bg-[#e09e42] disabled:hover:bg-[#FFB54E]",
    outline:
      "border border-[#FFB54E] text-inherit hover:bg-[#FFB54E] hover:text-black disabled:hover:bg-transparent",
    white:
      "bg-white text-[#1a1a1a] hover:bg-gray-100 shadow-md disabled:hover:bg-white",
    secondary:
      "bg-gray-100 text-[#2d3a53] hover:bg-gray-200 disabled:hover:bg-gray-100",
    danger:
      "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 disabled:hover:bg-red-50",
  };

  const sizeStyles = {
    sm: "px-4 py-2 text-xs sm:text-sm",
    md: "px-6 py-2.5 sm:px-7 sm:py-3 text-sm sm:text-base",
    lg: "px-[clamp(1.25rem,2.5vw,3rem)] py-[clamp(0.65rem,1vw,1rem)] text-[clamp(13px,1.2vw,20px)]",
  };

  const combinedClasses = `
    ${baseStyles}
    ${variantStyles[variant] || variantStyles.primary}
    ${sizeStyles[size] || sizeStyles.md}
    ${className}
  `.replace(/\s+/g, " ").trim();

  // If href is provided, render Next.js Link or external <a>
  if (href && !disabled && !loading) {
    const isExternal = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
    if (isExternal) {
      return (
        <a
          href={href}
          target={target || "_blank"}
          rel={rel || "noopener noreferrer"}
          className={combinedClasses}
          title={title}
          onClick={onClick}
          {...props}
        >
          {children}
        </a>
      );
    }
    return (
      <Link
        href={href}
        prefetch={false}
        className={combinedClasses}
        title={title}
        onClick={onClick}
        {...props}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={combinedClasses}
      title={title}
      {...props}
    >
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      )}
      {children}
    </button>
  );
}
