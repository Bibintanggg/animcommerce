import { Product } from "@/types/product";

export interface Category {
  id: string;
  name: string;
  nameJp: string;
  description: string;
  count: number;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  text: string;
  rating: number;
  product: string;
}

export const testimonials: Testimonial[] = [];

// export const featuredProducts: Product[] = [
//   {
//     id: 1,
//     name: "Demon Slayer Tanjiro Figure",
//     nameJp: "鬼滅の刃",
//     price: 89000,
//     originalPrice: 120000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1608889175638-9322300c369e?w=600&q=80",
//     badge: "Sale",
//     rating: 4.9,
//     reviews: 248,
//   },
//   {
//     id: 2,
//     name: "Attack on Titan Levi Premium",
//     nameJp: "進撃の巨人",
//     price: 145000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&q=80",
//     isBestSeller: true,
//     rating: 4.8,
//     reviews: 182,
//   },
//   {
//     id: 3,
//     name: "One Piece Luffy Gear 5",
//     nameJp: "ワンピース",
//     price: 210000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1613376023733-0a73315d9b06?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 5.0,
//     reviews: 67,
//   },
//   {
//     id: 4,
//     name: "Jujutsu Kaisen Gojo Art Book",
//     nameJp: "呪術廻戦",
//     price: 55000,
//     category: "manga",
//     image: "https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=600&q=80",
//     rating: 4.7,
//     reviews: 135,
//   },
//   {
//     id: 5,
//     name: "Spirited Away Plush Set",
//     nameJp: "千と千尋の神隠し",
//     price: 78000,
//     originalPrice: 95000,
//     category: "collectibles",
//     image: "https://images.unsplash.com/photo-1587691592099-24045742c181?w=600&q=80",
//     badge: "Sale",
//     rating: 4.6,
//     reviews: 301,
//   },
//   {
//     id: 6,
//     name: "Naruto Hokage Cloak",
//     nameJp: "ナルト",
//     price: 185000,
//     category: "apparel",
//     image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 4.5,
//     reviews: 89,
//   },
// ];

// export const newArrivals: Product[] = [
//   {
//     id: 7,
//     name: "Evangelion Unit-01 Neon",
//     nameJp: "新世紀エヴァンゲリオン",
//     price: 320000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 5.0,
//     reviews: 14,
//   },
//   {
//     id: 8,
//     name: "My Hero Academia Deku",
//     nameJp: "僕のヒーローアカデミア",
//     price: 95000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 4.8,
//     reviews: 28,
//   },
//   {
//     id: "9",
//     name: "Chainsaw Man Pochita",
//     nameJp: "チェンソーマン",
//     price: 65000,
//     category: "collectibles",
//     image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 4.9,
//     reviews: 43,
//   },
//   {
//     id: "10",
//     name: "Bleach Ichigo Limited",
//     nameJp: "ブリーチ",
//     price: 175000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1617854818583-09e7f077a156?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 4.7,
//     reviews: 19,
//   },
//   {
//     id: "11",
//     name: "Tokyo Ghoul Ken Kaneki",
//     nameJp: "東京喰種",
//     price: 130000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1608378831396-5f4d90b7dff9?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 4.8,
//     reviews: 31,
//   },
//   {
//     id: "12",
//     name: "Haikyuu Shoyo Hinata",
//     nameJp: "ハイキュー",
//     price: 82000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1555816698-d7c2c9af58a3?w=600&q=80",
//     isNew: true,
//     badge: "New",
//     rating: 4.6,
//     reviews: 22,
//   },
// ];

// export const bestSellers: Product[] = [
//   {
//     id: "13",
//     name: "Dragon Ball Goku Ultra",
//     nameJp: "ドラゴンボール",
//     price: 250000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1559780790-b2d28e8e1de7?w=600&q=80",
//     isBestSeller: true,
//     rating: 4.9,
//     reviews: 512,
//   },
//   {
//     id: "14",
//     name: "Death Note Complete Manga",
//     nameJp: "デスノート",
//     price: 480000,
//     category: "manga",
//     image: "https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=600&q=80",
//     isBestSeller: true,
//     rating: 4.9,
//     reviews: 436,
//   },
//   {
//     id: "15",
//     name: "Studio Ghibli Totoro XL",
//     nameJp: "となりのトトロ",
//     price: 125000,
//     originalPrice: 155000,
//     category: "collectibles",
//     image: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?w=600&q=80",
//     isBestSeller: true,
//     rating: 4.8,
//     reviews: 698,
//   },
//   {
//     id: "16",
//     name: "Sword Art Online Kirito",
//     nameJp: "ソードアート・オンライン",
//     price: 165000,
//     category: "figures",
//     image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&q=80",
//     isBestSeller: true,
//     rating: 4.7,
//     reviews: 287,
//   },
// ];

// export const categories: Category[] = [
//   {
//     id: "figures",
//     name: "Anime Figures",
//     nameJp: "フィギュア",
//     description: "Premium scale figures from Japan's finest studios",
//     count: 248,
//     image: "https://images.unsplash.com/photo-1608889175638-9322300c369e?w=800&q=80",
//   },
//   {
//     id: "manga",
//     name: "Manga",
//     nameJp: "漫画",
//     description: "Original Japanese editions & collector sets",
//     count: 156,
//     image: "https://images.unsplash.com/photo-1535666669445-e8c15cd2e7d9?w=800&q=80",
//   },
//   {
//     id: "collectibles",
//     name: "Collectibles",
//     nameJp: "コレクション",
//     description: "Rare items, pins, plush & exclusive merchandise",
//     count: 312,
//     image: "https://images.unsplash.com/photo-1587691592099-24045742c181?w=800&q=80",
//   },
//   {
//     id: "apparel",
//     name: "Apparel",
//     nameJp: "アパレル",
//     description: "Authentic streetwear inspired by anime culture",
//     count: 94,
//     image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
//   },
// ];

// export const testimonials: Testimonial[] = [
//   {
//     id: "1",
//     name: "Ariana K.",
//     location: "Tokyo, Japan",
//     text: "The quality of the figures exceeded my expectations. Each piece is meticulously crafted — this is what premium anime merchandise should feel like.",
//     rating: 5,
//     product: "Attack on Titan Levi Premium",
//   },
//   {
//     id: "2",
//     name: "Marcus T.",
//     location: "Berlin, Germany",
//     text: "Finally an anime shop with the aesthetic of a luxury boutique. The packaging, the presentation — everything speaks to attention to detail.",
//     rating: 5,
//     product: "Dragon Ball Goku Ultra",
//   },
//   {
//     id: "3",
//     name: "Priya M.",
//     location: "Singapore",
//     text: "Ordered the Ghibli collection as a gift. Arrived perfectly wrapped in traditional Japanese paper. Genuinely moved by the thoughtfulness.",
//     rating: 5,
//     product: "Studio Ghibli Totoro XL",
//   },
//   {
//     id: "4",
//     name: "Lucas F.",
//     location: "São Paulo, Brazil",
//     text: "The manga collection is authentic — not reprints. I've been looking for original Japanese editions for years. NIHON is my only source now.",
//     rating: 5,
//     product: "Death Note Complete Manga",
//   },
// ];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
};
