import "../app/globals.css";

export default { title: "Foundation/Typography" };

const fonts = [
    {
        name: "Playfair Display",
        fontFamily: '"playfair", serif',
        pangram: "The quick brown fox jumps over the lazy dog.",
    },
    {
        name: "Inter",
        fontFamily: '"inter", sans-serif',
        pangram: "The quick brown fox jumps over the lazy dog.",
    },
];

export const AllFonts = {
    name: "All Fonts",
    render: () => (
        <section className="flex flex-col gap-12 w-full items-center">

            <div className="flex flex-col gap-0 w-full max-w-200 items-center">
            {fonts.map(({ name, fontFamily, pangram }) => (
                <div key={name} className="flex flex-col gap-5 w-full border-b border-(--divider) py-12 items-center">
                        <p className="tag">{name}</p>

                    {/* Pangram */}
                    <p className="text-(--white) text-[28px] text-center" style={{ fontFamily }}>
                        {pangram}
                    </p>
                </div>
            ))}
            </div>
        </section>
    ),
};