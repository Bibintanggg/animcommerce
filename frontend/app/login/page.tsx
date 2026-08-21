"use client";

import { login } from "@/services/auth.service";
import { useState, useId } from "react";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import ToriiGate from "@/components/visual/tori-gate";
import SakuraPetals from "@/components/visual/sakura-petals";
import InputField from "@/components/ui/input-field";
import GoogleIcon from "@/components/visual/google-icon";
import { LoginRequest } from "@/types/auth";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState("");
  const router = useRouter();

  const emailId = useId();
  const passwordId = useId();
  const rememberId = useId();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => login(data),
    onSuccess: (res) => {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      document.cookie = `role=${res.data.user.role}; path=/`;

      const role = res.data.user.role;

      if (role === "superadmin") {
        router.push("/superadmin/dashboard");
      } else if (role === "admin") {
        router.push("/admin/dashboard");
      } else {
        router.push("/");
      }
    },
    onError: (err: any) => {
      console.log("STATUS:", err.response?.status);
      console.log("DATA:", err.response?.data);
      setLoginError("Email atau password salah");
    },
  });

  const isLoading = loginMutation.isPending;

  const handleLogin = () => {
    setLoginError("");

    if (!email.trim()) {
      setLoginError("Email wajib diisi");
      return;
    }

    if (!email.includes("@")) {
      setLoginError("Format email tidak valid");
      return;
    }

    if (!password) {
      setLoginError("Password wajib diisi");
      return;
    }

    loginMutation.mutate({
      email: email.trim().toLowerCase(),
      password,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="min-h-screen flex bg-[#F8F7F5]">
      {/* ── LEFT: Visual Panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#111111] flex-col justify-between">
        {/* Seigaiha pattern background — tiled across full panel */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                radial-gradient(circle at 50% 100%, transparent 29px, rgba(255,255,255,0.06) 30px, rgba(255,255,255,0.06) 30px, transparent 31px),
                radial-gradient(circle at 0% 100%, transparent 29px, rgba(255,255,255,0.06) 30px, rgba(255,255,255,0.06) 30px, transparent 31px),
                radial-gradient(circle at 100% 100%, transparent 29px, rgba(255,255,255,0.06) 30px, rgba(255,255,255,0.06) 30px, transparent 31px)
              `,
              backgroundSize: "60px 60px",
              backgroundPosition: "0 0, -30px 0, 30px 0",
            }}
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a0a0e] via-[#111111] to-[#0d0d0d]" />
          <div className="absolute bottom-0 left-0 right-0 h-2/3 bg-gradient-to-t from-[#BC002D]/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#BC002D]/10 via-transparent to-transparent" />
        </div>

        {/* Floating sakura petals */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <SakuraPetals />
        </div>

        {/* Top brand mark */}
        <div className="relative z-10 px-12 pt-12">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full border border-[#BC002D]/60 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-[#BC002D]" />
            </div>
            <span className="text-white/80 text-sm font-light tracking-[0.2em] uppercase">
              Kurashi
            </span>
          </div>
        </div>

        {/* Center: Torii + Fuji illustration */}
        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-8">
          {/* Mount Fuji silhouette */}
          <div className="relative w-full flex justify-center mb-[-2rem]">
            <svg viewBox="0 0 400 180" className="w-80 opacity-20" fill="white">
              <path d="M200 10 L320 160 L80 160 Z" />
              <path
                d="M200 10 L250 70 L200 65 L150 70 Z"
                fill="rgba(255,255,255,0.4)"
              />
              {/* Snow cap */}
              <ellipse
                cx="200"
                cy="130"
                rx="240"
                ry="40"
                fill="rgba(255,255,255,0.03)"
              />
            </svg>
          </div>

          {/* Torii Gate */}
          <div className="relative">
            <ToriiGate className="w-40 h-auto drop-shadow-[0_0_40px_rgba(188,0,45,0.3)]" />
            {/* Glow beneath torii */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-8 bg-[#BC002D]/20 blur-2xl rounded-full" />
          </div>

          {/* Thin horizontal rule with Japanese character */}
          <div className="flex items-center gap-4 mt-8">
            <div className="h-px w-16 bg-white/20" />
            <span className="text-white/30 text-xs tracking-[0.3em] font-light">
              京都
            </span>
            <div className="h-px w-16 bg-white/20" />
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10 px-12 pb-12 space-y-2">
          <p className="text-white/50 text-xs tracking-[0.15em] uppercase font-light">
            Japanese Premium
          </p>
          <p className="text-white/80 text-lg font-light leading-snug">
            Crafted with intention,
            <br />
            <span className="text-[#BC002D]">delivered with care.</span>
          </p>
          {/* Bottom decorative line */}
          <div className="pt-6 flex gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-0.5 rounded-full bg-white/20"
                style={{ width: i === 0 ? "2rem" : "0.5rem" }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: Login Form ──────────────────────────────────────────────── */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand mark */}
          <div className="flex lg:hidden items-center gap-2 justify-center">
            <div className="w-6 h-6 rounded-full border border-[#BC002D]/60 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#BC002D]" />
            </div>
            <span className="text-[#111111] text-sm font-light tracking-[0.2em] uppercase">
              Kurashi
            </span>
          </div>

          {/* Header */}
          <div className="space-y-2">
            {/* Eyebrow */}
            <div className="flex items-center gap-3">
              <div className="h-px w-6 bg-[#BC002D]" />
              <span className="text-[#BC002D] text-xs tracking-[0.25em] uppercase font-semibold">
                お帰りなさい
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-light text-[#111111] tracking-tight">
              Welcome Back
            </h1>
            <p className="text-gray-400 text-sm font-light leading-relaxed">
              Sign in to continue your shopping journey
            </p>
          </div>

          {/* Glassmorphism card */}
          <div
            className="
              relative rounded-2xl p-7 sm:p-8 space-y-5
              bg-white/70 backdrop-blur-md
              border border-white/80
              shadow-[0_8px_32px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]
            "
            onKeyDown={handleKeyDown}
          >
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-[#BC002D]/30 to-transparent rounded-full" />
            {loginError && (
              <div
                role="alert"
                className="
      rounded-xl border border-red-200
      bg-red-50 px-4 py-3
      text-sm text-red-600
    "
              >
                {loginError}
              </div>
            )}

            {/* Email */}
            <InputField
              id={emailId}
              label="Email"
              type="email"
              value={email}
              onChange={(value) => {
                setEmail(value);
                setLoginError("");
              }}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<Mail size={16} />}
            />

            {/* Password */}
            <div className="flex flex-col gap-2">
              <InputField
                id={passwordId}
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(value) => setPassword(value)}
                placeholder="••••••••"
                autoComplete="current-password"
                icon={<Lock size={16} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-[#BC002D] transition-colors duration-150 focus:outline-none"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                }
              />

              <p className="text-sm text-gray-500">
                *Minimal password 8 karakter
              </p>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between pt-1">
              <label
                htmlFor={rememberId}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    id={rememberId}
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div
                    className="
                      w-4 h-4 rounded border border-gray-300
                      peer-checked:bg-[#BC002D] peer-checked:border-[#BC002D]
                      transition-all duration-200
                      group-hover:border-[#BC002D]/50
                      flex items-center justify-center
                    "
                  >
                    {rememberMe && (
                      <svg
                        className="w-2.5 h-2.5 text-white"
                        viewBox="0 0 10 10"
                        fill="none"
                      >
                        <path
                          d="M1.5 5L4 7.5L8.5 2.5"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                className="text-xs text-gray-400 hover:text-[#BC002D] transition-colors duration-200 focus:outline-none underline-offset-2 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={isLoading || !email || !password}
              className="
                group w-full flex items-center justify-center gap-2.5
                py-3.5 rounded-xl text-sm font-semibold tracking-wide
                bg-[#111111] text-white
                hover:bg-[#BC002D]
                disabled:opacity-40 disabled:cursor-not-allowed
                transition-all duration-300
                shadow-[0_4px_14px_rgba(0,0,0,0.15)]
                hover:shadow-[0_4px_20px_rgba(188,0,45,0.35)]
                focus:outline-none focus:ring-2 focus:ring-[#BC002D]/40
              "
            >
              {isLoading ? (
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  />
                  <path
                    className="opacity-75"
                    d="M4 12a8 8 0 018-8"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight
                    size={15}
                    className="group-hover:translate-x-0.5 transition-transform duration-200"
                  />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-gray-400 whitespace-nowrap font-light tracking-wide">
                or continue with
              </span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Google Login */}
            <button
              type="button"
              className="
                w-full flex items-center justify-center gap-3
                py-3.5 rounded-xl text-sm font-medium text-[#111111]
                bg-white border border-gray-200
                hover:border-gray-300 hover:bg-gray-50
                transition-all duration-200
                shadow-[0_2px_8px_rgba(0,0,0,0.04)]
                focus:outline-none focus:ring-2 focus:ring-gray-200
              "
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-sm text-gray-400 font-light">
            Don&apos;t have an account?{" "}
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="text-[#111111] font-semibold hover:text-[#BC002D] transition-colors duration-200 focus:outline-none"
            >
              Sign Up
            </button>
          </p>

          <div className="flex justify-center gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="w-1 h-1 rounded-full bg-gray-300" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
