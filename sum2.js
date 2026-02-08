(function () {
  const uiStore = window.uiStore || {};
  const courses = uiStore.courses?.lessons || window.lessonCourses || [];

  const iconMap = {
    web: "code-2",
    backend: "database",
    dashboard: "layout-dashboard"
  };

  const levelMap = {
    web: "Beginner",
    backend: "Intermediate",
    dashboard: "Advanced"
  };

  function countLessons(course) {
    return course.modules.reduce((sum, mod) => sum + mod.lessons.length, 0);
  }

  function countQuizzes(courseId) {
    const quizzes = uiStore.courses?.quizzes || window.quizCourses || [];
    const course = quizzes.find((item) => item.id === courseId);
    return course ? course.quizzes.length : 0;
  }

  function renderCourses() {
    const grid = document.getElementById("courses-grid");
    if (!grid) return;
    grid.innerHTML = "";

    courses.forEach((course, idx) => {
      const icon = iconMap[course.id] || "book-open";
      const level = levelMap[course.id] || "Beginner";
      const lessonsCount = countLessons(course);
      const quizzesCount = countQuizzes(course.id);

      const card = document.createElement("a");
      card.href = "login.html";
      card.className = "block p-10 bg-white shadow-lg rounded-xl hover:shadow-2xl transition-all duration-500 hover-lift group glass-effect border border-gray-100 animate-scaleIn";
      if (idx > 0) {
        card.style.animationDelay = `${idx * 0.15}s`;
      }

      card.innerHTML = `
        <div class=\"flex items-start justify-between gap-4 mb-6\">
          <div class=\"w-16 h-16 bg-blue-100 text-primary rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300 animate-glow\">
            <i data-lucide=\"${icon}\" class=\"w-6 h-6\"></i>
          </div>
          <span class=\"text-xs font-bold uppercase tracking-widest text-primary bg-blue-50 px-3 py-1 rounded-full\">${level}</span>
        </div>
        <h3 class=\"text-xl font-bold mb-3 group-hover:text-primary transition-all duration-300\">${course.title}</h3>
        <p class=\"text-gray-600 group-hover:text-gray-700 transition-all duration-300 mb-6\">
          Start this track with lessons and quizzes aligned to the ${course.title} curriculum.
        </p>
        <div class=\"flex items-center justify-between text-sm text-gray-500\">
          <span class=\"flex items-center gap-2\"><i data-lucide=\"clock\" class=\"w-4 h-4 text-primary\"></i> Self paced</span>
          <span class=\"flex items-center gap-2\"><i data-lucide=\"bar-chart-3\" class=\"w-4 h-4 text-primary\"></i> ${lessonsCount} lessons</span>
          <span class=\"flex items-center gap-2\"><i data-lucide=\"sparkles\" class=\"w-4 h-4 text-primary\"></i> ${quizzesCount} quizzes</span>
        </div>
        <div class=\"mt-8 flex items-center justify-between\">
          <span class=\"font-semibold text-dark\">Start course</span>
          <span class=\"inline-flex items-center gap-2 text-primary font-semibold\">Open <i data-lucide=\"arrow-right\" class=\"w-4 h-4\"></i></span>
        </div>
      `;

      grid.appendChild(card);
    });

    if (window.lucide) {
      window.lucide.createIcons();
    }
  }

  document.addEventListener("DOMContentLoaded", renderCourses);
})();
