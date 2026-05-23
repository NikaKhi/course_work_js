import { toggleLike, getUserPosts, getPosts } from "../api.js";
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

export function renderPostsPageComponent({ appEl, posts, user, goToPage, logout, renderApp, isUserPostsPage = false, userId = null }) {
  const token = user ? `Bearer ${user.token}` : undefined;

  const isPostLikedByUser = (post) => {
    if (!user || !post.likes) return false;
    if (!user.id) {
      console.warn("У пользователя нет id!", user);
      return false;
    }
    return post.likes.some(like => {
      const likeId = typeof like === 'object' ? like.id : like;
      return likeId === user.id;
    });
  };

  const getLikesCount = (post) => {
    return post.likes?.length || 0;
  };

  const updatePostUI = (postId, updatedPost) => {
    const postElement = document.querySelector(`.post[data-post-id="${postId}"]`);
    if (!postElement) return;

    const isLiked = isPostLikedByUser(updatedPost);
    const likesCount = getLikesCount(updatedPost);
    const likeIcon = isLiked ? "./assets/images/like-active.svg" : "./assets/images/like-not-active.svg";

    const likeButton = postElement.querySelector(".like-button img");
    if (likeButton) {
      likeButton.src = likeIcon;
    }

    const likesText = postElement.querySelector(".post-likes-text strong");
    if (likesText) {
      likesText.textContent = likesCount;
    }
  };

  const handleLike = (postId) => {
    if (!user) {
      goToPage("auth");
      return;
    }

    if (!user.id && user._id) {
      user.id = user._id;
    }

    if (!user.id) {
      console.error("У пользователя нет id!", user);
      alert("Ошибка: у пользователя нет ID. Выйдите и зайдите снова.");
      return;
    }

    console.log("=== НАЖАТ ЛАЙК ===");
    console.log("postId:", postId);
    console.log("userId:", user.id);

    const postIndex = posts.findIndex(p => p.id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const wasLiked = isPostLikedByUser(post);

    console.log("wasLiked:", wasLiked);

    let newLikes;
    if (wasLiked) {
      newLikes = post.likes.filter(like => {
        const likeId = typeof like === 'object' ? like.id : like;
        return likeId !== user.id;
      });
    } else {
      newLikes = [...(post.likes || []), { id: user.id, name: user.name }];
    }

    const updatedPostOptimistic = {
      ...post,
      likes: newLikes
    };

    posts[postIndex] = updatedPostOptimistic;

    if (window.posts && !isUserPostsPage) {
      const globalIndex = window.posts.findIndex(p => p.id === postId);
      if (globalIndex !== -1) {
        window.posts[globalIndex] = updatedPostOptimistic;
      }
    }

    updatePostUI(postId, updatedPostOptimistic);

    toggleLike({ token, postId })
      .then((updatedPostFromServer) => {
        console.log("=== ОТВЕТ СЕРВЕРА ===");
        console.log("updatedPostFromServer:", updatedPostFromServer);
        console.log("likes from server:", updatedPostFromServer?.likes);

        if (updatedPostFromServer && updatedPostFromServer.likes) {
          posts[postIndex] = updatedPostFromServer;

          if (window.posts && !isUserPostsPage) {
            const globalIndex = window.posts.findIndex(p => p.id === postId);
            if (globalIndex !== -1) {
              window.posts[globalIndex] = updatedPostFromServer;
            }
          }

          updatePostUI(postId, updatedPostFromServer);
          console.log("UI обновлен данными с сервера");
        }
      })
      .catch((error) => {
        console.error("Ошибка при постановке лайка:", error);
        alert("Не удалось поставить лайк: " + error.message);

        const restoredPost = {
          ...post,
          likes: wasLiked ? post.likes : [...(post.likes || []), { id: user.id, name: user.name }]
        };

        posts[postIndex] = restoredPost;
        updatePostUI(postId, restoredPost);
      });
  };

  const handleUserClick = (clickedUserId) => {
    console.log("Клик по пользователю, userId:", clickedUserId);
    goToPage(USER_POSTS_PAGE, { userId: clickedUserId });
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
    const isLiked = isPostLikedByUser(post);
    const likesCount = getLikesCount(post);
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
            <img src="${likeIcon}" width="24" height="24" />
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
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener("click", (event) => {
      event.stopPropagation();
      const postId = newButton.dataset.postId;
      handleLike(postId);
    });
  });

  const postHeaders = document.querySelectorAll(".post-header");
  postHeaders.forEach(header => {
    const newHeader = header.cloneNode(true);
    header.parentNode.replaceChild(newHeader, header);

    newHeader.addEventListener("click", () => {
      const clickedUserId = newHeader.dataset.userId;
      if (clickedUserId) {
        handleUserClick(clickedUserId);
      }
    });
  });
}