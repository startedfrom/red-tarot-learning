import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

const tables = [
  "profiles",
  "lesson_completions",
  "quiz_attempts",
  "favorite_cards",
  "study_days",
  "user_state",
] as const;

function readProjectFile(relativePath: string): string {
  const absolutePath = path.join(process.cwd(), relativePath);
  assert.equal(existsSync(absolutePath), true, `${relativePath} must exist`);
  return readFileSync(absolutePath, "utf8");
}

function tableDefinition(sql: string, table: (typeof tables)[number]): string {
  const match = sql.match(
    new RegExp(
      `create\\s+table\\s+if\\s+not\\s+exists\\s+public\\.${table}\\s*\\(([\\s\\S]*?)\\n\\);`,
      "i",
    ),
  );
  assert.ok(match, `public.${table} must be created idempotently`);
  return match[1].replace(/\s+/g, " ").trim().toLowerCase();
}

function policyDefinition(
  sql: string,
  table: (typeof tables)[number],
  operation: "select" | "insert" | "update" | "delete",
): string {
  const match = sql.match(
    new RegExp(
      `create\\s+policy\\s+[^;]+?\\s+on\\s+public\\.${table}\\s+for\\s+${operation}\\b([\\s\\S]*?);`,
      "i",
    ),
  );
  assert.ok(match, `${table} must have an owner-only ${operation} policy`);
  return match[0].replace(/\s+/g, " ").trim().toLowerCase();
}

function databaseTableDefinition(
  types: string,
  table: (typeof tables)[number],
): string {
  const tableStart = new RegExp(`^      ${table}: \\{`, "m").exec(types);
  assert.ok(tableStart, `${table} must have a database type block`);

  const afterStart = types.slice(tableStart.index + tableStart[0].length);
  const tableEnd = afterStart.search(/^      [a-z_]+: \{|^    \};/m);
  assert.notEqual(tableEnd, -1, `${table} database type block must close`);
  return afterStart.slice(0, tableEnd);
}

function tableAccessRevocation(sql: string): {
  grantees: string[];
  tableList: string;
} {
  const match = sql.match(
    /revoke\s+all\s+on\s+table([\s\S]*?)from\s+([^;]+);/i,
  );
  assert.ok(match, "table access must be explicitly revoked");
  return {
    tableList: match[1].replace(/\s+/g, " ").trim().toLowerCase(),
    grantees: match[2]
      .split(",")
      .map((role) => role.trim().toLowerCase()),
  };
}

test("creates every user progress table with the required columns", () => {
  const sql = readProjectFile(
    "supabase/migrations/202608020001_user_progress.sql",
  );
  const definitions = Object.fromEntries(
    tables.map((table) => [table, tableDefinition(sql, table)]),
  ) as Record<(typeof tables)[number], string>;

  assert.match(
    definitions.profiles,
    /user_id uuid primary key references auth\.users\s*\(id\) on delete cascade/,
  );
  assert.match(definitions.profiles, /display_name text/);
  assert.match(
    definitions.profiles,
    /created_at timestamptz not null default now\(\)/,
  );
  assert.match(
    definitions.profiles,
    /updated_at timestamptz not null default now\(\)/,
  );

  assert.match(definitions.lesson_completions, /lesson_id text not null/);
  assert.match(
    definitions.lesson_completions,
    /completed_at timestamptz not null default now\(\)/,
  );
  assert.match(
    definitions.lesson_completions,
    /primary key\s*\(user_id, lesson_id\)/,
  );

  assert.match(definitions.quiz_attempts, /lesson_id text not null/);
  assert.match(definitions.quiz_attempts, /correct boolean not null/);
  assert.match(
    definitions.quiz_attempts,
    /answered_at timestamptz not null default now\(\)/,
  );
  assert.match(
    definitions.quiz_attempts,
    /primary key\s*\(user_id, lesson_id\)/,
  );

  assert.match(definitions.favorite_cards, /card_id text not null/);
  assert.match(
    definitions.favorite_cards,
    /favorite boolean not null default true/,
  );
  assert.match(
    definitions.favorite_cards,
    /changed_at timestamptz not null default now\(\)/,
  );
  assert.match(
    definitions.favorite_cards,
    /primary key\s*\(user_id, card_id\)/,
  );

  assert.match(definitions.study_days, /study_date date not null/);
  assert.match(
    definitions.study_days,
    /created_at timestamptz not null default now\(\)/,
  );
  assert.match(
    definitions.study_days,
    /primary key\s*\(user_id, study_date\)/,
  );

  assert.match(definitions.user_state, /user_id uuid primary key/);
  assert.match(definitions.user_state, /last_lesson_id text/);
  assert.match(definitions.user_state, /last_lesson_changed_at timestamptz/);
  assert.match(
    definitions.user_state,
    /updated_at timestamptz not null default now\(\)/,
  );
});

test("cascades every user-owned row when its auth user is deleted", () => {
  const sql = readProjectFile(
    "supabase/migrations/202608020001_user_progress.sql",
  );

  for (const table of tables) {
    assert.match(
      tableDefinition(sql, table),
      /user_id uuid(?: not null)?(?: primary key)? references auth\.users\s*\(id\) on delete cascade/,
      `${table}.user_id must cascade from auth.users(id)`,
    );
  }
});

test("enables RLS and defines all owner-only operations", () => {
  const sql = readProjectFile(
    "supabase/migrations/202608020001_user_progress.sql",
  );

  for (const table of tables) {
    assert.match(
      sql,
      new RegExp(
        `alter\\s+table\\s+public\\.${table}\\s+enable\\s+row\\s+level\\s+security`,
        "i",
      ),
    );

    const select = policyDefinition(sql, table, "select");
    const insert = policyDefinition(sql, table, "insert");
    const update = policyDefinition(sql, table, "update");
    const remove = policyDefinition(sql, table, "delete");

    assert.match(select, /to authenticated/);
    assert.match(select, /using\s*\(\s*auth\.uid\(\) = user_id\s*\)/);
    assert.match(insert, /to authenticated/);
    assert.match(insert, /with check\s*\(\s*auth\.uid\(\) = user_id\s*\)/);
    assert.match(update, /to authenticated/);
    assert.match(update, /using\s*\(\s*auth\.uid\(\) = user_id\s*\)/);
    assert.match(update, /with check\s*\(\s*auth\.uid\(\) = user_id\s*\)/);
    assert.match(remove, /to authenticated/);
    assert.match(remove, /using\s*\(\s*auth\.uid\(\) = user_id\s*\)/);
  }
});

test("keeps policy and trigger setup safe to rerun", () => {
  const sql = readProjectFile(
    "supabase/migrations/202608020001_user_progress.sql",
  );

  for (const table of tables) {
    for (const operation of ["select", "insert", "update", "delete"]) {
      assert.match(
        sql,
        new RegExp(
          `drop\\s+policy\\s+if\\s+exists\\s+${table}_${operation}_own\\s+on\\s+public\\.${table}`,
          "i",
        ),
        `${table} ${operation} policy must be dropped before recreation`,
      );
    }
  }

  assert.match(sql, /create\s+or\s+replace\s+function/i);
  assert.match(
    sql,
    /drop\s+trigger\s+if\s+exists\s+on_auth_user_created\s+on\s+auth\.users/i,
  );
});

test("creates profiles from auth metadata through a hardened trigger", () => {
  const sql = readProjectFile(
    "supabase/migrations/202608020001_user_progress.sql",
  );

  assert.match(sql, /security\s+definer/i);
  assert.match(sql, /set\s+search_path\s*=\s*''/i);
  assert.match(
    sql,
    /coalesce\s*\(\s*new\.raw_user_meta_data\s*->>\s*'full_name'\s*,\s*new\.raw_user_meta_data\s*->>\s*'name'\s*\)/i,
  );
  assert.match(sql, /insert\s+into\s+public\.profiles/i);
  assert.match(
    sql,
    /create\s+trigger\s+on_auth_user_created[\s\S]*after\s+insert\s+on\s+auth\.users[\s\S]*for\s+each\s+row[\s\S]*execute\s+function/i,
  );
});

test("grants data access to authenticated users but not anonymous users", () => {
  const sql = readProjectFile(
    "supabase/migrations/202608020001_user_progress.sql",
  );
  const tableList = tables.map((table) => `public.${table}`).join(", ");
  const revocation = tableAccessRevocation(sql);

  assert.match(
    sql,
    /grant\s+usage\s+on\s+schema\s+public\s+to\s+authenticated/i,
  );
  assert.match(
    sql.replace(/\s+/g, " "),
    new RegExp(
      `grant select, insert, update, delete on table ${tableList.replaceAll(".", "\\.")} to authenticated`,
      "i",
    ),
  );
  for (const table of tables) {
    assert.match(
      revocation.tableList,
      new RegExp(`\\bpublic\\.${table}\\b`),
      `all access to ${table} must be revoked before granting authenticated access`,
    );
  }
  assert.ok(
    revocation.grantees.includes("anon"),
    "table access must be revoked from anon",
  );
  assert.ok(
    revocation.grantees.includes("public"),
    "table access must be revoked from public",
  );
  assert.doesNotMatch(sql, /service[_-]?role/i);
});

test("provides generated-style typed table contracts without any", () => {
  const types = readProjectFile("app/lib/supabase/database.types.ts");

  assert.match(types, /export type Json\s*=/);
  assert.match(types, /export type Database\s*=/);
  for (const table of tables) {
    const definition = databaseTableDefinition(types, table);
    for (const section of ["Row", "Insert", "Update", "Relationships"]) {
      assert.match(
        definition,
        new RegExp(`^        ${section}:`, "m"),
        `${table} needs a ${section} type`,
      );
    }
  }
  assert.doesNotMatch(types, /\bany\b/);
});

test("documents only public non-secret environment settings", () => {
  const env = readProjectFile(".env.example");
  const names = env
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith("#"))
    .map((line) => line.split("=", 1)[0]);

  assert.deepEqual(names, [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID",
    "NEXT_PUBLIC_ADSENSE_APPROVED",
    "NEXT_PUBLIC_ADSENSE_HOME_SLOT_ID",
    "NEXT_PUBLIC_ADSENSE_CARD_SLOT_ID",
    "NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT_ID",
    "NEXT_PUBLIC_ADSENSE_COMPLETION_SLOT_ID",
    "NEXT_PUBLIC_GA_MEASUREMENT_ID",
    "NEXT_PUBLIC_CONSENT_VERSION",
  ]);
  assert.match(env, /^NEXT_PUBLIC_ADSENSE_APPROVED=false$/m);
  assert.match(env, /^NEXT_PUBLIC_CONSENT_VERSION=1$/m);
  assert.doesNotMatch(env, /SERVICE_ROLE/i);
  assert.doesNotMatch(env, /(?:SECRET|PRIVATE_KEY|PASSWORD)=/i);
});
