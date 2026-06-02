import "../app/globals.css";

export default { title: "Foundation/Spacings" };

const spacings = [
  { label: "1",  px: 4   },
  { label: "2",  px: 8   },
  { label: "3",  px: 12  },
  { label: "4",  px: 16  },
  { label: "5",  px: 20  },
  { label: "6",  px: 24  },
  { label: "8",  px: 32  },
  { label: "10", px: 40  },
  { label: "12", px: 48  },
  { label: "16", px: 64  },
  { label: "20", px: 80  },
  { label: "24", px: 96  },
  { label: "32", px: 128 },
];

const SpacingBox = ({ label, px }: { label: string; px: number }) => (
  <div className="flex flex-col items-center gap-3">
    <p className="tag">{label}</p>
    <div
      className="bg-(--white)/10 border border-(--divider) shrink-0"
      style={{ width: px, height: px }}
    />
    <p className="tag text-(--gray) normal-case tracking-normal">{px}px</p>
  </div>
);

export const AllSpacings = {
  name: "All Spacings",
  render: () => (
      <div className="flex flex-wrap gap-6 justify-center items-end w-full">
        {spacings.map(({ label, px }) => (
          <SpacingBox key={label} label={label} px={px} />
        ))}
      </div>
  ),
};
