import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TravelPageShell from "../../src/components/journal/TravelPageShell.vue";

describe("TravelPageShell", () => {
  it("renders shell content and active tab", async () => {
    const wrapper = mount(TravelPageShell, {
      slots: { default: "<div data-test='content' />" },
      props: { activeTab: "expense" },
    });

    expect(wrapper.find('[data-test="content"]').exists()).toBe(true);
    expect(wrapper.get('[data-tab="expense"]').attributes("data-active")).toBe("true");

    await wrapper.get('[data-tab="notes"]').trigger("click");

    expect(wrapper.emitted("change")?.[0]).toEqual(["notes"]);
    expect(uni.redirectTo).not.toHaveBeenCalled();
  });
});
