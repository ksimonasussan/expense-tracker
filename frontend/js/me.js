// frontend/js/me.js
async function showUserInNav() {
  try {
    const res = await fetch('/me');
    if (!res.ok) return;
    const me = await res.json();
    if (me && me.loggedIn) {
      const navLeft = document.querySelector('.nav-left');
      if (navLeft && !document.getElementById('userEmail')) {
        const span = document.createElement('span');
        span.id = 'userEmail';
        span.className = 'user-email';
        span.textContent = `Logged in as ${me.email}`;
        navLeft.appendChild(span);
      }
    }
  } catch (e) { /* ignore */ }
}
document.addEventListener('DOMContentLoaded', showUserInNav);
