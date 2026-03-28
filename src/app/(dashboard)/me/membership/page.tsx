"use client";

import { useSession } from "next-auth/react";
import StatusBadge from "@/components/StatusBadge";

export default function MyMembershipPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || "Member";

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">My Membership</h1>

      {/* Current Status */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Membership Status</h2>
          <StatusBadge status="Pending" />
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Athlete memberships are managed through <strong>Circle 21</strong>. Purchase a membership
          there to become a registered athlete with CF3.
        </p>
        <div className="bg-gray-50 rounded-lg p-4 text-sm">
          <dl className="grid grid-cols-2 gap-4">
            <div>
              <dt className="text-gray-500">Name</dt>
              <dd className="font-medium">{userName}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Type</dt>
              <dd className="font-medium">—</dd>
            </div>
            <div>
              <dt className="text-gray-500">Valid From</dt>
              <dd className="font-medium">—</dd>
            </div>
            <div>
              <dt className="text-gray-500">Valid Until</dt>
              <dd className="font-medium">—</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* How it works */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">How It Works</h2>
        <ol className="space-y-3 text-sm text-gray-600">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span>Purchase an athlete membership on <strong>Circle 21</strong></span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span>Your membership is synced to CF3 (may take up to 24 hours)</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span>Once active, you can RSVP to events as an <strong>Athlete</strong></span>
          </li>
        </ol>
      </div>

      {/* Club Registration Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">Club Affiliation</p>
        <p>Clubs register with CF3 through Circle 21. Contact your club admin if you need to be linked to a club.</p>
      </div>
    </div>
  );
}
