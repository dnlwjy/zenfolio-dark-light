import "../app/globals.css";

export default { title: "Foundation/Texts" };

export const Bodytext = {
    render: () => (
        <div className="flex flex-col gap-5 max-w-200">
            <span className="tag text-(--white)">Inter, 18px</span>
            <p>I specialize in UX engineering focuses on design implementation with the basic core in user experience. Over the past 3 years, I’ve collaborated with international founders and firm owners across the world. I’ve also worked closely with backend engineers, which has given me a strong understanding of end-to-end development.</p>
            <p>This design system provides a collection of reusable components, design tokens, and documentation that help maintain consistency across my website. This way, everything becomes visible to the entire team making it easier to spot any flaws or to suggest improvements without technical knowledge.</p>
        </div>
    ),
};

export const Caption = {
    render: () => (
        <div className="flex flex-col gap-5 max-w-200">
            <span className="tag text-(--white)">Inter, 12px, Uppercase</span>
            <span className="tag">The Quick Brown Fox Jumps Over the Lazy Dog</span>
        </div>
    ),
};