interface Props {
  label: string;
  value: number | string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

const COLORS = {
  blue: "bg-blue-50 text-blue-700 border-blue-200",
  green: "bg-green-50 text-green-700 border-green-200",
  purple: "bg-purple-50 text-purple-700 border-purple-200",
  orange: "bg-orange-50 text-orange-700 border-orange-200",
  red: "bg-red-50 text-red-700 border-red-200",
};

export default function StatsCard({ label, value, color = "blue" }: Props) {
  return (
    <div className={`rounded-lg border p-4 ${COLORS[color]}`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm mt-1 opacity-75">{label}</p>
    </div>
  );
}
