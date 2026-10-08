"use client";

import Image from "next/image";


/**
 * Custom Branded Circular Loader component with centered company logo
 * and ultra-smooth 60fps spinning cyan progress ring.
 */
export default function BrandLoader({
  fullScreen = false,
  size = 130,
  className = "",
  label = "",
}) {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;

  // Dynamic colors based on fullscreen vs inline
  const trackStroke = fullScreen ? "rgba(255, 255, 255, 0.15)" : "#e2e8f0";
  const activeStroke = fullScreen ? "#ffffff" : "#34CBEA";
  const labelClass = fullScreen ? "text-white" : "text-gray-500";

  const content = (
    <div className={`flex flex-col items-center justify-center space-y-3 ${className}`}>
      {/* Circle Container with Centered Logo & Animated Circular Ring */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: size, height: size }}
      >
        <style>{`
          @keyframes brandSpin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>

        {/* GPU-Accelerated 60fps Spinning Ring Wrapper */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            animation: "brandSpin 1s linear infinite",
            transformOrigin: "center center",
            willChange: "transform",
          }}
        >
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="w-full h-full block"
          >
            {/* Background Track Circle */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={trackStroke}
              strokeWidth="3"
              fill="transparent"
            />
            {/* Active Cyan Progress Arc */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={activeStroke}
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * 0.35}
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Centered Logo */}
        <div className="absolute inset-0 flex items-center justify-center p-3 pointer-events-none">
          <div className="relative w-[72%] h-[72%] flex items-center justify-center">
            <Image quality={100}
              src="/FS-images/Logo-fs.png"
              alt="FujiSakura Logo"
              width={90}
              height={90}
              className="w-full h-full object-contain"
              priority
            />
          </div>
        </div>
      </div>


      {label && (
        <span className={`text-xs font-semibold tracking-wider uppercase opacity-85 ${labelClass}`}>
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[9999] bg-[#071036] flex items-center justify-center transition-opacity duration-300">
        {content}
      </div>
    );
  }

  return (
    <div className="w-full py-8 bg-transparent flex items-center justify-center">
      {content}
    </div>
  );
}
