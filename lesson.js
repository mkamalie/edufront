const courses = window.lessonCourses || [];
const uiStore = window.uiStore || {};

const state = {
  courseIndex: 0,
  lessonIndex: 0,
  completed: {},
};

const storageKey = "edulearn_lessons";

const el = (id) => document.getElementById(id);

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return;
  try {
    const parsed = JSON.parse(saved);
    Object.assign(state, parsed);
  } catch {
    localStorage.removeItem(storageKey);
  }
}

function saveState() {
  localStorage.setItem(storageKey, JSON.stringify(state));
}

function getFlatLessons(course) {
  const list = [];
  course.modules.forEach((mod) => {
    mod.lessons.forEach((lesson) => {
      list.push({ module: mod.name, ...lesson });
    });
  });
  return list;
}

function setCourse(index) {
  state.courseIndex = index;
  state.lessonIndex = 0;
  saveState();
  render();
}

function setLesson(index) {
  const course = courses[state.courseIndex];
  const flat = getFlatLessons(course);
  state.lessonIndex = Math.max(0, Math.min(index, flat.length - 1));
  saveState();
  render();
}

function markComplete() {
  const course = courses[state.courseIndex];
  const flat = getFlatLessons(course);
  const key = `${course.id}:${state.lessonIndex}`;
  state.completed[key] = true;
  if (state.lessonIndex < flat.length - 1) {
    state.lessonIndex += 1;
  }
  saveState();
  render();
}

function renderTracks() {
  const container = el("course-tracks");
  container.innerHTML = "";
  courses.forEach((course, idx) => {
    const active = idx === state.courseIndex;
    const div = document.createElement("button");
    div.className = active
      ? "border-2 border-primary text-primary rounded-lg px-4 py-3 font-semibold text-left"
      : "border border-gray-200 rounded-lg px-4 py-3 text-gray-600 text-left hover:border-primary hover:text-primary transition";
    div.textContent = course.title;
    div.addEventListener("click", () => setCourse(idx));
    container.appendChild(div);
  });
}

function renderLesson() {
  const course = courses[state.courseIndex];
  const flat = getFlatLessons(course);
  const lesson = flat[state.lessonIndex];
  el("course-title").textContent = course.title;
  el("module-pill").textContent = lesson.module;
  el("lesson-count").textContent = `Lesson ${state.lessonIndex + 1} of ${flat.length}`;
  el("lesson-title").textContent = lesson.title;
  el("lesson-desc").textContent = lesson.desc;

  const cardWrap = el("lesson-cards");
  cardWrap.innerHTML = "";
  lesson.cards.forEach((card) => {
    const div = document.createElement("div");
    div.className = "p-5 rounded-lg bg-[#f5f8ff] border border-blue-100";
    div.innerHTML = `<h3 class="font-bold mb-2">${card.title}</h3><p class="text-sm text-gray-600">${card.body}</p>`;
    cardWrap.appendChild(div);
  });

  const prevBtn = el("prev-lesson");
  const nextBtn = el("next-lesson");
  prevBtn.disabled = state.lessonIndex === 0;
  prevBtn.classList.toggle("opacity-50", state.lessonIndex === 0);
  nextBtn.disabled = state.lessonIndex >= flat.length - 1;
  nextBtn.classList.toggle("opacity-50", state.lessonIndex >= flat.length - 1);
}

function renderProgress() {
  const course = courses[state.courseIndex];
  const flat = getFlatLessons(course);
  const progressWrap = el("lesson-progress");
  progressWrap.innerHTML = "";
  flat.forEach((lesson, idx) => {
    const key = `${course.id}:${idx}`;
    const completed = !!state.completed[key];
    const isCurrent = idx === state.lessonIndex;
    const isLocked = idx > state.lessonIndex + 1;
    const label = document.createElement("label");
    label.className = "flex items-center gap-2";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.className = "accent-primary";
    input.checked = completed;
    input.disabled = true;
    const text = document.createElement("span");
    text.textContent = `${isCurrent ? "Current: " : ""}${lesson.title}${isLocked ? " (locked)" : ""}`;
    label.appendChild(input);
    label.appendChild(text);
    progressWrap.appendChild(label);
  });

  const completedCount = Object.keys(state.completed).filter((key) => key.startsWith(course.id)).length;
  const percent = Math.round((completedCount / flat.length) * 100);
  el("course-progress-bar").style.width = `${percent}%`;
  el("course-progress-text").textContent = `${percent}% complete`;
  const nextIndex = Math.min(state.lessonIndex + 1, flat.length - 1);
  el("unlock-text").textContent = `Complete this lesson to unlock: ${flat[nextIndex].title}.`;

  const nextList = el("next-lessons");
  nextList.innerHTML = "";
  for (let i = state.lessonIndex + 1; i < Math.min(state.lessonIndex + 4, flat.length); i += 1) {
    const li = document.createElement("li");
    li.className = "flex items-center justify-between";
    li.innerHTML = `<span>${flat[i].title}</span><span class="text-gray-400">Locked</span>`;
    nextList.appendChild(li);
  }
}

function render() {
  if (!courses.length) {
    return;
  }
  renderTracks();
  renderLesson();
  renderProgress();
}

document.addEventListener("DOMContentLoaded", () => {
  const eyebrow = document.getElementById("lesson-eyebrow");
  const desc = document.getElementById("lesson-desc");
  if (eyebrow && uiStore.lesson?.eyebrow) eyebrow.textContent = uiStore.lesson.eyebrow;
  if (desc && uiStore.lesson?.description) desc.textContent = uiStore.lesson.description;

  loadState();
  render();
  el("mark-complete").addEventListener("click", markComplete);
  el("prev-lesson").addEventListener("click", () => setLesson(state.lessonIndex - 1));
  el("next-lesson").addEventListener("click", () => setLesson(state.lessonIndex + 1));
  el("continue-btn").addEventListener("click", () => setLesson(state.lessonIndex + 1));
});
