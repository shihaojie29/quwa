import { mount } from "@vue/test-utils";
import { describe, expect, it } from "vitest";
import TripItemEditorPopup from "../../src/components/editor/TripItemEditorPopup.vue";

describe("TripItemEditorPopup", () => {
  it("shows transport-specific inputs when editing a transport item", () => {
    const wrapper = mount(TripItemEditorPopup, {
      props: {
        modelValue: true,
        draft: {
          id: "transport-1",
          kind: "transport",
          title: "高铁",
          time: "08:30",
          from: "杭州",
          to: "上海",
        },
      },
    });

    expect(wrapper.text()).toContain("出发站");
    expect(wrapper.text()).toContain("到达站");
  });
});
