"use client";

import { useState } from "react";
import StatsCard from "@/components/StatsCard";

interface Country {
  id: string;
  name: string;
  code: string;
  status: string;
  clubs: number;
  athletes: number;
  officials: number;
}

// Placeholder — will be connected to an Airtable "Countries" table or IF API later
const PLACEHOLDER_COUNTRIES: Country[] = [
  { id: "1", name: "Canada", code: "CAN", status: "Active", clubs: 0, athletes: 0, officials: 0 },
];

export default function CountriesPage() {
  const [countries] = useState<Country[]>(PLACEHOLDER_COUNTRIES);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">National Federations</h1>
          <p className="text-sm text-gray-500 mt-1">Manage countries and their national federations</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm">
          Add Country
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatsCard label="Countries" value={countries.length} color="blue" />
        <StatsCard label="Total Clubs" value={countries.reduce((s, c) => s + c.clubs, 0)} color="green" />
        <StatsCard label="Total Athletes" value={countries.reduce((s, c) => s + c.athletes, 0)} color="purple" />
      </div>

      <div className="space-y-4">
        {countries.map((country) => (
          <div key={country.id} className="bg-white rounded-lg border p-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{country.name}</h3>
                <p className="text-sm text-gray-500">{country.code}</p>
              </div>
              <div className="flex gap-6 text-sm text-gray-500">
                <span>{country.clubs} clubs</span>
                <span>{country.athletes} athletes</span>
                <span>{country.officials} officials</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                country.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
              }`}>
                {country.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8 text-sm text-blue-800">
        This page will be connected to an International Federation API or Airtable table to manage country-level data across all national federations.
      </div>
    </div>
  );
}
