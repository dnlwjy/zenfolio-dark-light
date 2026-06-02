import { IG, LI, Github } from "./IconLibrary";

interface FooterProps {
    styles?: string;
}

const socialMedia = [
    { name: "Instagram", link: "https://www.instagram.com/dnlwjy_/", icon: <IG styles="text-(--gray) hover:text-(--white) transition-colors duration-300" /> },
    { name: "LinkedIn", link: "https://www.linkedin.com/in/dnlwjy/", icon: <LI styles="text-(--gray) hover:text-(--white) transition-colors duration-300" /> },
    { name: "GitHub", link: "https://github.com/dnlwjy", icon: <Github styles="text-(--gray) hover:text-(--white) transition-colors duration-300" /> },
]

const Footer = ({
    styles = "",
}: FooterProps) => {
    return (
        <footer className={`flex flex-col gap-16 py-20 px-5 w-full items-center ${styles}`}>
            
            <span className="flex flex-wrap gap-6 items-center justify-center">
                {socialMedia.map((e) => (
                    <a
                        key={e.name}
                        href={e.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-(--white) transition-colors duration-300"
                    >
                        {e.icon}
                    </a>
                ))}
            </span>

            <span className="tag">© {new Date().getFullYear()} Daniel Wijaya / <a href="https://storybook.danielwijaya.com/" target="_blank" rel="noopener noreferrer">View Storybook</a></span>
        
        </footer>
    )
}

export default Footer;