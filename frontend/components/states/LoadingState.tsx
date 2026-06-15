import Lottie from "lottie-react";
import loadingAnimation from "../../public/assets/lottie/loading.json";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
    return (
        <div className="relative">
            <div className="pointer-events-none opacity-40 blur-[2px]">
                <div className="grid grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i}>
                            <Skeleton className="aspect-[4/5] rounded-xl" />
                            <Skeleton className="mt-4 h-4 w-3/4" />
                            <Skeleton className="mt-2 h-4 w-1/2" />
                            <Skeleton className="mt-4 h-10 w-full" />
                        </div>
                    ))}
                </div>
            </div>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-52">
                    <Lottie
                        animationData={loadingAnimation}
                        loop
                    />
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                    Loading products...
                </p>
            </div>
        </div>
    );
}