const lessonCourses = window.lessonCourses || [];
const quizCourses = window.quizCourses || [];
const uiStore = window.uiStore || {};

const el = (id) => document.getElementById(id);

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

function getLessonState() {
  const saved = localStorage.getItem("edulearn_lessons");
  if (!saved) return { completed: {} };
  try {
    return JSON.parse(saved);
  } catch {
    return { completed: {} };
  }
}

function getQuizState() {
  const saved = localStorage.getItem("edulearn_quizzes");
  if (!saved) return { completedQuizzes: {}, scores: {} };
  try {
    return JSON.parse(saved);
  } catch {
    return { completedQuizzes: {}, scores: {} };
  }
}

function renderStats() {
  const lessonState = getLessonState();
  const quizState = getQuizState();
  const totalLessons = countLessons();
  const completedLessons = Object.keys(lessonState.completed || {}).length;
  const completedQuizzes = Object.keys(quizState.completedQuizzes || {}).length;
  const scores = Object.values(quizState.scores || {}).filter((value) => typeof value === "number");
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  el("stat-courses").textContent = totalLessons;
  el("stat-lessons").textContent = completedLessons;
  el("stat-quiz-avg").textContent = `${avg}%`;
  el("stat-badges").textContent = completedQuizzes;
  el("stat-active-courses").textContent = uiStore.statsNotes?.lessons || "From /lessons";
}

function renderContinueLearning() {
  const list = el("continue-list");
  list.innerHTML = "";
  const items = uiStore.learner?.continueLessons || [];
  if (!items.length) {
    list.innerHTML = "<p class=\"text-sm text-gray-500\">No lesson data available.</p>";
    return;
  }

  items.slice(0, 3).forEach((lesson) => {
    const row = document.createElement("div");
    row.className = "flex items-center justify-between";
    row.innerHTML = `<span>${lesson.title}</span><a href="lesson.html" class="text-primary font-semibold">Open</a>`;
    list.appendChild(row);
  });
}

function renderUpcomingQuizzes() {
  const list = el("upcoming-quiz-list");
  list.innerHTML = "";
  const items = uiStore.learner?.upcomingQuizzes || [];
  if (!items.length) {
    list.innerHTML = "<li>No quiz data available.</li>";
    return;
  }

  items.slice(0, 3).forEach((quiz) => {
    const li = document.createElement("li");
    li.textContent = `${quiz.module}: ${quiz.title}`;
    list.appendChild(li);
  });
}

function renderDashboard() {
  renderStats();
  renderContinueLearning();
  renderUpcomingQuizzes();
}

document.addEventListener("DOMContentLoaded", renderDashboard);
