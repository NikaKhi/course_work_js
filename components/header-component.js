// components/header-component.js

import { ADD_POSTS_PAGE, AUTH_PAGE, POSTS_PAGE } from "../routes.js";

export function renderHeaderComponent({ element, user, goToPage, logout }) {
  if (!element) return;

  const isLoggedIn = !!user;

  element.innerHTML = `
    <div class="page-header">
      <h1 class="logo" style="cursor: pointer;">instapro</h1>
      <button class="header-button add-or-login-button">
        ${isLoggedIn ? '<div title="Добавить пост" class="add-post-sign"></div>' : 'Войти'}
      </button>
      ${isLoggedIn ? `<button title="${user.name || ''}" class="header-button logout-button">Выйти</button>` : ''}
    </div>
  `;

  const addOrLoginButton = element.querySelector(".add-or-login-button");
  if (addOrLoginButton) {
    addOrLoginButton.addEventListener("click", () => {
      if (user) {
        goToPage(ADD_POSTS_PAGE);
      } else {
        goToPage(AUTH_PAGE);
      }
    });
  }

  const logo = element.querySelector(".logo");
  if (logo) {
    logo.addEventListener("click", () => {
      goToPage(POSTS_PAGE);
    });
  }

  const logoutButton = element.querySelector(".logout-button");
  if (logoutButton && logout) {
    logoutButton.addEventListener("click", logout);
  }

  return element;
}