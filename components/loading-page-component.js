import { renderHeaderComponent } from "./header-component.js";

export function renderLoadingPageComponent({ appEl, user, goToPage, logout }) {
  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="loading-page">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
    user: user,
    goToPage: goToPage,
    logout: logout,
  });
}