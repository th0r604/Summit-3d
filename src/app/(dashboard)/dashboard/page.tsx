import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = session.user as Record<string, unknown>;
  const role = (user.role as string) || "member";
  const name = user.name || "User";

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome, {String(name)}</h1>
        <p className="text-gray-500 mt-1">
          {role === "if_admin" && "International Federation Administrator"}
          {role === "nf_admin" && "National Federation Administrator"}
          {role === "club_admin" && "Club Administrator"}
          {role === "member" && "Member Dashboard"}
        </p>
      </div>

      {/* IF Admin */}
      {role === "if_admin" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashCard href="/federation/countries" title="Countries" desc="Manage national federations" />
            <DashCard href="/federation/events" title="Global Events" desc="International competitions" />
            <DashCard href="/federation/officials" title="Officials" desc="International technical officials" />
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            As an IF Admin, you also have full access to all National Federation tools below.
          </div>
          <NFAdminSection />
        </div>
      )}

      {/* NF Admin */}
      {role === "nf_admin" && <NFAdminSection />}

      {/* Club Admin */}
      {(role === "club_admin") && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashCard href="/club/members" title="Club Members" desc="Manage your members" />
            <DashCard href="/club/athletes" title="Athletes" desc="Competition profiles" />
            <DashCard href="/club/events" title="Events" desc="View & register for events" />
          </div>
          <MemberSection />
        </div>
      )}

      {/* Member */}
      {role === "member" && <MemberSection />}
    </div>
  );
}

function NFAdminSection() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">National Federation</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <DashCard href="/people" title="People" desc="All members" />
        <DashCard href="/athletes" title="Athletes" desc="Competition profiles" />
        <DashCard href="/clubs" title="Clubs" desc="Affiliated clubs" />
        <DashCard href="/events" title="Events" desc="Competitions & seminars" />
        <DashCard href="/technical-officials" title="Officials" desc="Technical officials" />
        <DashCard href="/to-training" title="TO Training" desc="Training records" />
        <DashCard href="/memberships" title="Memberships" desc="Membership management" />
        <DashCard href="/news" title="News" desc="CFFF news" />
      </div>
    </div>
  );
}

function MemberSection() {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 mt-6">My Profile</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DashCard href="/me/profile" title="My Profile" desc="View & edit your info" />
        <DashCard href="/me/events" title="My Events" desc="Registrations & results" />
        <DashCard href="/me/certifications" title="Certifications" desc="Training & certs" />
      </div>
    </div>
  );
}

function DashCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block bg-white border rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition"
    >
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
    </Link>
  );
}
