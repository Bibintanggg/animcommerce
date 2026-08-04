import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { cn } from "@/lib/utils"

interface CreateModal {
    title: string
    description?: string
    url: string
    children: React.ReactNode
    trigger: React.ReactNode
    className?: string
}

export default function CreateModal({ title, description, children, trigger, url, className }: CreateModal) {
    return (
        <div>
            <Dialog>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>

                <DialogContent className={cn("max-h-[90vh] overflow-y-auto", className)}>
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        <DialogDescription>
                            {description}
                        </DialogDescription>
                    </DialogHeader>

                    {React.isValidElement(children)
                        ? React.cloneElement(
                            children as React.ReactElement<any>,
                            { url }
                        )
                        : children}
                </DialogContent>
            </Dialog>
        </div>
    )
}