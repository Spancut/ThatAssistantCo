/**
 * A minimal in-memory stand-in for the Supabase query builder, shared
 * across unit tests that need to verify org-scoping in lib/server/*.ts
 * without a live Postgres/RLS engine. It implements just the chain shapes
 * this codebase actually uses (select/eq/is/order/limit/maybeSingle/
 * single/insert/update/delete, plus being awaitable directly).
 *
 * This is a regression guard for the application-layer query construction
 * (did we forget an .eq("org_id", ...)?) — it is NOT a substitute for real
 * Row Level Security, which is verified live against a real Supabase
 * project (see docs/build-plan.md).
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

type Row = Record<string, unknown>;

class FakeTable {
  private filters: Array<(row: Row) => boolean> = [];
  private mode: "select" | "insert" | "update" | "delete" = "select";
  private insertPayload: Row[] = [];
  private updatePayload: Row | null = null;
  private orderCol: string | null = null;
  private orderAsc = true;
  private limitN: number | null = null;
  private wantCount = false;

  constructor(private rows: Row[]) {}

  select(_cols?: string, opts?: { count?: string; head?: boolean }) {
    // Deliberately does NOT set this.mode: .insert(...).select() and
    // .update(...).select() are "return the affected row(s)", not a
    // separate select query, same as real PostgREST's return=representation.
    if (opts?.count) this.wantCount = true;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.mode = "insert";
    this.insertPayload = Array.isArray(payload) ? payload : [payload];
    return this;
  }

  update(payload: Row) {
    this.mode = "update";
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(col: string, val: unknown) {
    this.filters.push((row) => row[col] === val);
    return this;
  }

  is(col: string, val: null) {
    this.filters.push((row) => row[col] === val);
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }) {
    this.orderCol = col;
    this.orderAsc = opts?.ascending ?? true;
    return this;
  }

  limit(n: number) {
    this.limitN = n;
    return this;
  }

  private matched() {
    return this.rows.filter((row) => this.filters.every((f) => f(row)));
  }

  private execute(): { data: Row[]; error: null; count?: number } {
    if (this.mode === "insert") {
      const inserted = this.insertPayload.map((p) => ({
        id: p.id ?? crypto.randomUUID(),
        ...p,
      }));
      this.rows.push(...inserted);
      return { data: inserted, error: null };
    }
    if (this.mode === "update") {
      const matched = this.matched();
      for (const row of matched) Object.assign(row, this.updatePayload);
      return { data: matched, error: null };
    }
    if (this.mode === "delete") {
      const matched = this.matched();
      for (const row of matched) {
        const idx = this.rows.indexOf(row);
        if (idx >= 0) this.rows.splice(idx, 1);
      }
      return { data: matched, error: null };
    }

    let result = this.matched();
    if (this.orderCol) {
      const col = this.orderCol;
      const dir = this.orderAsc ? 1 : -1;
      result = [...result].sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av === bv) return 0;
        return av! > bv! ? dir : -dir;
      });
    }
    const count = this.wantCount ? result.length : undefined;
    if (this.limitN != null) result = result.slice(0, this.limitN);
    return { data: result, error: null, count };
  }

  maybeSingle() {
    const { data } = this.execute();
    if (data.length > 1) {
      return Promise.resolve({ data: null, error: { message: "multiple rows returned" } });
    }
    return Promise.resolve({ data: data[0] ?? null, error: null });
  }

  /** Mirrors real PostgREST: errors on zero OR more than one matched row. */
  single() {
    const { data } = this.execute();
    if (data.length !== 1) {
      return Promise.resolve({
        data: null,
        error: { message: "JSON object requested, multiple (or no) rows returned" },
      });
    }
    return Promise.resolve({ data: data[0], error: null });
  }

  then<T>(
    resolve: (value: { data: Row[]; error: null; count?: number }) => T,
    reject?: (reason: unknown) => T
  ) {
    return Promise.resolve(this.execute()).then(resolve, reject);
  }
}

export class FakeSupabase {
  private tables: Record<string, Row[]> = {};

  seed(table: string, rows: Row[]) {
    this.tables[table] = rows;
    return this;
  }

  rowsIn(table: string): Row[] {
    return this.tables[table] ?? [];
  }

  from(table: string) {
    if (!this.tables[table]) this.tables[table] = [];
    return new FakeTable(this.tables[table]);
  }

  asClient(): SupabaseClient<Database> {
    return this as unknown as SupabaseClient<Database>;
  }
}
