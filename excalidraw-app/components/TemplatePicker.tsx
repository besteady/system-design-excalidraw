import { CaptureUpdateAction } from "@excalidraw/excalidraw";
import { openConfirmModal } from "@excalidraw/excalidraw/components/OverwriteConfirm/OverwriteConfirmState";
import { useExcalidrawAPI } from "@excalidraw/excalidraw";
import { useState } from "react";

import { useAppLangCode } from "../app-language/language-state";
import { createHelloInterviewScene } from "../templates/helloInterview";

import "./TemplatePicker.scss";

const TEMPLATE_COPY = {
  en: {
    picker: "Templates",
    name: "Hello Interview",
    description: "System design template",
    replaceTitle: "Replace current scene?",
    replaceDescription:
      "Applying a template will replace all elements on the current canvas.",
    replaceAction: "Replace scene",
  },
  "ru-RU": {
    picker: "Шаблоны",
    name: "Hello Interview",
    description: "Шаблон системного дизайна",
    replaceTitle: "Заменить текущую сцену?",
    replaceDescription:
      "Применение шаблона заменит все элементы на текущем холсте.",
    replaceAction: "Заменить сцену",
  },
} as const;

export const TemplatePicker = () => {
  const excalidrawAPI = useExcalidrawAPI();
  const [langCode] = useAppLangCode();
  const [isOpen, setIsOpen] = useState(false);
  const copy = langCode === "ru-RU" ? TEMPLATE_COPY["ru-RU"] : TEMPLATE_COPY.en;

  const applyHelloInterview = async () => {
    if (!excalidrawAPI) {
      return;
    }

    const currentElements = excalidrawAPI.getSceneElements();
    if (
      currentElements.length > 0 &&
      !(await openConfirmModal({
        title: copy.replaceTitle,
        description: copy.replaceDescription,
        actionLabel: copy.replaceAction,
        color: "danger",
      }))
    ) {
      return;
    }

    const elements = createHelloInterviewScene("en");
    excalidrawAPI.updateScene({
      elements,
      appState: {
        currentItemTextAlign: "left",
        selectedElementIds: {},
      },
      captureUpdate: CaptureUpdateAction.IMMEDIATELY,
    });
    excalidrawAPI.setViewport({ target: elements, fit: "contain" });
    setIsOpen(false);
  };

  return (
    <div className="template-picker" data-viewport-ui="top">
      <button
        type="button"
        className="template-picker__trigger"
        aria-expanded={isOpen}
        aria-haspopup="true"
        onClick={() => setIsOpen((open) => !open)}
      >
        {copy.picker}
      </button>
      {isOpen && (
        <div className="template-picker__menu">
          <button
            type="button"
            className="template-picker__item"
            aria-label={copy.name}
            onClick={applyHelloInterview}
          >
            <span>{copy.name}</span>
            <small>{copy.description}</small>
          </button>
        </div>
      )}
    </div>
  );
};
