(function () {
  const uiStore = window.uiStore || {};

  function renderFields(containerId, fields) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    fields.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "flex flex-col gap-2";
      const label = document.createElement("label");
      label.className = "text-sm font-semibold";
      label.textContent = field.label;
      wrap.appendChild(label);

      let input;
      if (field.type === "textarea") {
        input = document.createElement("textarea");
        input.rows = 4;
      } else if (field.type === "select") {
        input = document.createElement("select");
        (field.options || []).forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          input.appendChild(option);
        });
      } else {
        input = document.createElement("input");
        input.type = field.type || "text";
      }

      input.className = "p-3 text-gray-800 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/40";
      if (field.placeholder) input.placeholder = field.placeholder;
      input.name = field.key;
      wrap.appendChild(input);

      container.appendChild(wrap);
    });
  }

  function initLessonForm() {
    renderFields("lesson-form-fields", uiStore.forms?.lessonCreate || []);
  }

  function initQuizForm() {
    renderFields("quiz-form-fields", uiStore.forms?.quizCreate || []);
    renderFields("question-form-fields", uiStore.forms?.questionCreate || []);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initLessonForm();
    initQuizForm();
  });
})();
