const courses = window.quizCourses || [];
const lessonCourses = window.lessonCourses || [];
const uiStore = window.uiStore || {};

const state = {
  courseIndex: 0,
  completedQuizzes: {},
  scores: {},
};

const storageKey = "edulearn_quizzes";
const lessonStorageKey = "edulearn_lessons";

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

function setCourse(index) {
  state.courseIndex = index;
  saveState();
  render();
}

function markQuizComplete(courseId, quizIndex, score) {
  const key = `${courseId}:${quizIndex}`;
  state.completedQuizzes[key] = true;
  state.scores[key] = score;
  saveState();
  render();
}

function getLessonProgress(courseId) {
  const saved = localStorage.getItem(lessonStorageKey);
  if (!saved) return 0;
  try {
    const parsed = JSON.parse(saved);
    const completed = Object.keys(parsed.completed || {}).filter((key) => key.startsWith(courseId)).length;
    return completed;
  } catch {
    return 0;
  }
}

function getLessonTotal(courseId) {
  const course = lessonCourses.find((item) => item.id === courseId);
  if (!course) return 0;
  return course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
}

function quizUnlocked(courseId, quizIndex) {
  if (quizIndex === 0) return true;
  const totalLessons = getLessonTotal(courseId);
  if (totalLessons === 0) return false;
  const progress = getLessonProgress(courseId);
  const perQuiz = Math.ceil(totalLessons / Math.max(1, courses.find((c) => c.id === courseId).quizzes.length));
  return progress >= perQuiz * quizIndex;
}

function renderTracks() {
  const container = el("quiz-tracks");
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

function renderQuizzes() {
  const course = courses[state.courseIndex];
  el("quiz-course-title").textContent = course.title;
  const grid = el("quiz-grid");
  grid.innerHTML = "";

  course.quizzes.forEach((quiz, idx) => {
    const key = `${course.id}:${idx}`;
    const unlocked = quizUnlocked(course.id, idx);
    const card = document.createElement("div");
    card.className = `p-8 bg-white shadow-lg rounded-xl transition-all duration-500 group glass-effect border border-gray-100 animate-scaleIn ${unlocked ? "hover:shadow-2xl hover-lift" : "opacity-60"}`;
    card.innerHTML = `
      <div class="flex items-start justify-between gap-4 mb-6">
        <div class="w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center ${unlocked ? "group-hover:bg-primary group-hover:text-white" : ""} transition-all duration-300">
          <i data-lucide="clipboard-check" class="w-6 h-6"></i>
        </div>
        <span class="text-xs font-bold uppercase tracking-widest ${unlocked ? "text-primary bg-blue-50" : "text-gray-400 bg-gray-100"} px-3 py-1 rounded-full">${unlocked ? quiz.module : "Locked"}</span>
      </div>
      <h3 class="text-xl font-bold mb-3 ${unlocked ? "group-hover:text-primary" : ""} transition-all duration-300">${quiz.title}</h3>
      <p class="text-gray-600 mb-6">${quiz.questions.length} questions, ${quiz.duration}</p>
      <div class="flex items-center justify-between text-sm text-gray-500">
        <span class="flex items-center gap-2"><i data-lucide="clock" class="w-4 h-4 text-primary"></i> ${quiz.duration}</span>
        <span class="flex items-center gap-2"><i data-lucide="sparkles" class="w-4 h-4 text-primary"></i> ${quiz.questions.length} Qs</span>
      </div>
    `;

    const btn = document.createElement("button");
    if (unlocked) {
      btn.className = "mt-6 w-full py-3 rounded-md font-semibold transition border-2 border-primary text-primary hover:bg-primary hover:text-white";
      btn.textContent = state.completedQuizzes[key] ? "Retake Quiz" : "Start Quiz";
      btn.addEventListener("click", () => openQuizModal(course, quiz, idx));
    } else {
      btn.className = "mt-6 w-full py-3 rounded-md font-semibold border-2 border-gray-300 text-gray-400 cursor-not-allowed";
      btn.textContent = "Complete Lessons to Unlock";
      btn.disabled = true;
    }
    card.appendChild(btn);
    grid.appendChild(card);
  });
  lucide.createIcons();
}

function openQuizModal(course, quiz, quizIndex) {
  const overlay = document.createElement("div");
  overlay.className = "fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4";
  const modal = document.createElement("div");
  modal.className = "bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6";
  modal.innerHTML = `
    <div class="flex items-center justify-between mb-4">
      <div>
        <p class="text-sm text-gray-500">${course.title} • ${quiz.module}</p>
        <h3 class="text-2xl font-bold">${quiz.title}</h3>
      </div>
      <button id="close-quiz" class="text-gray-500 hover:text-primary">Close</button>
    </div>
    <div id="quiz-questions" class="space-y-6"></div>
    <div class="mt-6 flex items-center justify-between">
      <div id="quiz-result" class="text-sm text-gray-600"></div>
      <button id="submit-quiz" class="bg-primary text-white px-5 py-2 rounded-md font-semibold hover:bg-blue-700 transition">Submit</button>
    </div>
  `;
  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  const qWrap = modal.querySelector("#quiz-questions");
  quiz.questions.forEach((q, idx) => {
    const block = document.createElement("div");
    block.className = "border border-gray-200 rounded-lg p-4";
    block.innerHTML = `
      <p class="font-semibold mb-3">${idx + 1}. ${q.q}</p>
      <div class="grid gap-2">
        ${q.options
          .map(
            (opt, i) => `
              <label class="flex items-center gap-2 text-sm">
                <input type="radio" name="q${idx}" value="${i}" class="accent-primary" />
                <span>${opt}</span>
              </label>`
          )
          .join("")}
      </div>
      <p class="mt-2 text-sm hidden" data-feedback="${idx}"></p>
    `;
    qWrap.appendChild(block);
  });

  modal.querySelector("#close-quiz").addEventListener("click", () => overlay.remove());
  modal.querySelector("#submit-quiz").addEventListener("click", () => {
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      const selected = modal.querySelector(`input[name="q${idx}"]:checked`);
      const feedback = modal.querySelector(`[data-feedback="${idx}"]`);
      if (!feedback) return;
      feedback.classList.remove("hidden");
      if (selected && Number(selected.value) === q.answer) {
        score += 1;
        feedback.textContent = "Correct";
        feedback.className = "mt-2 text-sm text-green-600";
      } else {
        feedback.textContent = `Incorrect. Correct answer: ${q.options[q.answer]}`;
        feedback.className = "mt-2 text-sm text-red-600";
      }
    });
    const percent = Math.round((score / quiz.questions.length) * 100);
    modal.querySelector("#quiz-result").textContent = `Score: ${score}/${quiz.questions.length} (${percent}%)`;
    markQuizComplete(course.id, quizIndex, percent);
  });
}

function renderSummary() {
  const course = courses[state.courseIndex];
  const total = course.quizzes.length;
  const completed = course.quizzes.filter((_, idx) => state.completedQuizzes[`${course.id}:${idx}`]).length;
  el("quiz-progress").textContent = `${completed} of ${total} Quizzes`;
  el("quiz-progress-note").textContent = completed < total ? "Finish the current quiz to unlock the next assessment." : "All quizzes completed in this track.";
  const scores = course.quizzes.map((_, idx) => state.scores[`${course.id}:${idx}`]).filter(Boolean);
  const avg = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  el("quiz-avg").textContent = `${avg}%`;
  const next = course.quizzes.findIndex((_, idx) => !state.completedQuizzes[`${course.id}:${idx}`]);
  el("quiz-next").textContent = next === -1 ? "All Quizzes Complete" : course.quizzes[next].title;
}

function render() {
  if (!courses.length) {
    return;
  }
  renderTracks();
  renderQuizzes();
  renderSummary();
}

document.addEventListener("DOMContentLoaded", () => {
  const eyebrow = document.getElementById("quiz-eyebrow");
  const desc = document.getElementById("quiz-desc");
  if (eyebrow && uiStore.quiz?.eyebrow) eyebrow.textContent = uiStore.quiz.eyebrow;
  if (desc && uiStore.quiz?.description) desc.textContent = uiStore.quiz.description;
  loadState();
  render();
});
