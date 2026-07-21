import {
  newElement,
  newElementWith,
  newTextElement,
  measureText,
  wrapText,
} from "@excalidraw/element";
import {
  DEFAULT_FONT_FAMILY,
  getFontString,
  getLineHeight,
} from "@excalidraw/common";

import type { Language } from "@excalidraw/excalidraw/i18n";
import type { NonDeletedExcalidrawElement } from "@excalidraw/element/types";

const FIELD_WIDTH = 1040;
const REQUIREMENTS_FIELD_HEIGHT = 540;
const CORE_ENTITIES_FIELD_HEIGHT = 720;
const API_FIELD_HEIGHT = 1440;
const LEFT_COLUMN_X = 80;
const TOP_Y = 120;
const FIELD_GAP = 32;
const DEEP_DIVE_AREA_HEIGHT = 720;
const TEMPLATE_CONTENT_HEIGHT =
  REQUIREMENTS_FIELD_HEIGHT * 2 +
  CORE_ENTITIES_FIELD_HEIGHT +
  API_FIELD_HEIGHT +
  FIELD_GAP * 3;
const DESIGN_AREA_HEIGHT =
  TEMPLATE_CONTENT_HEIGHT - DEEP_DIVE_AREA_HEIGHT - FIELD_GAP;
const DESIGN_AREA_X = LEFT_COLUMN_X + FIELD_WIDTH + 80;
const DESIGN_AREA_WIDTH = 2600;

export const TEMPLATE_ELEMENT_ROLE = {
  TASK_REQUIREMENTS_BLOCK: "task-requirements-block",
  DEEP_DIVE_QUESTIONS_BLOCK: "deep-dive-questions-block",
} as const;

export const TEMPLATE_TASKS = {
  tinder: {
    label: "Tinder",
    functionalRequirements: [
      "Core Requirements",
      "1. Users can create a profile with preferences such as age range and interests, and set a maximum distance.",
      "2. Users can view a stack of potential matches that fits their preferences and maximum distance.",
      "3. Users can swipe right or left through profiles to express yes or no.",
      "4. Users receive a match notification when both users swipe right on each other.",
      "",
      "Out of scope",
      "- Users can upload pictures.",
      "- Matched users can chat through direct messages.",
      "- Users can send super swipes or purchase other premium features.",
    ].join("\n"),
    deepDiveQuestions: [
      "Deep Dive Questions",
      "1. How can swiping remain consistent and low latency when both users swipe right at the same time?",
      "2. How can the system generate a low-latency feed of nearby profiles?",
    ].join("\n"),
  },
  leetcode: {
    label: "LeetCode",
    functionalRequirements: [
      "Core Requirements",
      "1. Users can view a list of coding problems.",
      "2. Users can open a problem and write a solution in multiple languages.",
      "3. Users can submit a solution and receive immediate feedback.",
      "4. Users can view a live leaderboard for competitions.",
      "",
      "Out of scope",
      "- User authentication.",
      "- User profiles.",
      "- Payment processing.",
      "- User analytics.",
      "- Social features.",
    ].join("\n"),
    deepDiveQuestions: [
      "Deep Dive Questions",
      "1. How can user code be executed securely and in isolation?",
      "2. How can the live leaderboard be made efficient at scale?",
      "3. How can the system support competitions with 100,000 users?",
      "4. How should test cases be executed across multiple languages?",
    ].join("\n"),
  },
} as const;

export type TemplateTaskId = keyof typeof TEMPLATE_TASKS;

type TemplateCopy = {
  title: string;
  functionalRequirements: string;
  nonFunctionalRequirements: string;
  coreEntities: string;
  api: string;
  highLevelDesign: string;
  deepDiveQuestions: string;
};

const TEMPLATE_COPY: Record<"en" | "ru-RU", TemplateCopy> = {
  en: {
    title: "System Design: Application Name",
    functionalRequirements: "Functional Requirements",
    nonFunctionalRequirements: "Non-Functional Requirements",
    coreEntities: "Core Entities",
    api: "API",
    highLevelDesign: "High-Level Design",
    deepDiveQuestions: "Deep Dive Questions",
  },
  "ru-RU": {
    title: "Системный дизайн: Название приложения",
    functionalRequirements: "Функциональные требования",
    nonFunctionalRequirements: "Нефункциональные требования",
    coreEntities: "Основные сущности",
    api: "API",
    highLevelDesign: "Архитектура высокого уровня",
    deepDiveQuestions: "Вопросы для deep dive",
  },
};

const getTemplateCopy = (langCode: Language["code"]): TemplateCopy =>
  langCode === "ru-RU" ? TEMPLATE_COPY["ru-RU"] : TEMPLATE_COPY.en;

const fitTextToContainer = ({
  text,
  fontSize,
  width,
  height,
}: {
  text: string;
  fontSize: number;
  width: number;
  height: number;
}) => {
  const lineHeight = getLineHeight(DEFAULT_FONT_FAMILY);
  const availableHeight = height - 10;

  for (let nextFontSize = fontSize; nextFontSize >= 12; nextFontSize -= 1) {
    const font = getFontString({
      fontFamily: DEFAULT_FONT_FAMILY,
      fontSize: nextFontSize,
    });
    const wrappedText = wrapText(text, font, width);
    const metrics = measureText(wrappedText, font, lineHeight);

    if (metrics.height <= availableHeight) {
      return { text: wrappedText, fontSize: nextFontSize, lineHeight };
    }
  }

  const font = getFontString({
    fontFamily: DEFAULT_FONT_FAMILY,
    fontSize: 12,
  });
  return {
    text: wrapText(text, font, width),
    fontSize: 12,
    lineHeight,
  };
};

const bindTextToContainer = ({
  container,
  text,
  fontSize,
  width,
  fitToContainer = false,
  textBackgroundColor = "#ffffff",
  customData,
}: {
  container: NonDeletedExcalidrawElement;
  text: string;
  fontSize: number;
  width?: number;
  fitToContainer?: boolean;
  textBackgroundColor?: string;
  customData?: Record<string, any>;
}): NonDeletedExcalidrawElement[] => {
  const textWidth = width ?? container.width - 10;
  const fittedText = fitToContainer
    ? fitTextToContainer({
        text,
        fontSize,
        width: textWidth,
        height: container.height,
      })
    : { text, fontSize };
  const textElement = newTextElement({
    x: container.x + 5,
    y: container.y + 5,
    text: fittedText.text,
    fontSize: fittedText.fontSize,
    lineHeight: "lineHeight" in fittedText ? fittedText.lineHeight : undefined,
    textAlign: "left",
    verticalAlign: "top",
    strokeColor: "#343a40",
    backgroundColor: textBackgroundColor,
    fillStyle: "solid",
    strokeWidth: 2,
    strokeStyle: "solid",
    roughness: 1,
    opacity: 100,
    containerId: container.id,
    customData,
  });
  const boundText =
    width === undefined ? textElement : newElementWith(textElement, { width });

  const boundContainer = newElementWith(container, {
    boundElements: [{ type: "text", id: boundText.id }],
    customData,
  });

  return [boundContainer, boundText];
};

const createField = ({
  title,
  x,
  y,
  height,
  includeHeading = true,
  role,
}: {
  title: string;
  x: number;
  y: number;
  height: number;
  includeHeading?: boolean;
  role: string;
}): NonDeletedExcalidrawElement[] => {
  const container = newElement({
    type: "rectangle",
    x,
    y,
    width: FIELD_WIDTH,
    height,
    strokeColor: includeHeading ? "#adb5bd" : "#9aa9ff",
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    roundness: { type: 3 },
  });

  if (!includeHeading) {
    return [container];
  }

  return bindTextToContainer({
    container,
    text: title,
    fontSize: 24,
    customData: { fieldRole: role },
  });
};

export const createHelloInterviewScene = (
  langCode: Language["code"] = "en",
): NonDeletedExcalidrawElement[] => {
  const copy = getTemplateCopy(langCode);
  const elements: NonDeletedExcalidrawElement[] = [];

  [
    {
      title: copy.functionalRequirements,
      height: REQUIREMENTS_FIELD_HEIGHT,
      includeHeading: false,
    },
    {
      title: copy.nonFunctionalRequirements,
      height: REQUIREMENTS_FIELD_HEIGHT,
      includeHeading: true,
    },
    {
      title: copy.coreEntities,
      height: CORE_ENTITIES_FIELD_HEIGHT,
      includeHeading: true,
    },
    { title: copy.api, height: API_FIELD_HEIGHT, includeHeading: true },
  ].reduce((y, field) => {
    elements.push(
      ...createField({
        title: field.title,
        x: LEFT_COLUMN_X,
        y,
        height: field.height,
        includeHeading: field.includeHeading,
        role:
          field.title === copy.functionalRequirements
            ? TEMPLATE_ELEMENT_ROLE.TASK_REQUIREMENTS_BLOCK
            : `system-design-${field.title.toLowerCase().replaceAll(" ", "-")}`,
      }),
    );

    return y + field.height + FIELD_GAP;
  }, TOP_Y);

  const [boundTaskContainer, boundTaskText] = bindTextToContainer({
    container: elements[0],
    text: `${copy.title}\n\n${copy.functionalRequirements}`,
    fontSize: 24,
    width: FIELD_WIDTH - 10,
    fitToContainer: true,
    customData: {
      templateRole: TEMPLATE_ELEMENT_ROLE.TASK_REQUIREMENTS_BLOCK,
    },
  });
  elements[0] = boundTaskContainer;
  elements.push(boundTaskText);

  elements.push(
    newTextElement({
      x: DESIGN_AREA_X,
      y: TOP_Y,
      text: copy.highLevelDesign,
      fontSize: 28,
      textAlign: "left",
      verticalAlign: "top",
      strokeColor: "#343a40",
      backgroundColor: "transparent",
      fillStyle: "solid",
      strokeWidth: 2,
      strokeStyle: "solid",
      roughness: 1,
      opacity: 100,
    }),
  );

  const deepDiveArea = newElement({
    type: "rectangle",
    x: DESIGN_AREA_X,
    y: TOP_Y + DESIGN_AREA_HEIGHT + FIELD_GAP,
    width: DESIGN_AREA_WIDTH,
    height: DEEP_DIVE_AREA_HEIGHT,
    strokeColor: "#adb5bd",
    backgroundColor: "#ffffff",
    fillStyle: "solid",
    strokeWidth: 2,
    roughness: 1,
    roundness: { type: 3 },
  });
  elements.push(
    ...bindTextToContainer({
      container: deepDiveArea,
      text: copy.deepDiveQuestions,
      fontSize: 24,
      width: DESIGN_AREA_WIDTH - 10,
      customData: {
        templateRole: TEMPLATE_ELEMENT_ROLE.DEEP_DIVE_QUESTIONS_BLOCK,
      },
    }),
  );

  return elements;
};

export const applyTemplateTask = (
  elements: NonDeletedExcalidrawElement[],
  taskId: TemplateTaskId,
): NonDeletedExcalidrawElement[] => {
  const task = TEMPLATE_TASKS[taskId];
  const taskText = `System Design: ${task.label}\n\nFunctional Requirements\n${task.functionalRequirements}`;
  const fittedTaskText = fitTextToContainer({
    text: taskText,
    fontSize: 24,
    width: FIELD_WIDTH - 10,
    height: REQUIREMENTS_FIELD_HEIGHT,
  });
  const deepDiveText = task.deepDiveQuestions;
  const fittedDeepDiveText = fitTextToContainer({
    text: deepDiveText,
    fontSize: 24,
    width: DESIGN_AREA_WIDTH - 10,
    height: DEEP_DIVE_AREA_HEIGHT,
  });

  return elements.map((element) => {
    if (
      element.type === "text" &&
      element.customData?.templateRole ===
        TEMPLATE_ELEMENT_ROLE.TASK_REQUIREMENTS_BLOCK
    ) {
      return newElementWith(element, {
        text: fittedTaskText.text,
        originalText: taskText,
        fontSize: fittedTaskText.fontSize,
        lineHeight: fittedTaskText.lineHeight,
        width: FIELD_WIDTH - 10,
        height: REQUIREMENTS_FIELD_HEIGHT,
      });
    }

    if (
      element.type === "text" &&
      element.customData?.templateRole ===
        TEMPLATE_ELEMENT_ROLE.DEEP_DIVE_QUESTIONS_BLOCK
    ) {
      return newElementWith(element, {
        text: fittedDeepDiveText.text,
        originalText: deepDiveText,
        fontSize: fittedDeepDiveText.fontSize,
        lineHeight: fittedDeepDiveText.lineHeight,
        width: DESIGN_AREA_WIDTH - 10,
        height: DEEP_DIVE_AREA_HEIGHT,
      });
    }

    return element;
  });
};
