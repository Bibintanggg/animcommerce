"use client";

import {
    FormEvent,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useRouter } from "next/navigation";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";

import { getCart } from "@/services/cart.service";
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import SuccessModal from "@/components/SuccessModal";
import ErrorModal from "@/components/ErrorModal";
import { checkoutCart } from "@/services/order.service";

interface CheckoutAddress {
    receiver_name: string;
    phone_number: string;
    address_line: string;
    province: string;
    city: string;
    district: string;
    postal_code: string;
}

const initialAddress: CheckoutAddress = {
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

export default function CartCheckoutPage() {
    const router = useRouter();
    const queryClient = useQueryClient();

    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [selectionLoaded, setSelectionLoaded] = useState(false);

    const [address, setAddress] = useState<CheckoutAddress>(initialAddress);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        const savedSelection = sessionStorage.getItem("checkout_cart_item_ids");

        if (!savedSelection) {
            setSelectionLoaded(true);
            return;
        }

        try {
            const parsedSelection: unknown = JSON.parse(savedSelection);

            if (Array.isArray(parsedSelection)) {
                const validIds = parsedSelection.filter(
                    (id): id is number => typeof id === "number" && id > 0,
                );

                setSelectedIds(validIds);
            }
        } catch {
            sessionStorage.removeItem("checkout_cart_item_ids");
        } finally {
            setSelectionLoaded(true);
        }
    }, []);

    const {
        data: cart = [],
        isLoading: isCartLoading,
        isError: isCartError,
    } = useQuery({
        queryKey: ["get-cart"],
        queryFn: getCart,
    });

    const selectedItems = useMemo(() => {
        return cart.filter((item) => selectedIds.includes(item.id));
    }, [cart, selectedIds]);

    const subtotal = useMemo(() => {
        return selectedItems.reduce(
            (total, item) => total + item.product.price * item.quantity,
            0,
        );
    }, [selectedItems]);

    const shippingCost =
        selectedItems.length === 0 ? 0 : subtotal >= 500_000 ? 0 : 25_000;

    const grandTotal = subtotal + shippingCost;

    const checkoutMutation = useMutation({
        mutationFn: checkoutCart,

        onSuccess: async (response) => {
            sessionStorage.removeItem("checkout_cart_item_ids");

            await queryClient.invalidateQueries({ queryKey: ["get-cart"] });

            window.dispatchEvent(new Event("cart-updated"));

            setSuccessMessage(
                `Pesanan ${response.data.order_number} berhasil dibuat.`,
            );
        },

        onError: (error) => {
            if (axios.isAxiosError(error)) {
                setErrorMessage(
                    error.response?.data?.message ??
                    "Checkout gagal. Silakan coba kembali.",
                );
                return;
            }

            setErrorMessage("Terjadi kesalahan ketika checkout.");
        },
    });

    const updateAddress = (field: keyof CheckoutAddress, value: string) => {
        setAddress((previous) => ({
            ...previous,
            [field]: value,
        }));
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage("");

        if (selectedItems.length === 0) {
            setErrorMessage("Tidak ada produk yang dipilih.");
            return;
        }

        checkoutMutation.mutate({
            cart_item_ids: selectedItems.map((item) => item.id),
            address,
            payment_method: "cod",
        });
    };

    if (!selectionLoaded || isCartLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Memuat checkout...
                </p>
            </div>
        );
    }

    if (isCartError) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-destructive">Gagal mengambil data cart.</p>

                <Button onClick={() => router.push("/cart")}>
                    Kembali ke Keranjang
                </Button>
            </div>
        );
    }

    if (selectedItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">
                    Tidak ada produk yang dipilih.
                </p>

                <Button onClick={() => router.push("/cart")}>
                    Kembali ke Keranjang
                </Button>
            </div>
        );
    }

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

                    <form onSubmit={handleSubmit}>
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
                                                        updateAddress("city", event.target.value)
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
                                                            event.target.value.replace(/\D/g, ""),
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

                                    <CardContent>
                                        <div className="rounded-lg border-2 border-primary bg-accent/30 p-4">
                                            <div className="font-medium">
                                                COD (Bayar di Tempat)
                                            </div>

                                            <div className="mt-1 text-sm text-muted-foreground">
                                                Bayar ketika pesanan telah diterima.
                                            </div>
                                        </div>
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

                                        <CardDescription>
                                            {selectedItems.length} produk dipilih
                                        </CardDescription>
                                    </CardHeader>

                                    <CardContent className="space-y-4">
                                        <div className="max-h-[320px] space-y-4 overflow-y-auto pr-1">
                                            {selectedItems.map((item) => (
                                                <div key={item.id} className="flex gap-3">
                                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                                                        <img
                                                            src={item.product.thumbnail}
                                                            alt={item.product.title}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="line-clamp-2 text-sm font-medium">
                                                            {item.product.title}
                                                        </p>

                                                        <p className="mt-1 text-xs text-muted-foreground">
                                                            {formatRupiah(item.product.price)} ×{" "}
                                                            {item.quantity}
                                                        </p>

                                                        <p className="mt-1 text-sm font-semibold">
                                                            {formatRupiah(
                                                                item.product.price * item.quantity,
                                                            )}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
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
                                            disabled={checkoutMutation.isPending}
                                        >
                                            {checkoutMutation.isPending
                                                ? "Memproses..."
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
                isOpen={successMessage !== ""}
                title="Pesanan berhasil dibuat"
                subtitle={successMessage}
                buttonText="Selesai"
                onClose={() => router.push("/")}
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