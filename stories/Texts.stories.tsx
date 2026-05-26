import "../app/globals.css";
import Divider from "../components/Divider";

export default { title: "Foundations/Texts" };

export const AllTexts = {
    name: "All Texts",
    render: () => (
        <section className="flex flex-col gap-12 w-full items-center">

            <div className="flex flex-col gap-4 items-center">
                <h1>Texts</h1>
                <p>Text styles used throughout the website, optimized for larger screens</p>
            </div>

            <Divider styles="mt-4"/>

            <div className="flex flex-col gap-5 w-full max-w-200">

                <span className="tag">Last updated: <span className="text-(--white)">January 2025</span></span>

                <p>
                    I specialize in UX engineering focuses on design implementation with the basic core in user experience. Over the past 3 years, I’ve collaborated with international founders and firm owners across the world. I’ve also worked closely with backend engineers, which has given me a strong understanding of end-to-end development.
                </p>

                <p>
                    This design system provides a collection of reusable components, design tokens, and documentation that help maintain consistency across my website. This way, everything becomes visible to the entire team making it easier to spot any flaws or to suggest improvements without technical knowledge.
                </p>

                <div className="flex flex-col gap-0 mt-6">
                    <Divider styles="mt-4 w-full mb-4" variant="right" title="Paragraph"/>
                    <p>font-family: <span className="text-(--white)">Inter</span></p>
                    <p>font-size: <span className="text-(--white)">18px (20px for larger screens)</span></p>
                    <p>line-height: <span className="text-(--white)">160%</span></p>
                    <p>text-align: <span className="text-(--white)">start</span></p>
                </div>

                <div className="flex flex-col gap-0 mt-6">
                    <Divider styles="mt-4 w-full mb-4" variant="right" title="Caption"/>
                    <p>font-family: <span className="text-(--white)">Inter</span></p>
                    <p>font-size: <span className="text-(--white)">12px</span></p>
                    <p>text-align: <span className="text-(--white)">start</span></p>
                    <p>text-transform: <span className="text-(--white)">uppercase</span></p>
                    <p>letter-spacing: <span className="text-(--white)">0.15em</span></p>
                </div>
            </div>

        </section>
    ),
};
