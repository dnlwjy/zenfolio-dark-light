import "../app/globals.css";

export default { title: "Foundations/Colors" };

const colors = [
  { variable: "--black", label: "Black", color: "bg-(--black)" },
  { variable: "--divider", label: "Divider", color: "bg-(--divider)" },
  { variable: "--gray", label: "Gray", color: "bg-(--gray)" },
  { variable: "--bodytext", label: "Bodytext", color: "bg-(--bodytext)" },
  { variable: "--white", label: "White", color: "bg-(--white)" },
];

const Swatch = ({ variable, label, color }: { variable: string; label: string; color: string }) => (
  <div className="flex flex-col gap-3 w-40">
    <div className={`w-full h-30 border border-(--divider) ${color}`} />
    <div className="flex flex-col gap-1">
      <p className="text-(--white) text-center">{label}</p>
      <p className="tag text-center">{variable}</p>
    </div>
  </div>
);

export const AllColors = {
  name: "All Colors",
  render: () => (
    <section className="flex flex-col gap-20 w-full items-center">
      <div className="flex flex-col gap-4 items-center">
        <h1>Colors</h1>
        <p>Switches with theme toggle (T)</p>
      </div>
      <div className="flex flex-wrap gap-6 justify-center">
        {colors.map((c) => (
          <Swatch key={c.variable} {...c} />
        ))}
      </div>
    </section>
  ),
};
