(function () {
  const uiStore = window.uiStore || {};
  const users = uiStore.auth?.users || [];
  const password = uiStore.auth?.password || "password123";
  window.users = users;
  window.authPassword = password;

  function handleLogin(event) {
    event.preventDefault();
    const emailInput = document.getElementById("login-email");
    const passwordInput = document.getElementById("login-password");
    const message = document.getElementById("login-message");

    const email = (emailInput?.value || "").trim().toLowerCase();
    const pass = passwordInput?.value || "";

    const user = users.find((item) => item.email === email);
    if (!user || pass !== password) {
      if (message) {
        message.textContent = "Invalid credentials. Use a@io.com, l@io.com, or m@io.com with password123.";
        message.className = "text-sm text-red-600 mt-4";
      }
      return;
    }

    if (message) {
      message.textContent = "Login successful. Redirecting...";
      message.className = "text-sm text-green-600 mt-4";
    }

    window.location.href = user.redirect;
  }

  document.addEventListener("DOMContentLoaded", () => {
    const hint = document.getElementById("login-hint");
    if (hint && uiStore.login?.hint) {
      hint.textContent = uiStore.login.hint;
    }
    const form = document.getElementById("login-form");
    if (form) {
      form.addEventListener("submit", handleLogin);
    }
  });
})();
