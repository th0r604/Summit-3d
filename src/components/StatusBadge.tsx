const STATUS_COLORS: Record<string, string> = {
  Active: "bg-green-100 text-green-800",
  Expired: "bg-red-100 text-red-800",
  Pending: "bg-yellow-100 text-yellow-800",
  Suspended: "bg-orange-100 text-orange-800",
  Banned: "bg-red-100 text-red-800",
  Inactive: "bg-gray-100 text-gray-800",
  Planned: "bg-blue-100 text-blue-800",
  "Open Registration": "bg-green-100 text-green-800",
  "In Progress": "bg-purple-100 text-purple-800",
  Completed: "bg-gray-100 text-gray-700",
  Cancelled: "bg-red-100 text-red-800",
  Assigned: "bg-blue-100 text-blue-800",
  Confirmed: "bg-green-100 text-green-800",
  "No-Show": "bg-red-100 text-red-800",
  Registered: "bg-blue-100 text-blue-800",
  Attended: "bg-green-100 text-green-800",
  Draft: "bg-gray-100 text-gray-600",
  "Pending Approval": "bg-yellow-100 text-yellow-800",
  Pass: "bg-green-100 text-green-800",
  Fail: "bg-red-100 text-red-800",
  Incomplete: "bg-yellow-100 text-yellow-800",
  Audit: "bg-gray-100 text-gray-700",
};

export default function StatusBadge({ status }: { status: string }) {
  const colors = STATUS_COLORS[status] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${colors}`}>
      {status}
    </span>
  );
}
