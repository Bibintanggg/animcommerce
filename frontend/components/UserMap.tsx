"use client"

import { data } from "@/data/user-data";
import { UserStatus, UserRole } from "@/types/user";
import { useEffect, useRef } from "react";

export default function UserMap() {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (mapInstanceRef.current) return;

        const L = require("leaflet");

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        const map = L.map(mapRef.current!, {
            center: [-2.5, 118],
            zoom: 5,
            zoomControl: true,
            scrollWheelZoom: false,
        });

        // Dark tile layer (CartoDB Dark Matter)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: "abcd",
            maxZoom: 19,
        }).addTo(map);

        // Custom circle marker for each user
        data.forEach((user) => {
            const roleColors: Record<UserRole, string> = {
                admin: "#7F77DD",
                superadmin: "#378ADD",
                customer: "#639922",
            };
            const statusColors: Record<UserStatus, string> = {
                active: "#639922",
                inactive: "#888780",
                banned: "#E24B4A",
            };

            const circle = L.circleMarker([user.lat, user.lng], {
                radius: 9,
                fillColor: statusColors[user.status],
                color: "#fff",
                weight: 2,
                opacity: 0.9,
                fillOpacity: 0.85,
            }).addTo(map);

            circle.bindPopup(`
                <div style="font-family: sans-serif; min-width: 160px;">
                    <div style="font-weight: 600; font-size: 13px; margin-bottom: 4px;">${user.name}</div>
                    <div style="font-size: 11px; color: #888; margin-bottom: 6px;">${user.email}</div>
                    <div style="display: flex; gap: 6px; flex-wrap: wrap;">
                        <span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; background: ${statusColors[user.status as UserStatus]}22; color: ${statusColors[user.status as UserStatus]}; font-weight: 500;">${user.status}</span>
                        <span style="font-size: 11px; padding: 2px 8px; border-radius: 99px; background: ${roleColors[user.role as UserRole]}22; color: ${roleColors[user.role as UserRole]}; font-weight: 500;">${user.role}</span>
                    </div>
                    <div style="font-size: 11px; color: #666; margin-top: 6px;">📍 ${user.city}</div>
                </div>
            `);
        });

        mapInstanceRef.current = map;

        return () => {
            map.remove();
            mapInstanceRef.current = null;
        };
    }, []);

    return (
        <div
            ref={mapRef}
            className="w-full rounded-xl overflow-hidden border border-border/40"
            style={{ height: 380 }}
        />
    );
}