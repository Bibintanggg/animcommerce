"use client";

import { useState, useId, FormEvent } from "react";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from "lucide-react";
import InputField from "@/components/ui/input-field";
import GoogleIcon from "@/components/visual/google-icon";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { RegisterRequest } from "@/types/auth";
import { registerUser } from "@/services/auth.service";
import axios from "axios";
// import { register } from "@/services/auth.service"; // sesuaikan nanti

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formData, setFormData] = useState<RegisterRequest>({
    name: "",
    email: "",
    password: "",
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [agree, setAgree] = useState(false);

  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmId = useId();
  const agreeId = useId();

  const registerMutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      router.push("/login?registered=true");
    },
    onError: (error) => {
      if (axios.isAxiosError(error)) {
        setFormError(error.response?.data?.message ?? "Gagal membuat akun");
        return;
      }

      setFormError("Terjadi Kesalahan");
    },
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (formData.name.trim().length < 2) {
      setFormError("Nama minimal 2 karakter");
      return;
    }

    if (formData.password.length < 8) {
      setFormError("Password minimal 8 karakter");
      return;
    }

    if (formData.password !== confirmPassword) {
      setFormError("Konfirmasi password tidak cocok");
      return;
    }

    if (!agree) {
      setFormError("Kamu harus menyetujui syarat dan ketentuan");
      return;
    }

    // confirmPassword tidak dikirim ke backend
    registerMutation.mutate(formData);
  };

  const isLoading = registerMutation.isPending;

  const passwordsMatch = formData.password === confirmPassword;

  const canSubmit = Boolean(
    formData.name.trim() &&
    formData.email.trim() &&
    formData.password.length >= 8 &&
    confirmPassword &&
    passwordsMatch &&
    agree &&
    !registerMutation.isPending,
  );

  const handleRegister = () => {
    if (!canSubmit) return;
    registerMutation.mutate({
      name: formData.name,
      email: formData.email,
      password: formData.password,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#F8F7F5] flex items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-light text-[#111111] tracking-tight">
            Create your account
          </h1>
          <p className="text-gray-400 text-sm font-light max-w-sm mx-auto leading-relaxed">
            Daftar untuk mulai koleksi figure & manga favoritmu dari Jepang.
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="
    relative rounded-2xl p-7 sm:p-9
    bg-white
    border border-black/[0.04]
    shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)]
    space-y-5
  "
        >
          {/* Accent line */}
          <div className="absolute top-0 left-10 right-10 h-px bg-gradient-to-r from-transparent via-[#BC002D]/25 to-transparent" />

          {/* Name */}
          <InputField
            id={nameId}
            label="Full Name"
            type="text"
            value={formData.name}
            onChange={(value) =>
              setFormData((previous) => ({
                ...previous,
                name: value,
              }))
            }
            placeholder="Nama lengkap"
            autoComplete="name"
            icon={<User size={16} />}
          />

          <InputField
            id={emailId}
            label="Email"
            type="email"
            value={formData.email}
            onChange={(value) =>
              setFormData((previous) => ({
                ...previous,
                email: value,
              }))
            }
            placeholder="you@example.com"
            autoComplete="email"
            icon={<Mail size={16} />}
          />

          {/* Password */}
          <InputField
            id={passwordId}
            label="Password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(value) =>
              setFormData((previous) => ({
                ...previous,
                password: value,
              }))
            }
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            icon={<Lock size={16} />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword((previous) => !previous)}
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
                className="text-gray-400 hover:text-[#BC002D]"
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }
          />

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <InputField
              id={confirmId}
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={setConfirmPassword}
              placeholder="Ulangi password"
              autoComplete="new-password"
              icon={<Lock size={16} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((previous) => !previous)}
                  aria-label={
                    showConfirm
                      ? "Sembunyikan konfirmasi password"
                      : "Tampilkan konfirmasi password"
                  }
                  className="text-gray-400 hover:text-[#BC002D]"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              }
            />

            {confirmPassword && formData.password !== confirmPassword && (
              <p className="text-xs text-red-500">
                Konfirmasi password tidak cocok
              </p>
            )}

            {confirmPassword && formData.password === confirmPassword && (
              <p className="text-xs text-emerald-600">Password cocok</p>
            )}
          </div>

          {/* Terms */}
          <label
            htmlFor={agreeId}
            className="flex items-start gap-3 cursor-pointer group pt-1"
          >
            <div className="relative mt-0.5 shrink-0">
              <input
                id={agreeId}
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
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
                {agree && (
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
            <span className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-700 transition-colors">
              Saya setuju dengan{" "}
              <button
                type="button"
                className="text-[#111111] font-medium hover:text-[#BC002D] underline-offset-2 hover:underline"
              >
                Syarat & Ketentuan
              </button>{" "}
              dan{" "}
              <button
                type="button"
                className="text-[#111111] font-medium hover:text-[#BC002D] underline-offset-2 hover:underline"
              >
                Kebijakan Privasi
              </button>
            </span>
          </label>

          {/* Submit */}
          <button
            type="submit"
            disabled={!canSubmit}
            className="
    group w-full flex items-center justify-center gap-2.5
    py-3.5 rounded-xl text-sm font-semibold
    bg-[#111111] text-white
    hover:bg-[#BC002D]
    disabled:opacity-40 disabled:cursor-not-allowed
    transition-all duration-300
  "
          >
            {registerMutation.isPending ? (
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
                <span>Create Account</span>
                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform duration-200"
                />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-[11px] text-gray-400 tracking-wide font-light">
              atau daftar dengan
            </span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Google */}
          <button
            type="button"
            className="
              w-full flex items-center justify-center gap-3
              py-3.5 rounded-xl text-sm font-medium text-[#111111]
              bg-white border border-gray-200
              hover:border-gray-300 hover:bg-gray-50
              transition-all duration-200
              shadow-[0_1px_4px_rgba(0,0,0,0.03)]
              focus:outline-none focus:ring-2 focus:ring-gray-200
            "
          >
            <GoogleIcon />
            <span>Continue with Google</span>
          </button>
        </form>

        {/* Footer link */}
        <p className="text-center text-sm text-gray-400 font-light mt-8">
          Sudah punya akun?{" "}
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="text-[#111111] font-semibold hover:text-[#BC002D] transition-colors focus:outline-none"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
