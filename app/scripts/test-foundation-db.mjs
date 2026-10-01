import { execFileSync } from "node:child_process"
import { randomUUID } from "node:crypto"
import { fileURLToPath } from "node:url"

// Run against an isolated local PostgreSQL cluster, never the hosted app database.
const port = process.env.FOUNDATION_PG_PORT
const user = process.env.FOUNDATION_PG_USER
if (!port || !/^\d+$/.test(port) || !user) {
  throw new Error("Set FOUNDATION_PG_PORT and FOUNDATION_PG_USER for an isolated local PostgreSQL cluster.")
}
const executable = process.platform === "win32" ? "psql.exe" : "psql"
const database = `foundation_test_${randomUUID().replaceAll("-", "")}`
const args = ["-X", "-q", "-t", "-A", "-h", "127.0.0.1", "-p", port, "-U", user, "-v", "ON_ERROR_STOP=1"]
const run = (db, extra) => execFileSync(executable, [...args, "-d", db, ...extra], { stdio: "inherit", timeout: 60_000 })
run("postgres", ["-c", `CREATE DATABASE ${database}`])
try {
  run(database, ["-f", fileURLToPath(new URL("../supabase/tests/foundation_controls.test.sql", import.meta.url))])
} finally {
  // Only the freshly generated test database can be dropped.
  run("postgres", ["-c", `DROP DATABASE ${database} WITH (FORCE)`])
}
