'use client'

import { useState } from 'react'
import { IconProps } from './IconLibrary'

type IconType = React.ElementType<IconProps>

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    title?: string,
    variant?: keyof typeof variantButton,
    afterClickedLogic?: boolean,
    click?: () => void,
    icon?: IconType,
    styles?: string,
}

const variantButton = {
    "primary": {
        base: "bg-(--white)",
        hover: "bg-(--black)/90"
    },
    "secondary": {
        base: "bg-(--divider)",
        hover: "bg-(--black)/50"
    },
    "disabled": {
        base: "bg-(--divider)/40 cursor-not-allowed",
        hover: "",
    }
}

const Button = ({
    title,
    variant = "primary",
    afterClickedLogic,
    click,
    icon: Icon,
    styles,
    ...rest
}: ButtonProps) => {
    const [buttonHover, setButtonHover] = useState(false)

    return (
        <button
            {...rest}
            onClick={click}
            disabled={variant === "disabled"}
            onMouseEnter={() => setButtonHover(true)}
            onMouseLeave={() => setButtonHover(false)}
            className={`
                    relative flex items-center justify-center ${title ? 'gap-3 px-8 h-12' : ''} ${styles}
                    ${variantButton[variant].base} ${variant === "disabled" ? "cursor-not-allowed" : "cursor-pointer"}
                    [clip-path:polygon(0_0,100%_0,100%_calc(100%-12px),calc(100%-12px)_100%,0_100%)]`}
        >
            <span className={`absolute bottom-0 right-0 ${variantButton[variant].hover} ${buttonHover || afterClickedLogic ? "w-full h-full rounded-none" : "w-0 h-0 rounded-[100px] rounded-br-none"} transition-all duration-600 ease-in-out`} />

            {Icon && <Icon size={20} styles={`text-white mix-blend-difference ${variant === "disabled" ? "opacity-30" : ""}`} />}
            <span className={`btn-text text-white mix-blend-difference ${variant === "disabled" ? "opacity-50" : ""}`}>{title}</span>
        </button>
    )
}

export default Button