interface TooltipProps {
    children: React.ReactNode;
    styles?: string;
    variant?: keyof typeof variantTooltip;
}

const variantTooltip = {
    normal: "rounded-lg",
    topleft: "rounded-lg rounded-tl-none",
    topright: "rounded-lg rounded-tr-none",
    bottomleft: "rounded-lg rounded-bl-none",
    bottomright: "rounded-lg rounded-br-none",
}

const Tooltip = ({
    children,
    variant = "normal",
    styles
}: TooltipProps) => {
    return (
        <div className={`flex flex-col items-start text-(--white) text-[12px] leading-[135%] gap-2 ${variantTooltip[variant]} border border-(--white)/15 bg-(--black) px-3 py-2 ${styles}`}>
            {children}
        </div>
    )
}

export default Tooltip