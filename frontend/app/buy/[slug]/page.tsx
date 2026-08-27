"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    CheckoutProductPayload,
    CheckoutResult,
    PaymentMethod,
} from "@/types/checkout";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import { getProductDetails } from "@/services/product.service";
import { checkoutProduct } from "@/services/order.service";
import { BuyNowAddress, BuyNowResult } from "@/types/checkout";

import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import PaymentInstructionModal from "@/components/PaymentInstructionModal";
import { Building2, CheckCircle2, QrCode } from "lucide-react";

const initialAddress: BuyNowAddress = {
    receiver_name: "",
    phone_number: "",
    address_line: "",
    province: "",
    city: "",
    district: "",
    postal_code: "",
};

function formatRupiah(value: number) {
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(value);
}

export default function BuyPage() {
    const router = useRouter();
    const params = useParams<{ slug: string }>();

    const slug = params.slug;
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");

    const [quantity, setQuantity] = useState(1);
    const [address, setAddress] = useState<BuyNowAddress>(initialAddress);
    const [notes, setNotes] = useState("");

    const [createdOrder, setCreatedOrder] = useState<BuyNowResult | null>(null);
    const [errorMessage, setErrorMessage] = useState("");

    const {
        data: product,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["product-detail", slug],
        queryFn: () => getProductDetails(slug),
        enabled: Boolean(slug),
    });

    const checkoutMutation = useMutation({
        mutationFn: (payload: CheckoutProductPayload) => checkoutProduct(slug, payload),

        onSuccess: (response) => {
            setCreatedOrder(response.data);
        },

        onError: (error) => {
            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data?.message ??
                    "Checkout gagal. Silakan coba kembali.",
                );
                return;
            }

            setErrorMessage(
                "Terjadi kesalahan ketika membuat pesanan.",
            );
        },
    });

    const updateAddress = (
        field: keyof BuyNowAddress,
        value: string,
    ) => {
        setAddress((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const increaseQuantity = () => {
        if (!product) return;

        setQuantity((current) =>
            Math.min(current + 1, product.stock),
        );
    };

    const decreaseQuantity = () => {
        setQuantity((current) => Math.max(1, current - 1));
    };

    const handleCheckout = (
        event: FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();
        setErrorMessage("");

        if (!product) {
            setErrorMessage("Produk tidak ditemukan.");
            return;
        }

        if (product.stock <= 0) {
            setErrorMessage("Stok produk sedang habis.");
            return;
        }

        if (quantity > product.stock) {
            setErrorMessage(
                `Stok produk hanya tersisa ${product.stock}.`,
            );
            return;
        }

        checkoutMutation.mutate({
            quantity,
            address,
            payment_method: paymentMethod,
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Memuat produk...
                </p>
            </div>
        );
    }

    if (isError || !product) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-destructive">
                    Produk tidak ditemukan.
                </p>

                <Button onClick={() => router.push("/products")}>
                    Kembali ke Produk
                </Button>
            </div>
        );
    }

    const subtotal = product.price * quantity;

    // Hanya perkiraan tampilan.
    // Backend harus menghitung ulang nilai ini.
    const shippingCost = subtotal >= 500_000 ? 0 : 25_000;
    const grandTotal = subtotal + shippingCost;

    return (
        <>
            <div className="min-h-screen bg-background">
                <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="mb-6 text-sm text-muted-foreground hover:text-foreground"
                    >
                        ← Kembali
                    </button>

                    <div className="mb-8">
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            Checkout
                        </h1>

                        <p className="mt-1 text-sm text-muted-foreground">
                            Lengkapi data untuk menyelesaikan pesananmu.
                        </p>
                    </div>

                    <form onSubmit={handleCheckout}>
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                            <div className="space-y-6 lg:col-span-2">
                                {/* Data penerima */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Badge
                                                variant="secondary"
                                                className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
                                            >
                                                1
                                            </Badge>

                                            Data Penerima
                                        </CardTitle>

                                        <CardDescription>
                                            Informasi orang yang akan menerima paket.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="receiver_name">
                                                Nama Lengkap{" "}
                                                <span className="text-destructive">*</span>
                                            </Label>

                                            <Input
                                                required
                                                id="receiver_name"
                                                minLength={2}
                                                maxLength={100}
                                                value={address.receiver_name}
                                                onChange={(event) =>
                                                    updateAddress(
                                                        "receiver_name",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Masukkan nama lengkap"
                                            />
                                        </div>

                                        <div className="space-y-2 sm:col-span-2">
                                            <Label htmlFor="phone_number">
                                                Nomor WhatsApp{" "}
                                                <span className="text-destructive">*</span>
                                            </Label>

                                            <Input
                                                required
                                                id="phone_number"
                                                type="tel"
                                                minLength={10}
                                                maxLength={20}
                                                value={address.phone_number}
                                                onChange={(event) =>
                                                    updateAddress(
                                                        "phone_number",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="08xxxxxxxxxx"
                                            />
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Alamat */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Badge
                                                variant="secondary"
                                                className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
                                            >
                                                2
                                            </Badge>

                                            Alamat Pengiriman
                                        </CardTitle>

                                        <CardDescription>
                                            Alamat lengkap tempat paket akan dikirim.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="address_line">
                                                Alamat Lengkap{" "}
                                                <span className="text-destructive">*</span>
                                            </Label>

                                            <Textarea
                                                required
                                                id="address_line"
                                                minLength={10}
                                                maxLength={500}
                                                rows={3}
                                                value={address.address_line}
                                                onChange={(event) =>
                                                    updateAddress(
                                                        "address_line",
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                                            />
                                        </div>

                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="province">
                                                    Provinsi{" "}
                                                    <span className="text-destructive">*</span>
                                                </Label>

                                                <Select
                                                    value={address.province}
                                                    onValueChange={(value) =>
                                                        updateAddress("province", value)
                                                    }
                                                >
                                                    <SelectTrigger id="province">
                                                        <SelectValue placeholder="Pilih provinsi" />
                                                    </SelectTrigger>

                                                    <SelectContent>
                                                        <SelectItem value="DKI Jakarta">
                                                            DKI Jakarta
                                                        </SelectItem>
                                                        <SelectItem value="Jawa Barat">
                                                            Jawa Barat
                                                        </SelectItem>
                                                        <SelectItem value="Jawa Tengah">
                                                            Jawa Tengah
                                                        </SelectItem>
                                                        <SelectItem value="Jawa Timur">
                                                            Jawa Timur
                                                        </SelectItem>
                                                        <SelectItem value="Banten">
                                                            Banten
                                                        </SelectItem>
                                                        <SelectItem value="DI Yogyakarta">
                                                            DI Yogyakarta
                                                        </SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="city">
                                                    Kota/Kabupaten{" "}
                                                    <span className="text-destructive">*</span>
                                                </Label>

                                                <Input
                                                    required
                                                    id="city"
                                                    maxLength={100}
                                                    value={address.city}
                                                    onChange={(event) =>
                                                        updateAddress(
                                                            "city",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Contoh: Jakarta Timur"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="district">
                                                    Kecamatan{" "}
                                                    <span className="text-destructive">*</span>
                                                </Label>

                                                <Input
                                                    required
                                                    id="district"
                                                    maxLength={100}
                                                    value={address.district}
                                                    onChange={(event) =>
                                                        updateAddress(
                                                            "district",
                                                            event.target.value,
                                                        )
                                                    }
                                                    placeholder="Nama kecamatan"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="postal_code">
                                                    Kode Pos{" "}
                                                    <span className="text-destructive">*</span>
                                                </Label>

                                                <Input
                                                    required
                                                    id="postal_code"
                                                    inputMode="numeric"
                                                    pattern="[0-9]{5}"
                                                    maxLength={5}
                                                    value={address.postal_code}
                                                    onChange={(event) =>
                                                        updateAddress(
                                                            "postal_code",
                                                            event.target.value.replace(
                                                                /\D/g,
                                                                "",
                                                            ),
                                                        )
                                                    }
                                                    placeholder="12345"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Payment */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Badge
                                                variant="secondary"
                                                className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
                                            >
                                                3
                                            </Badge>

                                            Metode Pembayaran
                                        </CardTitle>

                                        <CardDescription>
                                            Metode pembayaran yang tersedia.
                                        </CardDescription>
                                    </CardHeader>

                                    {/* Payment */}
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-2 text-lg">
                                                <Badge
                                                    variant="secondary"
                                                    className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
                                                >
                                                    3
                                                </Badge>

                                                Metode Pembayaran
                                            </CardTitle>

                                            <CardDescription>
                                                Pilih metode pembayaran yang ingin digunakan.
                                            </CardDescription>
                                        </CardHeader>

                                        <CardContent>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                {/* QRIS */}
                                                <button
                                                    type="button"
                                                    aria-pressed={paymentMethod === "qris"}
                                                    onClick={() =>
                                                        setPaymentMethod("qris")
                                                    }
                                                    className={`relative rounded-2xl border-2 p-5 text-left transition ${paymentMethod === "qris"
                                                            ? "border-[#BC002D] bg-red-50"
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                        }`}
                                                >
                                                    {paymentMethod === "qris" && (
                                                        <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-[#BC002D]" />
                                                    )}

                                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gray-100">
                                                        <QrCode className="h-5 w-5" />
                                                    </div>

                                                    <p className="font-semibold text-gray-950">
                                                        QRIS
                                                    </p>

                                                    <p className="mt-1 pr-6 text-xs leading-5 text-gray-500">
                                                        Bayar menggunakan QRIS melalui mobile banking
                                                        atau e-wallet.
                                                    </p>
                                                </button>

                                                <button
                                                    type="button"
                                                    aria-pressed={paymentMethod === "bca_va"}
                                                    onClick={() =>
                                                        setPaymentMethod("bca_va")
                                                    }
                                                    className={`relative rounded-2xl border-2 p-5 text-left transition ${paymentMethod === "bca_va"
                                                            ? "border-[#BC002D] bg-red-50"
                                                            : "border-gray-200 bg-white hover:border-gray-300"
                                                        }`}
                                                >
                                                    {paymentMethod === "bca_va" && (
                                                        <CheckCircle2 className="absolute right-4 top-4 h-5 w-5 text-[#BC002D]" />
                                                    )}

                                                    <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                                                        <Building2 className="h-5 w-5 text-blue-700" />
                                                    </div>

                                                    <p className="font-semibold text-gray-950">
                                                        BCA Virtual Account
                                                    </p>

                                                    <p className="mt-1 pr-6 text-xs leading-5 text-gray-500">
                                                        Bayar melalui myBCA, BCA Mobile, ATM,
                                                        atau internet banking.
                                                    </p>
                                                </button>
                                            </div>

                                            <div className="mt-4 rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-500">
                                                Metode dipilih:{" "}
                                                <span className="font-medium text-gray-900">
                                                    {paymentMethod === "qris"
                                                        ? "QRIS"
                                                        : "BCA Virtual Account"}
                                                </span>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </Card>

                                {/* Notes */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-lg">
                                            <Badge
                                                variant="secondary"
                                                className="flex h-6 w-6 items-center justify-center rounded-full p-0 text-xs"
                                            >
                                                4
                                            </Badge>

                                            Catatan Pesanan
                                        </CardTitle>

                                        <CardDescription>
                                            Opsional—tulis permintaan khusus.
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent>
                                        <Textarea
                                            value={notes}
                                            onChange={(event) =>
                                                setNotes(event.target.value)
                                            }
                                            maxLength={500}
                                            rows={3}
                                            placeholder="Contoh: Tolong packing rapi..."
                                        />
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Summary */}
                            <div className="lg:col-span-1">
                                <Card className="sticky top-6">
                                    <CardHeader>
                                        <CardTitle className="text-lg">
                                            Ringkasan Pesanan
                                        </CardTitle>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="flex gap-3">
                                            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                <img
                                                    src={product.thumbnail}
                                                    alt={product.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-2 text-sm font-medium">
                                                    {product.title}
                                                </p>

                                                <p className="mt-1 text-sm font-semibold">
                                                    {formatRupiah(product.price)}
                                                </p>

                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    Stok: {product.stock}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span className="text-sm text-muted-foreground">
                                                Jumlah
                                            </span>

                                            <div className="flex items-center gap-3">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={decreaseQuantity}
                                                    disabled={quantity <= 1}
                                                >
                                                    −
                                                </Button>

                                                <span className="min-w-6 text-center">
                                                    {quantity}
                                                </span>

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="icon"
                                                    onClick={increaseQuantity}
                                                    disabled={quantity >= product.stock}
                                                >
                                                    +
                                                </Button>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Subtotal
                                                </span>
                                                <span>{formatRupiah(subtotal)}</span>
                                            </div>

                                            <div className="flex justify-between">
                                                <span className="text-muted-foreground">
                                                    Ongkir
                                                </span>

                                                <span>
                                                    {shippingCost === 0
                                                        ? "Gratis"
                                                        : formatRupiah(shippingCost)}
                                                </span>
                                            </div>
                                        </div>

                                        <Separator />

                                        <div className="flex justify-between font-semibold">
                                            <span>Total</span>
                                            <span className="text-lg">
                                                {formatRupiah(grandTotal)}
                                            </span>
                                        </div>

                                        <p className="text-xs leading-relaxed text-muted-foreground">
                                            Harga dan ongkir akan dihitung ulang oleh
                                            server ketika pesanan dibuat.
                                        </p>
                                    </CardContent>

                                    <CardFooter>
                                        <Button
                                            type="submit"
                                            size="lg"
                                            className="w-full"
                                            disabled={
                                                checkoutMutation.isPending ||
                                                product.stock <= 0
                                            }
                                        >
                                            {checkoutMutation.isPending
                                                ? "Memproses..."
                                                : product.stock <= 0
                                                    ? "Stok Habis"
                                                    : "Buat Pesanan"}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            <SuccessModal
                isOpen={createdOrder !== null}
                title="Pesanan berhasil dibuat"
                subtitle={
                    createdOrder
                        ? `Nomor pesanan: ${createdOrder.order_number}`
                        : undefined
                }
                buttonText="Selesai"
                onClose={() => router.push("/")}
            />

            <PaymentInstructionModal
                order={createdOrder}
                onClose={() => router.push("/orders")}
            />

            <ErrorModal
                isOpen={errorMessage !== ""}
                title="Checkout gagal"
                subtitle={errorMessage}
                onClose={() => setErrorMessage("")}
            />
        </>
    );
}