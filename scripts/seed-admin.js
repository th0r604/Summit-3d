#!/usr/bin/env node

/**
 * Seed script to create the first admin user in Airtable.
 *
 * Usage:
 *   node scripts/seed-admin.js <email> <password> <role>
 *
 * Example:
 *   node scripts/seed-admin.js admin@cf3.ca mypassword nf_admin
 *
 * Roles: nf_admin, club_admin, member
 *
 * Requires AIRTABLE_API_KEY and AIRTABLE_BASE_ID in .env.local
 */

const Airtable = require("airtable");
const bcrypt = require("bcryptjs");
const { readFileSync } = require("fs");
const { resolve } = require("path");

// Load .env.local
const envPath = resolve(__dirname, "..", ".env.local");
const envContent = readFileSync(envPath, "utf-8");
const env = {};
envContent.split("\n").forEach((line) => {
  const [key, ...rest] = line.split("=");
  if (key && rest.length) env[key.trim()] = rest.join("=").trim();
});

const AIRTABLE_API_KEY = env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = env.AIRTABLE_BASE_ID;

if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
  console.error("Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID in .env.local");
  process.exit(1);
}

const [, , email, password, role = "nf_admin"] = process.argv;

if (!email || !password) {
  console.error("Usage: node scripts/seed-admin.js <email> <password> [role]");
  console.error("Roles: nf_admin, club_admin, member");
  process.exit(1);
}

const validRoles = ["nf_admin", "club_admin", "member"];
if (!validRoles.includes(role)) {
  console.error(`Invalid role "${role}". Must be one of: ${validRoles.join(", ")}`);
  process.exit(1);
}

async function main() {
  const airtable = new Airtable({ apiKey: AIRTABLE_API_KEY });
  const base = airtable.base(AIRTABLE_BASE_ID);
  const table = base("People");

  // Check if user already exists
  const existing = await table
    .select({
      filterByFormula: `LOWER({Email}) = "${email.toLowerCase()}"`,
      maxRecords: 1,
    })
    .all();

  if (existing.length > 0) {
    console.error(`User with email "${email}" already exists (ID: ${existing[0].id})`);
    process.exit(1);
  }

  // Hash password
  const hash = await bcrypt.hash(password, 12);

  // Create the record
  const records = await table.create([
    {
      fields: {
        "First Name": "Admin",
        "Last Name": "User",
        Email: email.toLowerCase(),
        Password: hash,
        Role: role,
      },
    },
  ]);

  const record = records[0];
  console.log(`Admin user created successfully!`);
  console.log(`  ID:    ${record.id}`);
  console.log(`  Email: ${email.toLowerCase()}`);
  console.log(`  Role:  ${role}`);
  console.log(`\nYou can now log in at http://localhost:3000/login`);
}

main().catch((err) => {
  console.error("Error:", err.message);
  process.exit(1);
});
