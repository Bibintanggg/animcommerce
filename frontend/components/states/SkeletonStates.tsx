import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRef } from "react";

interface Skeleteon {
    title: string
    showButton?: boolean
}
export default function SkeletonState({ title, showButton }: Skeleteon) {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (dir: "left" | "right") => {
        if (!scrollRef.current) return;
        const amount = 320;
        scrollRef.current.scrollBy({
            left: dir === "right" ? amount : -amount,
            behavior: "smooth",
        });
    };


    return (
        <section className="container mx-auto py-10">
            <div className="px-6 lg:px-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 lg:mb-14">
                <div>
                    <p className="text-[#BC002D] text-xs tracking-[0.2em] uppercase font-medium mb-3">
                        新着商品
                    </p>
                    <h2
                        className="font-display text-[#1A1A1A] leading-tight"
                        style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
                    >
                        {title}
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {showButton && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => scroll("left")}
                                className="w-10 h-10 border border-[#E5E3DF] flex items-center justify-center hover:border-[#BC002D] hover:text-[#BC002D] transition-all duration-200"
                                aria-label="Scroll left"
                            >
                                <ArrowLeft size={16} strokeWidth={1.5} />
                            </button>

                            <button
                                onClick={() => scroll("right")}
                                className="w-10 h-10 border border-[#E5E3DF] flex items-center justify-center hover:border-[#BC002D] hover:text-[#BC002D] transition-all duration-200"
                                aria-label="Scroll right"
                            >
                                <ArrowRight size={16} strokeWidth={1.5} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div
                        key={index}
                        className="overflow-hidden rounded-xl border"
                    >
                        <Skeleton className="aspect-square w-full" />

                        <div className="space-y-3 p-4">
                            <Skeleton className="h-5 w-full" />
                            <Skeleton className="h-5 w-3/4" />

                            <Skeleton className="h-4 w-24" />

                            <div className="pt-2">
                                <Skeleton className="h-10 w-full" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}