import { AlertTriangle } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function ErrorCard() {
    return (
        <Card className="mx-auto max-w-md border-destructive border-none">
            <CardHeader className="text-center">
                <div className="flex justify-center mb-2">
                    <AlertTriangle className="h-10 w-10 text-destructive" />
                </div>

                <CardTitle>Oops! Terjadi Kesalahan</CardTitle>

                <CardDescription>
                    Gagal memuat data. Silakan coba beberapa saat lagi.
                </CardDescription>
            </CardHeader>

            <CardContent className="text-center text-sm text-muted-foreground">
                Periksa koneksi internet Anda atau refresh halaman.
            </CardContent>
        </Card>
    );
}