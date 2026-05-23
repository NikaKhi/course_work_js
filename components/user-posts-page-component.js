import { getUserPosts } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderPostsPageComponent } from "./posts-page-component.js";

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderUserPostsPageComponent({ appEl, userId, user, goToPage, logout }) {
  const token = user ? `Bearer ${user.token}` : undefined;

  console.log("renderUserPostsPageComponent вызван, userId:", userId);

  if (!userId) {
    console.error("Нет userId, возвращаемся на главную");
    goToPage("posts");
    return;
  }

  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      <div class="loading-page">
        <div class="loader"><div></div><div></div><div></div></div>
      </div>
    </div>
  `;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
    user: user,
    goToPage: goToPage,
    logout: logout,
  });

  const loadUserPosts = () => {
    return getUserPosts({ token, userId });
  };

  loadUserPosts()
    .then((data) => {
      console.log("Данные получены:", data);

      const userInfo = data.user;
      let currentPosts = data.posts || [];

      const renderUserContent = () => {
        const containerDiv = document.createElement("div");
        containerDiv.className = "page-container";
        containerDiv.innerHTML = `
          <div class="header-container"></div>
          <div class="posts-user-header">
            <img 
              class="posts-user-header__user-image" 
              src="${userInfo.imageUrl || "./assets/images/avatar-placeholder.png"}" 
              alt="avatar"
            />
            <h1 class="posts-user-header__user-name">${escapeHtml(userInfo.name)}</h1>
          </div>
          <div id="user-posts-container"></div>
        `;

        appEl.innerHTML = "";
        appEl.appendChild(containerDiv);

        renderHeaderComponent({
          element: document.querySelector(".header-container"),
          user: user,
          goToPage: goToPage,
          logout: logout,
        });

        const postsContainer = document.getElementById("user-posts-container");
        if (postsContainer) {
          if (currentPosts.length === 0) {
            postsContainer.innerHTML = '<p style="text-align: center; padding: 40px;">У пользователя пока нет постов</p>';
          } else {
            renderPostsPageComponent({
              appEl: postsContainer,
              posts: currentPosts,
              user: user,
              goToPage: goToPage,
              logout: logout,
              renderApp: () => {
                loadUserPosts()
                  .then((newData) => {
                    currentPosts = newData.posts || [];
                    renderUserContent();
                  })
                  .catch((error) => {
                    console.error("Ошибка обновления:", error);
                  });
              },
              isUserPostsPage: true,
              userId: userId,
            });
          }
        }
      };

      renderUserContent();
    })
    .catch((error) => {
      console.error("Ошибка загрузки постов пользователя:", error);
      appEl.innerHTML = `
        <div class="page-container">
          <div class="header-container"></div>
          <p style="text-align: center; color: red; padding: 40px;">
            Не удалось загрузить посты пользователя: ${error.message}
          </p>
          <button class="button" id="back-button" style="margin: 0 auto; display: block;">Назад</button>
        </div>
      `;

      renderHeaderComponent({
        element: document.querySelector(".header-container"),
        user: user,
        goToPage: goToPage,
        logout: logout,
      });

      const backButton = document.getElementById("back-button");
      if (backButton) {
        backButton.addEventListener("click", () => {
          goToPage("posts");
        });
      }
    });
}