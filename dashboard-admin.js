(function () {
  const users = window.users || [];
  const lessonCourses = window.lessonCourses || [];
  const quizCourses = window.quizCourses || [];
  const uiStore = window.uiStore || {};

  const setText = (id, value) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  };

  function getLessonCourses() {
    return uiStore.courses?.lessons || lessonCourses;
  }

  function getQuizCourses() {
    return uiStore.courses?.quizzes || quizCourses;
  }

  function countLessons() {
    return getLessonCourses().reduce(
      (sum, course) => sum + course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0),
      0
    );
  }

  function countQuizzes() {
    return getQuizCourses().reduce((sum, course) => sum + course.quizzes.length, 0);
  }

  function getQuizPassRate() {
    const saved = localStorage.getItem("edulearn_quizzes");
    if (!saved) return 0;
    try {
      const parsed = JSON.parse(saved);
      const scores = Object.values(parsed.scores || {}).filter((value) => typeof value === "number");
      if (!scores.length) return 0;
      const passCount = scores.filter((score) => score >= 80).length;
      return Math.round((passCount / scores.length) * 100);
    } catch {
      return 0;
    }
  }

  function getAdminTables() {
    const tables = uiStore.admin?.tables || {};
    const derivedUsers = (uiStore.auth?.users || users).map((item) => ({
      name: item.name || item.email,
      email: item.email,
      role: item.displayRole || item.role
    }));
    const derivedLessons = getLessonCourses().map((course) => ({
      title: course.title,
      module: course.modules[0]?.name || "Module 1",
      status: "Published"
    }));
    const derivedQuizzes = getQuizCourses().map((course) => ({
      title: course.quizzes[0]?.title || course.title,
      module: course.quizzes[0]?.module || "Module 1",
      status: "Active"
    }));
    return {
      users: tables.users && tables.users.length ? tables.users : derivedUsers,
      lessons: tables.lessons && tables.lessons.length ? tables.lessons : derivedLessons,
      quizzes: tables.quizzes && tables.quizzes.length ? tables.quizzes : derivedQuizzes
    };
  }

  function renderAdminStats() {
    const usersCount = (uiStore.auth?.users || users).length;
    const lessonsCount = countLessons();
    const quizzesCount = countQuizzes();

    setText("admin-total-users", usersCount);
    setText("admin-total-lessons", lessonsCount);
    setText("admin-total-quizzes", quizzesCount);
    setText("admin-quiz-pass", `${getQuizPassRate()}%`);

    const notes = uiStore.admin?.notes || {};
    setText("admin-users-note", notes.users || "From /admin/users");
    setText("admin-lessons-note", notes.lessons || "From /lessons");
    setText("admin-quizzes-note", notes.quizzes || "From /quizzes");
    setText("admin-pass-note", notes.passRate || "From /quizzes/analytics");
  }

  function renderAdminActions() {
    const wrap = document.getElementById("admin-actions");
    if (!wrap) return;
    wrap.innerHTML = "";
    const actions = uiStore.admin?.actions || [];
    actions.forEach((item) => {
      const row = document.createElement("div");
      row.className = "flex items-center justify-between";
      row.innerHTML = `<span>${item.label}</span><span class=\"text-gray-500\">${item.value}</span>`;
      wrap.appendChild(row);
    });
  }

  function renderAdminPending() {
    const list = document.getElementById("admin-pending");
    if (!list) return;
    list.innerHTML = "";
    const pending = uiStore.admin?.pending || [];
    pending.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      list.appendChild(li);
    });
  }

  function renderAdminTables() {
    const tables = getAdminTables();

    const usersBody = document.getElementById("admin-users-table");
    if (usersBody) {
      usersBody.innerHTML = "";
      tables.users.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td class=\"py-2\">${row.name}</td><td class=\"py-2\">${row.email}</td><td class=\"py-2\">${row.role}</td>`;
        usersBody.appendChild(tr);
      });
    }

    const lessonsBody = document.getElementById("admin-lessons-table");
    if (lessonsBody) {
      lessonsBody.innerHTML = "";
      tables.lessons.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td class=\"py-2\">${row.title}</td><td class=\"py-2\">${row.module}</td><td class=\"py-2\">${row.status}</td>`;
        lessonsBody.appendChild(tr);
      });
    }

    const quizzesBody = document.getElementById("admin-quizzes-table");
    if (quizzesBody) {
      quizzesBody.innerHTML = "";
      tables.quizzes.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td class=\"py-2\">${row.title}</td><td class=\"py-2\">${row.module}</td><td class=\"py-2\">${row.status}</td>`;
        quizzesBody.appendChild(tr);
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    renderAdminStats();
    renderAdminActions();
    renderAdminPending();
    renderAdminTables();
  });
})();
