import { fireEvent, screen } from "@testing-library/react";

import { sceneCoordsToViewportCoords } from "@excalidraw/excalidraw";
import { render, waitFor } from "@excalidraw/excalidraw/tests/test-utils";

import ExcalidrawApp from "../App";

const { h } = window;

describe("Hello Interview system design template", () => {
  it("applies the template with editable requirement fields and a design area", async () => {
    await render(<ExcalidrawApp />);

    fireEvent.click(screen.getByTestId("main-menu-trigger"));
    fireEvent.change(document.querySelector(".dropdown-select__language")!, {
      target: { value: "ru-RU" },
    });

    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Шаблоны" })).toBeTruthy(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Шаблоны" }));
    fireEvent.click(screen.getByRole("button", { name: "Hello Interview" }));

    await waitFor(() => {
      const text = h.elements
        .filter((element) => element.type === "text")
        .map((element) => element.text)
        .join("\n");

      expect(text).toContain("System Design: Application Name");
      expect(text).toContain("Functional Requirements");
      expect(text).toContain("Non-Functional Requirements");
      expect(text).toContain("Core Entities");
      expect(text).toContain("API");
      expect(text).toContain("High-Level Design");
      expect(text).toContain("Deep Dive Questions");
      expect(text).not.toContain("Системный дизайн");
      expect(text).not.toContain("Функциональные требования");
      expect(text).not.toContain("Enter");
      expect(
        h.elements
          .filter((element) => element.type === "text")
          .every((element) => element.textAlign === "left"),
      ).toBe(true);
      expect(h.state.currentItemTextAlign).toBe("left");

      expect(
        h.elements.some(
          (element) =>
            element.type === "rectangle" && element.strokeStyle === "dashed",
        ),
      ).toBe(false);

      expect(
        h.elements
          .filter((element) => element.type === "rectangle" && element.x === 80)
          .map((element) => element.height),
      ).toEqual([540, 540, 720, 1440]);

      const fieldRectangles = h.elements.filter(
        (element) => element.type === "rectangle" && element.x === 80,
      );
      expect(
        fieldRectangles.every(
          (element) => element.backgroundColor === "#ffffff",
        ),
      ).toBe(true);
      expect(
        h.elements
          .filter((element) => element.type === "text")
          .every(
            (element) =>
              (element.text === "High-Level Design" ||
                element.containerId !== null) &&
              element.autoResize === true,
          ),
      ).toBe(true);
      expect(
        fieldRectangles.every((container) => {
          const boundTextId = container.boundElements?.find(
            (boundElement) => boundElement.type === "text",
          )?.id;
          return h.elements.some(
            (element) =>
              element.type === "text" &&
              element.id === boundTextId &&
              element.containerId === container.id,
          );
        }),
      ).toBe(true);

      const highLevelDesignText = h.elements.find(
        (element) =>
          element.type === "text" && element.text === "High-Level Design",
      );
      expect(
        highLevelDesignText?.type === "text"
          ? highLevelDesignText.containerId
          : undefined,
      ).toBeNull();
      expect(
        highLevelDesignText?.type === "text"
          ? highLevelDesignText.backgroundColor
          : undefined,
      ).toBe("transparent");

      const apiRectangle = h.elements.find(
        (element) =>
          element.type === "rectangle" &&
          element.x === 80 &&
          element.height === 1440,
      );
      const deepDiveRectangle = h.elements.find(
        (element) =>
          element.type === "rectangle" &&
          element.customData?.templateRole === "deep-dive-questions-block",
      );
      expect(deepDiveRectangle?.width).toBe(2600);
      expect(deepDiveRectangle?.y! + deepDiveRectangle?.height!).toBe(
        apiRectangle?.y! + apiRectangle?.height!,
      );
    });

    const taskBlock = h.elements.find(
      (element) =>
        element.type === "text" &&
        element.customData?.templateRole === "task-requirements-block",
    );
    expect(taskBlock).toBeTruthy();
    expect(taskBlock?.type).toBe("text");
    expect(taskBlock?.width).toBe(1030);
    expect(
      h.elements.some(
        (element) =>
          element.type === "embeddable" ||
          element.customData?.templateRole === "system-design-task-selector",
      ),
    ).toBe(false);

    const taskBlockViewportPosition = sceneCoordsToViewportCoords(
      {
        sceneX: taskBlock!.x + taskBlock!.width / 2,
        sceneY: taskBlock!.y + taskBlock!.height / 2,
      },
      h.state,
    );
    fireEvent.pointerDown(document.querySelector("canvas.interactive")!, {
      clientX: taskBlockViewportPosition.x,
      clientY: taskBlockViewportPosition.y,
    });

    expect(screen.getByTestId("template-task-menu")).toBeTruthy();
    expect(screen.queryByText("SYSTEM DESIGN TEMPLATE")).toBeNull();
    expect(screen.queryByText("Choose a problem")).toBeNull();
    expect(
      screen.queryByText(
        "Start with a real product and shape the requirements together.",
      ),
    ).toBeNull();
    expect(screen.getByRole("option", { name: "LeetCode" })).toBeTruthy();
    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Выберите задачу системного дизайна",
      }),
      {
        target: { value: "tinder" },
      },
    );

    await waitFor(() => {
      const updatedText = h.elements
        .filter((element) => element.type === "text")
        .map((element) => element.text)
        .join("\n");

      expect(updatedText).toContain("System Design: Tinder");
      const normalizedText = updatedText.replace(/\s+/g, " ");
      expect(normalizedText).toContain("Users can create a profile");
      expect(normalizedText).toContain("view a stack of potential matches");
      expect(normalizedText).toContain("swipe right or left");
      expect(normalizedText).toContain("match notification");
      expect(normalizedText).toContain("Out of scope");
      expect(normalizedText).toContain("upload pictures");
      expect(normalizedText).toContain("direct messages");
      expect(normalizedText).toContain("super swipes");
      expect(normalizedText).toContain(
        "swiping remain consistent and low latency",
      );
      const updatedTaskBlock = h.elements.find(
        (element) =>
          element.type === "text" &&
          element.customData?.templateRole === "task-requirements-block",
      );
      expect(
        updatedTaskBlock?.type === "text" ? updatedTaskBlock.fontSize : 24,
      ).toBeLessThanOrEqual(24);
      expect(screen.queryByTestId("template-task-menu")).toBeNull();
    });

    const selectedTaskBlock = h.elements.find(
      (element) =>
        element.type === "text" &&
        element.customData?.templateRole === "task-requirements-block",
    );
    const selectedTaskBlockViewportPosition = sceneCoordsToViewportCoords(
      {
        sceneX: selectedTaskBlock!.x + selectedTaskBlock!.width / 2,
        sceneY: selectedTaskBlock!.y + selectedTaskBlock!.height / 2,
      },
      h.state,
    );
    fireEvent.pointerDown(document.querySelector("canvas.interactive")!, {
      clientX: selectedTaskBlockViewportPosition.x,
      clientY: selectedTaskBlockViewportPosition.y,
    });
    fireEvent.change(
      screen.getByRole("combobox", {
        name: "Выберите задачу системного дизайна",
      }),
      { target: { value: "leetcode" } },
    );

    await waitFor(() => {
      const leetcodeText = h.elements
        .filter((element) => element.type === "text")
        .map((element) => element.text)
        .join("\n")
        .replace(/\s+/g, " ");

      expect(leetcodeText).toContain("System Design: LeetCode");
      expect(leetcodeText).toContain("view a list of coding problems");
      expect(leetcodeText).toContain("live leaderboard");
      expect(leetcodeText).toContain("user code be executed securely");
      expect(screen.queryByTestId("template-task-menu")).toBeNull();
    });
  });
});
