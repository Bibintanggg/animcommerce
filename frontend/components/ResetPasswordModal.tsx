"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, XCircle } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "@/types/user";
import { usersResetPassword } from "@/services/users.service";
import { goeyToast } from "goey-toast";

interface ResetPasswordModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    user: User | null;
}

export default function ResetPasswordModal({
    open,
    onOpenChange,
    user,
}: ResetPasswordModalProps) {
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const rules = {
        length: newPassword.length >= 8,
        upper: /[A-Z]/.test(newPassword),
        lower: /[a-z]/.test(newPassword),
        number: /[0-9]/.test(newPassword),
    };
    const isPasswordValid = Object.values(rules).every(Boolean);
    const isMatch = confirmPassword.length > 0 && newPassword === confirmPassword;
    const canSubmit = isPasswordValid && isMatch && !isLoading;

    function resetState() {
        setNewPassword("");
        setConfirmPassword("");
        setError("");
        setShowNew(false);
        setShowConfirm(false);
    }

    function handleOpenChange(next: boolean) {
        onOpenChange(next);
        if (!next) resetState();
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!canSubmit || !user) return;

        setIsLoading(true);
        setError("");
        try {
            const message = await usersResetPassword(user.id, {
                new_password: newPassword,
            });
            goeyToast.success(message || "Password berhasil direset!");
            handleOpenChange(false);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Gagal mereset password. Coba lagi.";
            setError(message);
            goeyToast.error(message);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="sm:max-w-md">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                            {user
                                ? `Buat password baru untuk ${user.name}`
                                : "Buat password baru untuk pengguna ini"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {/* New password */}
                        <div className="grid gap-2">
                            <Label htmlFor="newPassword">Password baru</Label>
                            <div className="relative">
                                <Input
                                    id="newPassword"
                                    type={showNew ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => {
                                        setNewPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    placeholder="Masukkan password baru"
                                    autoComplete="new-password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNew((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showNew ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>

                            {newPassword.length > 0 && (
                                <ul className="mt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                                    <PasswordRule ok={rules.length} label="Minimal 8 karakter" />
                                    <PasswordRule ok={rules.upper} label="Huruf besar" />
                                    <PasswordRule ok={rules.lower} label="Huruf kecil" />
                                    <PasswordRule ok={rules.number} label="Mengandung angka" />
                                </ul>
                            )}
                        </div>

                        {/* Confirm password */}
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Konfirmasi password baru</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirm ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => {
                                        setConfirmPassword(e.target.value);
                                        if (error) setError("");
                                    }}
                                    placeholder="Ulangi password baru"
                                    autoComplete="new-password"
                                    required
                                    className="pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm((v) => !v)}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showConfirm ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {confirmPassword.length > 0 && !isMatch && (
                                <p className="text-xs text-destructive">Password tidak sama</p>
                            )}
                        </div>

                        {error && (
                            <p className="text-sm text-destructive" role="alert">
                                {error}
                            </p>
                        )}
                    </div>

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleOpenChange(false)}
                            disabled={isLoading}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={!canSubmit}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isLoading ? "Menyimpan..." : "Reset Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function PasswordRule({ ok, label }: { ok: boolean; label: string }) {
    return (
        <li className="flex items-center gap-1.5">
            {ok ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
            ) : (
                <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className={ok ? "text-foreground" : "text-muted-foreground"}>
                {label}
            </span>
        </li>
    );
}