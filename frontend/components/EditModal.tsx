import React from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog"

interface EditModal {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    children: React.ReactNode
    trigger?: React.ReactNode
}

export default function EditModal({
    open,
    onOpenChange,
    title,
    description,
    children,
    trigger,
}: EditModal) {
    return (
        <div>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>

                <DialogContent className="max-h-[90vh] overflow-hidden">
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>

                        {description && (
                            <DialogDescription>
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>

                    <div className="max-h-[70vh] overflow-y-auto pr-2">
                        {children}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}