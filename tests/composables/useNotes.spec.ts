import { describe, expect, it } from "vitest";
import { useNotes } from "@/composables/useNotes";

describe("useNotes", () => {
  it("appends a new outgoing note message", async () => {
    const notes = useNotes();

    await notes.ready;
    await notes.send("测试消息");

    expect(notes.notes.value.at(-1)?.content).toBe("测试消息");
  });
});
