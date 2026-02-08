(function () {
  const uiStore = window.uiStore || {};
  window.lessonCourses = uiStore.courses?.lessons || [];
  window.quizCourses = uiStore.courses?.quizzes || [];
})();
