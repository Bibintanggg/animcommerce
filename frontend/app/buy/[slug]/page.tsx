"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

export default function BuyPage() {
    const [paymentMethod, setPaymentMethod] = useState("qris")

    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                        Checkout
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Lengkapi data di bawah ini untuk menyelesaikan pesananmu
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Form Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* 1. Data Penerima */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                                        1
                                    </Badge>
                                    Data Penerima
                                </CardTitle>
                                <CardDescription>
                                    Informasi orang yang akan menerima paket
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2 sm:col-span-2">
                                        <Label htmlFor="nama">
                                            Nama Lengkap <span className="text-destructive">*</span>
                                        </Label>
                                        <Input id="nama" placeholder="Masukkan nama lengkap" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="whatsapp">
                                            Nomor WhatsApp <span className="text-destructive">*</span>
                                        </Label>
                                        <Input id="whatsapp" type="tel" placeholder="08xxxxxxxxxx" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input id="email" type="email" placeholder="email@contoh.com" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 2. Alamat Pengiriman */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                                        2
                                    </Badge>
                                    Alamat Pengiriman
                                </CardTitle>
                                <CardDescription>
                                    Alamat lengkap tempat paket akan dikirim
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="alamat">
                                        Alamat Lengkap <span className="text-destructive">*</span>
                                    </Label>
                                    <Textarea
                                        id="alamat"
                                        placeholder="Nama jalan, nomor rumah, RT/RW, patokan..."
                                        rows={3}
                                    />
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="provinsi">
                                            Provinsi <span className="text-destructive">*</span>
                                        </Label>
                                        <Select>
                                            <SelectTrigger id="provinsi">
                                                <SelectValue placeholder="Pilih provinsi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jakarta">DKI Jakarta</SelectItem>
                                                <SelectItem value="jabar">Jawa Barat</SelectItem>
                                                <SelectItem value="jateng">Jawa Tengah</SelectItem>
                                                <SelectItem value="jatim">Jawa Timur</SelectItem>
                                                <SelectItem value="banten">Banten</SelectItem>
                                                <SelectItem value="yogya">DI Yogyakarta</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kota">
                                            Kota / Kabupaten <span className="text-destructive">*</span>
                                        </Label>
                                        <Select>
                                            <SelectTrigger id="kota">
                                                <SelectValue placeholder="Pilih kota/kabupaten" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="jakpus">Jakarta Pusat</SelectItem>
                                                <SelectItem value="jaksel">Jakarta Selatan</SelectItem>
                                                <SelectItem value="bandung">Bandung</SelectItem>
                                                <SelectItem value="surabaya">Surabaya</SelectItem>
                                                <SelectItem value="semarang">Semarang</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kecamatan">
                                            Kecamatan <span className="text-destructive">*</span>
                                        </Label>
                                        <Input id="kecamatan" placeholder="Nama kecamatan" />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="kodepos">
                                            Kode Pos <span className="text-destructive">*</span>
                                        </Label>
                                        <Input id="kodepos" placeholder="12345" maxLength={5} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* 3. Metode Pembayaran */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                                        3
                                    </Badge>
                                    Metode Pembayaran
                                </CardTitle>
                                <CardDescription>
                                    Pilih cara pembayaran yang kamu inginkan
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <RadioGroup
                                    value={paymentMethod}
                                    onValueChange={setPaymentMethod}
                                    className="space-y-3"
                                >
                                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                                        <RadioGroupItem value="qris" id="qris" />
                                        <Label htmlFor="qris" className="flex-1 cursor-pointer font-normal">
                                            <div className="font-medium">QRIS</div>
                                            <div className="text-sm text-muted-foreground">
                                                Scan QR Code via e-wallet / mobile banking
                                            </div>
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                                        <RadioGroupItem value="transfer" id="transfer" />
                                        <Label htmlFor="transfer" className="flex-1 cursor-pointer font-normal">
                                            <div className="font-medium">Transfer Bank</div>
                                            <div className="text-sm text-muted-foreground">
                                                BCA, Mandiri, BNI, BRI
                                            </div>
                                        </Label>
                                    </div>

                                    <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent/50 transition-colors">
                                        <RadioGroupItem value="cod" id="cod" />
                                        <Label htmlFor="cod" className="flex-1 cursor-pointer font-normal">
                                            <div className="font-medium">COD (Bayar di Tempat)</div>
                                            <div className="text-sm text-muted-foreground">
                                                Bayar saat barang sampai (area tertentu)
                                            </div>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </CardContent>
                        </Card>

                        {/* 4. Catatan */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-lg">
                                    <Badge variant="secondary" className="h-6 w-6 rounded-full p-0 flex items-center justify-center text-xs">
                                        4
                                    </Badge>
                                    Catatan Pesanan
                                </CardTitle>
                                <CardDescription>
                                    Opsional — tulis permintaan khusus jika ada
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    placeholder="Contoh: Tolong packing rapi, kasih bubble wrap ekstra..."
                                    rows={3}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <Card className="sticky top-6">
                            <CardHeader>
                                <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {/* Product Preview */}
                                <div className="flex gap-3">
                                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                                        <img
                                            src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=100&h=100&fit=crop"
                                            alt="Product"
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            Frieren Figure 1/7 Scale
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            Qty: 1
                                        </p>
                                        <p className="text-sm font-semibold mt-1">
                                            Rp 1.850.000
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>Rp 1.850.000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Ongkir</span>
                                        <span>Rp 25.000</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Biaya Admin</span>
                                        <span>Rp 2.500</span>
                                    </div>
                                </div>

                                <Separator />

                                <div className="flex justify-between font-semibold">
                                    <span>Total</span>
                                    <span className="text-lg">Rp 1.877.500</span>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="lg">
                                    Bayar Sekarang
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}