import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("MySQL schema", () => {
  it("declares all core Quwa tables", () => {
    const schema = readFileSync(resolve(process.cwd(), "server/sql/schema.sql"), "utf8");
    const requiredTables = [
      "users",
      "trips",
      "trip_members",
      "trip_reminders",
      "itinerary_days",
      "itinerary_items",
      "expenses",
      "notes",
      "checklist_items",
    ];

    for (const table of requiredTables) {
      expect(schema).toContain(`CREATE TABLE IF NOT EXISTS ${table}`);
    }
  });

  it("contains foreign keys for trip-owned child records", () => {
    const schema = readFileSync(resolve(process.cwd(), "server/sql/schema.sql"), "utf8");

    expect(schema).toContain("FOREIGN KEY (trip_id) REFERENCES trips(id)");
    expect(schema).toContain("FOREIGN KEY (paid_by_member_id) REFERENCES trip_members(id)");
  });
});

