import A from "./A"

interface SubInfoProps {
    title: string;
    subtitle?: string;
    styles?: string;
}

const SubInfo = ({
    title,
    subtitle,
    styles = ""
}: SubInfoProps) => {
    const isExternal = typeof subtitle === "string" && (subtitle.startsWith('http://') || subtitle.startsWith('https://') || subtitle.startsWith('//'));

    if (!subtitle) return null;

    return (
        <div className={`flex flex-col gap-2 sm:items-start items-center flex-1 border-b border-(--white)/15 pb-6 ${styles}`}>
            <dt className="tag text-(--gray)">{title}</dt>

            {isExternal ? (
                <dd><A title={subtitle} link={subtitle} styles="w-fit" /></dd>
            ) : (
                <dd className="text-(--white)">{subtitle}</dd>
            )}
        </div>
    )
}

export default SubInfo;