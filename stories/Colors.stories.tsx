import "../app/globals.css";

export default { title: "Foundation/Colors" };

const colors = [
  { label: "Background", color: "bg-(--black)" },
  { label: "Divider", color: "bg-(--divider)" },
  { label: "Gray", color: "bg-(--gray)" },
  { label: "Bodytext", color: "bg-(--bodytext)" },
  { label: "Foreground", color: "bg-(--white)" },
];

const Swatch = ({ label, color }: { label: string; color: string }) => (
  <div className="flex flex-col gap-3 w-40">
    <div className={`w-full h-30 border border-(--divider) ${color}`} />
    <div className="flex flex-col gap-1">
      <p className="tag text-center">{label}</p>
    </div>
  </div>
);

export const AllColors = {
  name: "All Colors",
  render: () => (
    <section className="flex flex-col gap-20 w-full items-center">
        <p>Click <span className="text-(--white)">(T)</span> to switch themes</p>
      <div className="flex flex-wrap gap-6 justify-center">
        {colors.map((c) => (
          <Swatch key={c.label} {...c} />
        ))}
      </div>
    </section>
  ),
};
