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
        <dl className={`flex flex-col gap-2 sm:items-start items-center flex-1 border-b border-(--divider) pb-6 ${styles}`}>

            <dt className="tag text-(--gray)">{title}</dt>

            {isExternal ? (
                <A title={subtitle} link={subtitle} styles="w-fit" />
            ) : (
                <dd className="text-(--white)">{subtitle}</dd>
            )}
        </dl>
    )
}

export default SubInfo;