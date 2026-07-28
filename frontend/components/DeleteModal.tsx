import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface DeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export default function DeleteModal({
  open,
  onOpenChange,
  title,
  description,
  children,
}: DeleteModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  const handleOpenChange = (next: boolean) => {
    if (!next) setStep(1);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        {step === 1 ? (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <DialogTitle>{title}</DialogTitle>
              </div>
              <DialogDescription>{description}</DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => handleOpenChange(false)}>
                Batal
              </Button>
              <Button variant="destructive" onClick={() => setStep(2)}>
                Ya, Hapus
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <DialogTitle>Konfirmasi Akhir</DialogTitle>
              </div>
              <DialogDescription>
                Data akan dihapus secara permanen dan{" "}
                <span className="font-semibold text-red-500">
                  tidak dapat dikembalikan lagi
                </span>
                . Pastikan kamu benar-benar yakin.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Kembali
              </Button>
              {children}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
