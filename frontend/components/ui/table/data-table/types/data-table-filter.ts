export interface DataTableFilterField<TData> {
    value: keyof TData & string
    placeholder?: string
    options?: {
        label: string
        value: string
        icon?: React.ComponentType<{
            className?: string
        }>
    }[]
}