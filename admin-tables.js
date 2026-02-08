(function () {
  const uiStore = window.uiStore || {};

  function renderTable(targetId, modelKey, rows) {
    const table = document.getElementById(targetId);
    if (!table) return;
    const model = uiStore.models?.[modelKey] || [];

    const thead = table.querySelector("thead");
    const tbody = table.querySelector("tbody");
    if (!thead || !tbody) return;

    thead.innerHTML = "";
    const headRow = document.createElement("tr");
    model.forEach((col) => {
      const th = document.createElement("th");
      th.className = "py-2";
      th.textContent = col.label;
      headRow.appendChild(th);
    });
    const thActions = document.createElement("th");
    thActions.className = "py-2";
    thActions.textContent = "Actions";
    headRow.appendChild(thActions);
    thead.appendChild(headRow);

    tbody.innerHTML = "";
    rows.forEach((row) => {
      const tr = document.createElement("tr");
      model.forEach((col) => {
        const td = document.createElement("td");
        td.className = "py-2";
        const value = row[col.key] ?? "";
        td.textContent = Array.isArray(value) ? value.join(", ") : String(value);
        tr.appendChild(td);
      });
      const tdActions = document.createElement("td");
      tdActions.className = "py-2";
      tdActions.innerHTML = "<button class=\"text-primary font-semibold\">View</button> <button class=\"text-primary font-semibold\">Edit</button> <button class=\"text-red-600 font-semibold\">Delete</button>";
      tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  }

  function init() {
    const tables = uiStore.admin?.tables || {};
    renderTable("users-table", "users", tables.users || []);
    renderTable("lessons-table", "lessons", tables.lessons || []);
    renderTable("quizzes-table", "quizzes", tables.quizzes || []);
    renderTable("quiz-attempts-table", "quizAttempts", tables.quizAttempts || []);
  }

  document.addEventListener("DOMContentLoaded", init);
})();
