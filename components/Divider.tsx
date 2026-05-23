interface DividerProps {
    variant?: keyof typeof variantDivider,
    title?: number | string
    styles?: string
}

const variantDivider = {
    left: {
        icon: "order-1",
        title: "order-2",
    },
    right: {
        icon: "order-2",
        title: "order-1",
    },
}

const Divider = ({
    variant = "left",
    title,
    styles = ""
}: DividerProps) => (
    <div className={`flex ${title ? "justify-between" : variant === "left" ? "justify-start" : "justify-end"} min-w-18 w-fit items-end border-b border-b-(--divider) gap-4 ${styles}`}>
        <svg className={variantDivider[variant].icon} width="42" height="5" viewBox="0 0 42 5" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M42 5H0L6.26866 0H35.7313L42 5Z" fill="var(--divider)" />
        </svg>
        {title && <span className={`tag text-(--gray) pb-2 ${variantDivider[variant].title}`}>{title}</span>}
    </div>
)

export default Divider