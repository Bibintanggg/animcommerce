import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

interface EditModal {
    open: boolean
    onOpenChange: (open: boolean) => void
    title: string
    description?: string
    url: string
    children: React.ReactNode
    trigger: React.ReactNode
}

export default function EditModal({ open, onOpenChange, title, description, children, trigger, url }: EditModal) {
    return (
        <div>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogTrigger asChild>
                    {trigger}
                </DialogTrigger>

                <DialogContent>
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