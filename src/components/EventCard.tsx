import StatusBadge from "./StatusBadge";

interface Props {
  event: {
    id: string;
    fields: Record<string, unknown>;
  };
  onRsvp?: (eventId: string) => void;
  showRsvpButton?: boolean;
  userRsvpStatus?: string | null;
}

export default function EventCard({ event, onRsvp, showRsvpButton, userRsvpStatus }: Props) {
  const fields = event.fields;

  return (
    <div className="bg-white rounded-lg border p-5 hover:border-gray-300 transition">
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-lg truncate">
              {String(fields["Event Name"] || "Untitled Event")}
            </h3>
            {fields["Event Type"] ? (
              <span className="flex-shrink-0 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">
                {String(fields["Event Type"])}
              </span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            {fields["Start Date"] ? (
              <span>{new Date(String(fields["Start Date"])).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
            ) : null}
            {fields["Location"] ? <span>{String(fields["Location"])}</span> : null}
            {fields["City"] && fields["Province"] ? (
              <span>{String(fields["City"])}, {String(fields["Province"])}</span>
            ) : null}
            {fields["Sanction Level"] ? (
              <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded text-xs">
                {String(fields["Sanction Level"])}
              </span>
            ) : null}
          </div>

          {fields["Description"] ? (
            <p className="text-sm text-gray-600 mt-3 line-clamp-2">{String(fields["Description"])}</p>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2 ml-4 flex-shrink-0">
          {fields["Status"] ? <StatusBadge status={String(fields["Status"])} /> : null}

          {userRsvpStatus ? (
            <span className="text-xs text-green-600 font-medium">{userRsvpStatus}</span>
          ) : showRsvpButton && onRsvp ? (
            <button
              onClick={() => onRsvp(event.id)}
              className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 text-sm whitespace-nowrap"
            >
              RSVP
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
