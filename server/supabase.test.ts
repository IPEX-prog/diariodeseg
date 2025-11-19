import { describe, expect, it } from "vitest";
import { supabase } from "./supabase";

describe("Supabase Integration", () => {
  it("should connect to Supabase and list buckets", async () => {
    const { data, error } = await supabase.storage.listBuckets();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(Array.isArray(data)).toBe(true);
  });

  it("should have valid credentials", async () => {
    // Try to access storage to validate credentials
    const { error } = await supabase.storage.listBuckets();
    
    expect(error).toBeNull();
  });
});
