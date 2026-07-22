import React from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"

interface DeleteModal {
    title: string
    description?: string
    url: string
    children: React.ReactNode
    trigger: React.ReactNode
}

export default function DeleteModal({ title, description, children, trigger, url }: DeleteModal) {
    return (
        <div>
            <Dialog >
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