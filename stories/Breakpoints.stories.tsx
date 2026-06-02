import "../app/globals.css";

export default { title: "Foundation/Breakpoints" };

const breakpoints = [
    { name: "0 – 680", tailwind: "(base)", description: "For mobiles" },
    { name: "680 – 1080", tailwind: "sm", description: "For tablets" },
    { name: "1080 – 1920", tailwind: "md", description: "For laptops" },
    { name: "1920+", tailwind: "lg", description: "For larger screens" },
];

export const AllBreakpoints = {
    name: "All Breakpoints",
    render: () => (
        <section className="flex flex-col gap-16 w-full items-center">
                <p>
                    Current viewport: {""}
                    <span className="text-(--white) sm:hidden">{breakpoints[0].tailwind}</span>
                    <span className="text-(--white) hidden sm:inline md:hidden">{breakpoints[1].tailwind}</span>
                    <span className="text-(--white) hidden md:inline lg:hidden">{breakpoints[2].tailwind}</span>
                    <span className="text-(--white) hidden lg:inline">{breakpoints[3].tailwind}</span>
                </p>
            <div className="flex flex-col gap-0 w-full max-w-200">
                {breakpoints.map(({ name, tailwind, description }) => (
                    <div key={name} className="flex items-center gap-6 py-5 border-b border-(--divider)">
                        <div className="flex-1 shrink-0">
                            <p className="text-(--white)">{tailwind}</p>
                        </div>
                        <div className="flex-1 shrink-0">
                            <p>{name}</p>
                        </div>

                        <p className="flex-1 shrink-0">{description}</p>
                    </div>
                ))}
            </div>

        </section>
    ),
};
