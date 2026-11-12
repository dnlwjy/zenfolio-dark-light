interface FooterProps {
    styles?: string;
}

const Footer = ({
    styles = "",
}: FooterProps) => {
    return (
        <footer className={`flex flex-col gap-16 py-20 px-5 w-full items-center ${styles}`}>

            <span className="tag text-center">© {new Date().getFullYear()} Daniel Wijaya / <a href="https://storybook.danielwijaya.com/" target="_blank" rel="noopener noreferrer">View Storybook</a></span>
        
        </footer>
    )
}

export default Footer;