import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import JournalTabBar from "../../src/components/journal/JournalTabBar.vue";

describe("JournalTabBar", () => {
  it("emits target tab when a nav item is clicked", async () => {
    const wrapper = mount(JournalTabBar, {
      props: { activeTab: "home" },
    });

    await wrapper.get('[data-tab="expense"]').trigger("click");
    expect(wrapper.emitted("change")?.[0]).toEqual(["expense"]);
  });
});
