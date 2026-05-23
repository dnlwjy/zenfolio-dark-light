import Link from 'next/link'

interface AProps {
  title: string;
  link?: string;
  styles?: string;
}

const A = ({
  title,
  link = "",
  styles = ""
}: AProps) => {
  const wrapperStyles = `group inline-block w-fit relative ${styles}`

  // Link Types
  const internal = link.startsWith('/') && !link.startsWith('//');
  const external = link.startsWith('http://') || link.startsWith('https://') || link.startsWith('//');
  const TelOrMail = link.startsWith('tel:') || link.startsWith('mailto:')

  // JSX CONTENT
  const CONTENT = (
    <>
      {title}
      <span
        className="absolute inset-y-0 my-auto h-0.5 bg-(--gray) group-hover:left-0 group-hover:w-full right-0 w-0 transition-all duration-400 ease-in-out pointer-events-none"
      />
    </>
  )

  if (link) {
    if (external) {
      return (
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className={wrapperStyles}
        >
          {CONTENT}
        </a>
      );
    };

    if (internal) {
      return (
        <Link
          href={link}
          className={wrapperStyles}
        >
          {CONTENT}
        </Link>
      );
    };

    if (TelOrMail) {
      return (
        <a
          href={link}
          className={wrapperStyles}
        >
          {CONTENT}
        </a>
      );
    };
  }

  // SAFETY NET
  return (
      <span className={wrapperStyles}>
        {title}
      </span>
    )
}

export default A;