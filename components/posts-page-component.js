import { toggleLike } from "../api.js";
import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";

function formatDate(dateString) {
  if (!dateString) return "недавно";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "только что";
  if (diffMins < 60) return diffMins + " " + getMinutesText(diffMins) + " назад";
  if (diffHours < 24) return diffHours + " " + getHoursText(diffHours) + " назад";
  if (diffDays < 7) return diffDays + " " + getDaysText(diffDays) + " назад";

  return date.toLocaleDateString('ru-RU');
}

function getMinutesText(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "минуту";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "минуты";
  return "минут";
}

function getHoursText(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "час";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "часа";
  return "часов";
}

function getDaysText(n) {
  if (n % 10 === 1 && n % 100 !== 11) return "день";
  if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return "дня";
  return "дней";
}

function escapeHtml(str) {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderPostsPageComponent({ appEl, posts, user, goToPage, logout, renderApp }) {
  const token = user ? `Bearer ${user.token}` : undefined;

  const handleLike = (postId) => {
    if (!user) {
      goToPage("auth");
      return;
    }

    console.log("Нажат лайк для поста:", postId);

    // Сразу меняем иконку локально (оптимистичное обновление)
    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex !== -1) {
      const post = posts[postIndex];
      const isLiked = post.likes?.some(like => like.id === user.id);

      if (isLiked) {
        post.likes = post.likes.filter(like => like.id !== user.id);
      } else {
        post.likes = [...(post.likes || []), { id: user.id, name: user.name }];
      }

      // Обновляем глобальный массив
      window.posts = [...posts];

      // Перерисовываем страницу сразу
      if (renderApp) {
        renderApp();
      }
    }

    // Отправляем запрос на сервер
    toggleLike({ token, postId })
      .then(() => {
        console.log("Лайк отправлен успешно, обновляем данные с сервера");
        // Запрашиваем свежие данные с сервера
        import("../api.js").then(({ getPosts }) => {
          getPosts({ token }).then((freshPosts) => {
            window.posts = freshPosts;
            if (renderApp) {
              renderApp();
            }
          });
        });
      })
      .catch((error) => {
        console.error("Ошибка при постановке лайка:", error);
        alert("Не удалось поставить лайк: " + error.message);
        // Откатываем изменения
        goToPage("posts");
      });
  };

  const handleUserClick = (userId) => {
    console.log("Клик по пользователю, userId:", userId);
    goToPage(USER_POSTS_PAGE, { userId });
  };

  if (!posts || posts.length === 0) {
    const emptyHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <p style="text-align: center; padding: 40px;">Нет постов. Будьте первым!</p>
      </div>
    `;
    appEl.innerHTML = emptyHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
      user: user,
      goToPage: goToPage,
      logout: logout,
    });
    return;
  }

  const postsHtml = posts.map(post => {
    const isLiked = post.likes?.some(like => like.id === user?.id);
    const likesCount = post.likes?.length || 0;
    const likeIcon = isLiked ? "./assets/images/like-active.svg" : "./assets/images/like-not-active.svg";
    const timeAgo = formatDate(post.createdAt);

    return `
      <li class="post" data-post-id="${post.id}">
        <div class="post-header" data-user-id="${post.user.id}" style="cursor: pointer;">
          <img 
            class="post-header__user-image" 
            src="${post.user.imageUrl || "./assets/images/avatar-placeholder.png"}" 
            alt="avatar"
          />
          <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
        </div>
        
        <div class="post-image-container">
          <img class="post-image" src="${post.imageUrl}" alt="post image" />
        </div>
        
        <div class="post-likes">
          <button class="like-button" data-post-id="${post.id}">
            <img src="${likeIcon}?t=${Date.now()}" width="24" height="24" />
          </button>
          <p class="post-likes-text">
            Нравится: <strong>${likesCount}</strong>
          </p>
        </div>
        
        <p class="post-text">
          <span class="user-name">${escapeHtml(post.user.name)}</span>
          ${escapeHtml(post.description)}
        </p>
        
        <p class="post-date">${timeAgo}</p>
      </li>
    `;
  }).join("");

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
        ${postsHtml}
      </ul>
    </div>
  `;

  appEl.innerHTML = appHtml;

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
    user: user,
    goToPage: goToPage,
    logout: logout,
  });

  const likeButtons = document.querySelectorAll(".like-button");
  likeButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const postId = button.dataset.postId;
      handleLike(postId);
    });
  });

  const postHeaders = document.querySelectorAll(".post-header");
  postHeaders.forEach(header => {
    header.addEventListener("click", () => {
      const userId = header.dataset.userId;
      if (userId) {
        handleUserClick(userId);
      }
    });
  });
}