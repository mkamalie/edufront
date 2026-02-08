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

function getQuizStats() {
  const saved = localStorage.getItem("edulearn_quizzes");
  if (!saved) return { passRate: 0, attempts: 0 };
  try {
    const parsed = JSON.parse(saved);
    const scores = Object.values(parsed.scores || {}).filter((value) => typeof value === "number");
    if (!scores.length) return { passRate: 0, attempts: 0 };
    const passCount = scores.filter((score) => score >= 80).length;
    return { passRate: Math.round((passCount / scores.length) * 100), attempts: scores.length };
  } catch {
    return { passRate: 0, attempts: 0 };
  }
}

function renderManagerStats() {
  const quizStats = getQuizStats();
  const users = uiStore.auth?.users || [];
  const learnerCount = users.filter((u) => u.role === "learner").length;
  const activeCohorts = Math.max(1, Math.ceil(learnerCount / 5));

  setText("manager-cohorts", activeCohorts);
  setText("manager-reviews", countLessons());
  setText("manager-pass-rate", `${quizStats.passRate}%`);
  setText("manager-feedback", quizStats.attempts);

  setText("manager-cohorts-note", "From /admin/users/role/learner");
  setText("manager-reviews-note", "From /lessons");
  setText("manager-pass-note", "From /quizzes/analytics");
  setText("manager-feedback-note", "From /admin/statistics");
}

function renderManagerPerformance() {
  const wrap = document.getElementById("manager-performance");
  if (!wrap) return;
  wrap.innerHTML = "";
  (uiStore.manager?.performance || []).forEach((item) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between";
    row.innerHTML = `<span>${item.label}</span><span class=\"text-gray-500\">${item.value}</span>`;
    wrap.appendChild(row);
  });
}

function renderManagerTasks() {
  const list = document.getElementById("manager-tasks");
  if (!list) return;
  list.innerHTML = "";
  (uiStore.manager?.tasks || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderManagerStats();
  renderManagerPerformance();
  renderManagerTasks();
});
