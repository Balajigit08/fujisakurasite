"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/app/components/common/Button";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: typeof email === "string" ? email.trim().toLowerCase() : "",
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed. Please try again.");
        return;
      }

      router.replace("/admin");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden my-auto">
      <div className="absolute inset-0 z-0 select-none">
        <Image quality={100}
          src="/FS-images/signin-bg.png"
          alt="Japanese Gate Background"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>

      <div className="relative z-10 w-full max-w-[92vw] sm:max-w-[420px] my-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-gray-200 overflow-hidden shadow-2xl">
          <div className="px-6 py-7 sm:px-8 sm:py-8">
            <div className="flex justify-center mb-4 sm:mb-5">
              <Image quality={100}
                src="/FS-images/fuji-logo.png"
                alt="FujiSakura Technologies"
                width={170}
                height={50}
                className="h-8 sm:h-10 w-auto object-contain"
                priority
                style={{ width: "auto", height: "auto" }}
              />
            </div>

            <div className="text-center mb-5 sm:mb-6">
              <h1 className="text-xl sm:text-2xl font-bold text-[#2d3a53]">Admin Portal</h1>
              <p className="text-xs sm:text-sm text-[#8e9db0] mt-1 font-medium">Sign in to manage your site</p>
            </div>

            {error && (
              <div className="mb-4 px-3.5 py-2.5 bg-red-50 border border-red-200 rounded-xl text-xs sm:text-sm text-red-600 flex items-start gap-2 font-medium">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs sm:text-sm font-semibold text-[#2d3a53] mb-1.5"
                >
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter Your Email"
                  className="w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[#2d3a53] placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/20 focus:border-[#34CBEA] transition"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs sm:text-sm font-semibold text-[#2d3a53] mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-[#2d3a53] placeholder-gray-400 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#34CBEA]/20 focus:border-[#34CBEA] transition pr-14"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#556ee6] transition-colors text-xs sm:text-sm font-medium select-none cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? "Hide" : "Show"}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="w-full py-2.5 sm:py-3 px-6 font-semibold text-sm sm:text-base mt-2 shadow-md"
              >
                {loading ? "Signing in…" : "Sign in"}
              </Button>
            </form>
          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-white/90 font-medium mt-4 sm:mt-5 drop-shadow-md">
          FujiSakura Technologies — Admin access only
        </p>
      </div>
    </div>
  );
}
