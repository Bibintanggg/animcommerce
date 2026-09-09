"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

import ErrorModal from "@/components/ErrorModal";
import { checkoutCart } from "@/services/order.service";
import { CheckoutAddress, CheckoutResult, PaymentMethod } from "@/types/checkout";
import PaymentInstructionModal from "@/components/PaymentInstructionModal";
import { ShippingDestination, ShippingOption } from "@/types/shipping";
import { calculateShippingCosts, searchShippingDestinations } from "@/services/shipping.service";


const initialAddress: CheckoutAddress = {
  receiver_name: "",
  phone_number: "",
  address_line: "",
  province: "",
  city: "",
  district: "",
  subdistrict: "",
  postal_code: "",
  destination_id: 0,
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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("qris");

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectionLoaded, setSelectionLoaded] = useState(false);

  const [address, setAddress] = useState<CheckoutAddress>(initialAddress);

  const [destinationKeyword, setDestinationKeyword] = useState("");
  const [destinationSearch, setDestinationSearch] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<ShippingDestination | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [paymentOrder, setPaymentOrder] = useState<CheckoutResult | null>(null);

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

  const totalWeight = useMemo(() => {
    return selectedItems.reduce((total, item) => {
      const weight = Number(item.product.weight);
      const quantity = Number(item.quantity);

      if (
        !Number.isFinite(weight) ||
        weight <= 0 ||
        !Number.isFinite(quantity) ||
        quantity <= 0
      ) {
        return total;
      }

      return total + weight * quantity;
    }, 0);
  }, [selectedItems]);
  const {
    data: destinations = [],
    isFetching: isSearchingDestination,
  } = useQuery({
    queryKey: ["shipping-destinations", destinationSearch],
    queryFn: () =>
      searchShippingDestinations(destinationSearch),
    enabled: destinationSearch.length >= 3,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });

  const {
    data: shippingOptions = [],
    isFetching: isCalculatingShipping,
    isError: isShippingError,
    error: shippingError,
  } = useQuery({
    queryKey: [
      "shipping-costs",
      selectedDestination?.id,
      totalWeight,
    ],
    queryFn: () =>
      calculateShippingCosts({
        destination_id: selectedDestination!.id,
        weight: totalWeight,
      }),
    enabled:
      selectedDestination !== null &&
      Number.isFinite(totalWeight) &&
      totalWeight > 0,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 1,
  });
  const subtotal = useMemo(() => {
    return selectedItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0,
    );
  }, [selectedItems]);

  const shippingCost = selectedShipping?.cost ?? 0;
  const grandTotal = subtotal + shippingCost;



  const checkoutMutation = useMutation({
    mutationFn: checkoutCart,

    onSuccess: async (response) => {
      sessionStorage.removeItem("checkout_cart_item_ids");

      await queryClient.invalidateQueries({
        queryKey: ["get-cart"],
      });

      window.dispatchEvent(new Event("cart-updated"));

      setPaymentOrder(response.data);
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

  const selectDestination = (destination: ShippingDestination) => {
    setSelectedDestination(destination);
    setSelectedShipping(null);

    setAddress((previous) => ({
      ...previous,
      province: destination.province_name,
      city: destination.city_name,
      district: destination.district_name,
      subdistrict: destination.subdistrict_name,
      postal_code: destination.zip_code,
      destination_id: destination.id,
    }));
  };

  const updateAddress = (field: keyof CheckoutAddress, value: string) => {
    setAddress((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkoutMutation.isPending) return;
    setErrorMessage("");

    if (selectedItems.length === 0) {
      setErrorMessage("Tidak ada produk yang dipilih.");
      return;
    }

    if (!selectedDestination) {
      setErrorMessage("Pilih tujuan pengiriman.");
      return;
    }

    if (!selectedShipping) {
      setErrorMessage("Pilih layanan kurir.");
      return;
    }

    checkoutMutation.mutate({
      cart_item_ids: selectedItems.map((item) => item.id),
      address,
      shipping: {
        courier_code: selectedShipping.code,
        service: selectedShipping.service,
      },
      payment_method: paymentMethod,
    });
  };

  if (!selectionLoaded || isCartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Memuat checkout...</p>
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
        <p className="text-muted-foreground">Tidak ada produk yang dipilih.</p>

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
                        Nama Lengkap <span className="text-destructive">*</span>
                      </Label>

                      <Input
                        required
                        id="receiver_name"
                        minLength={2}
                        maxLength={100}
                        value={address.receiver_name}
                        onChange={(event) =>
                          updateAddress("receiver_name", event.target.value)
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
                          updateAddress("phone_number", event.target.value)
                        }
                        placeholder="08xxxxxxxxxx"
                      />
                    </div>

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
                          updateAddress("address_line", event.target.value)
                        }
                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Alamat */}
                {/* <Card>
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

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="province">
                          Provinsi <span className="text-destructive">*</span>
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
                            <SelectItem value="Banten">Banten</SelectItem>
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
                          Kecamatan <span className="text-destructive">*</span>
                        </Label>

                        <Input
                          required
                          id="district"
                          maxLength={100}
                          value={address.district}
                          onChange={(event) =>
                            updateAddress("district", event.target.value)
                          }
                          placeholder="Nama kecamatan"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postal_code">
                          Kode Pos <span className="text-destructive">*</span>
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
                </Card> */}

                {/* Payment */}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Pilihan Pengiriman
                    </CardTitle>

                    <CardDescription>
                      Cari kelurahan tujuan dan pilih layanan kurir.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Input
                        value={destinationKeyword}
                        onChange={(event) =>
                          setDestinationKeyword(event.target.value)
                        }
                        placeholder="Contoh: Pisangan Timur"
                      />

                      <Button
                        type="button"
                        variant="outline"
                        disabled={
                          destinationKeyword.trim().length < 3 ||
                          isSearchingDestination
                        }
                        onClick={() => {
                          setDestinationSearch(
                            destinationKeyword.trim(),
                          );
                          setSelectedDestination(null);
                          setSelectedShipping(null);
                        }}
                      >
                        {isSearchingDestination ? "Mencari..." : "Cari"}
                      </Button>
                    </div>

                    {destinations.length > 0 && !selectedDestination && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          Pilih tujuan pengiriman:
                        </p>

                        {destinations.map((destination) => (
                          <button
                            key={destination.id}
                            type="button"
                            onClick={() => selectDestination(destination)}
                            className="w-full rounded-lg border p-3 text-left text-sm hover:border-primary hover:bg-muted"
                          >
                            {destination.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {selectedDestination && (
                      <div className="rounded-lg border bg-muted/40 p-3">
                        <p className="text-sm font-medium">Tujuan dipilih</p>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {selectedDestination.label}
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Total berat: {totalWeight} gram
                        </p>

                        <Button
                          type="button"
                          variant="ghost"
                          className="mt-2"
                          onClick={() => {
                            setSelectedDestination(null);
                            setSelectedShipping(null);
                          }}
                        >
                          Ganti tujuan
                        </Button>
                      </div>
                    )}

                    {isCalculatingShipping && (
                      <p className="text-sm text-muted-foreground">
                        Mengambil pilihan kurir...
                      </p>
                    )}

                    {selectedDestination &&
                      !isCalculatingShipping &&
                      shippingOptions.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium">
                            Pilih layanan kurir:
                          </p>

                          {shippingOptions.map((option) => {
                            const selected =
                              selectedShipping?.code === option.code &&
                              selectedShipping?.service === option.service;

                            return (
                              <button
                                key={`${option.code}-${option.service}-${option.cost}`}
                                type="button"
                                onClick={() => setSelectedShipping(option)}
                                className={`w-full rounded-lg border-2 p-3 text-left ${selected
                                    ? "border-primary bg-accent/30"
                                    : "border-border hover:border-primary"
                                  }`}
                              >
                                <div className="flex justify-between gap-4">
                                  <div>
                                    <p className="font-medium">
                                      {option.name} — {option.service}
                                    </p>

                                    <p className="text-xs text-muted-foreground">
                                      {option.description}
                                      {option.etd
                                        ? ` • Estimasi ${option.etd}`
                                        : ""}
                                    </p>
                                  </div>

                                  <p className="font-semibold">
                                    {formatRupiah(option.cost)}
                                  </p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                    {selectedDestination && (
                      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
                        <p className="font-medium">Tujuan dipilih</p>
                        <p className="mt-1 text-muted-foreground">
                          {selectedDestination.label}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Total berat: {totalWeight} gram
                        </p>
                      </div>
                    )}

                    {isCalculatingShipping && (
                      <p className="text-sm text-muted-foreground">
                        Menghitung ongkir...
                      </p>
                    )}

                    {isShippingError && (
                      <p className="text-sm text-destructive">
                        {axios.isAxiosError(shippingError)
                          ? shippingError.response?.data?.message ??
                          "Gagal menghitung ongkir."
                          : "Gagal menghitung ongkir."}
                      </p>
                    )}

                    {selectedDestination &&
                      !isCalculatingShipping &&
                      !isShippingError &&
                      shippingOptions.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          Tidak ada layanan pengiriman yang tersedia.
                        </p>
                      )}

                    {shippingOptions.length > 0 && (
                      <div className="space-y-2">
                        {shippingOptions.map((option) => {
                          const optionKey =
                            `${option.code}:${option.service}:${option.cost}`;

                          const selected =
                            selectedShipping?.code === option.code &&
                            selectedShipping?.service === option.service &&
                            selectedShipping?.cost === option.cost;

                          return (
                            <button
                              key={optionKey}
                              type="button"
                              onClick={() => setSelectedShipping(option)}
                              className={`w-full rounded-lg border-2 p-3 text-left ${selected
                                ? "border-primary bg-accent/30"
                                : "border-border"
                                }`}
                            >
                              <div className="flex justify-between gap-4">
                                <div>
                                  <p className="font-medium">
                                    {option.name} — {option.service}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {option.description}
                                    {option.etd
                                      ? ` • Estimasi ${option.etd}`
                                      : ""}
                                  </p>
                                </div>

                                <p className="font-semibold">
                                  {formatRupiah(option.cost)}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardContent>
                    <fieldset
                      disabled={checkoutMutation.isPending}
                      className="space-y-3"
                    >
                      <legend className="sr-only">
                        Pilih metode pembayaran
                      </legend>

                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 ${paymentMethod === "qris"
                          ? "border-primary bg-accent/30"
                          : "border-border"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="qris"
                          checked={paymentMethod === "qris"}
                          onChange={() => setPaymentMethod("qris")}
                          className="h-4 w-4"
                        />

                        <span>
                          <span className="block font-medium">QRIS</span>
                          <span className="block text-sm text-muted-foreground">
                            Tampilkan kode QR setelah checkout.
                          </span>
                        </span>
                      </label>

                      <label
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border-2 p-4 ${paymentMethod === "bca_va"
                          ? "border-primary bg-accent/30"
                          : "border-border"
                          }`}
                      >
                        <input
                          type="radio"
                          name="payment_method"
                          value="bca_va"
                          checked={paymentMethod === "bca_va"}
                          onChange={() => setPaymentMethod("bca_va")}
                          className="h-4 w-4"
                        />

                        <span>
                          <span className="block font-medium">
                            BCA Virtual Account
                          </span>
                          <span className="block text-sm text-muted-foreground">
                            Tampilkan nomor VA setelah checkout.
                          </span>
                        </span>
                      </label>

                      <p className="text-xs text-amber-700">
                        Pembayaran menggunakan Midtrans Sandbox dan hanya
                        digunakan untuk pengujian.
                      </p>
                    </fieldset>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardHeader>
                    <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>

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
                              {formatRupiah(item.product.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatRupiah(subtotal)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Ongkir</span>

                        <span>
                          {!selectedShipping
                            ? "Pilih pengiriman"
                            : formatRupiah(selectedShipping?.cost ?? 0)}
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
                      Harga dan ongkir akan dihitung ulang oleh server ketika
                      pesanan dibuat.
                    </p>
                  </CardContent>

                  <CardFooter>
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full"
                      disabled={
                        checkoutMutation.isPending ||
                        selectedDestination === null ||
                        selectedShipping === null
                      }
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

      <PaymentInstructionModal
        order={paymentOrder}
        onClose={() => {
          setPaymentOrder(null);
          router.push("/orders");
        }}
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
