import { Button } from "@/components/ui/button";
import Lottie from "lottie-react";
import { RefreshCw, WifiOff } from "lucide-react";
import React from "react";

interface ErrorStateProps {
    onRetry?: () => void;
    title: string
    assets: object
}

export default function ErrorState({ onRetry, title, assets }: ErrorStateProps) {
    return (
        <section className="flex min-h-[500px] flex-col items-center justify-center px-6 text-center">
            <div className="w-52">
                <Lottie
                    animationData={assets}
                    loop
                />
            </div>

            <span className="mb-3 rounded-full border px-4 py-1 text-sm text-muted-foreground">
                Error 500
            </span>

            <h2 className="max-w-xl text-4xl font-bold tracking-tight">
                Failed to load data {title}
            </h2>

            <p className="mt-4 max-w-md text-muted-foreground">
                We couldn't retrieve the data at this time. Please try refreshing the page or
                come back in a moment.
            </p>

            <div className="mt-8 flex gap-3">
                <Button onClick={onRetry}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                </Button>

                <Button
                    variant="outline"
                    onClick={() => window.location.reload()}
                >
                    Refresh Page
                </Button>
            </div>
        </section>
    );
}