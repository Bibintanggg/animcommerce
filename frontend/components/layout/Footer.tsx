import { Link, Share2, Music } from "lucide-react";

export default function Footer() {
  const columns = [
    {
      title: "Shop",
      links: ["Anime Figures", "Manga", "Collectibles", "Apparel", "New Arrivals", "Best Sellers"],
    },
    {
      title: "Support",
      links: ["Shipping Info", "Returns & Refunds", "Size Guide", "FAQ", "Track Order", "Contact Us"],
    },
    {
      title: "Company",
      links: ["Our Story", "Authenticity", "Press", "Careers", "Affiliates", "Gift Cards"],
    },
  ];

  return (
    <footer className="bg-[#1A1A1A] text-white">
      {/* Main footer */}
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 pt-16 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-[#BC002D] font-display text-2xl font-medium tracking-widest">
                日本
              </span>
              <div className="h-5 w-px bg-white/20" />
              <span className="font-semibold tracking-[0.2em] uppercase text-sm">
                NIHON
              </span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-8">
              Curating the finest anime merchandise and Japanese pop culture collectibles for enthusiasts worldwide.
            </p>
            <div className="flex items-center gap-4">
              {[Link, Share2, Music].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 border border-white/20 flex items-center justify-center hover:border-[#BC002D] hover:text-[#BC002D] transition-all duration-200"
                >
                  <Icon size={15} strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-xs tracking-[0.15em] uppercase text-white/40 mb-5">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-white/60 hover:text-white transition-colors duration-200"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            © 2025 NIHON Store. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Cookies"].map((item) => (
              <a key={item} href="#" className="text-white/30 text-xs hover:text-white/60 transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
