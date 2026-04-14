import { getPosts, addPost } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import { renderUserPostsPageComponent } from "./components/user-posts-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

const getToken = () => {
  return user ? `Bearer ${user.token}` : undefined;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

export const goToPage = (newPage, data) => {
  if ([POSTS_PAGE, AUTH_PAGE, ADD_POSTS_PAGE, USER_POSTS_PAGE, LOADING_PAGE].includes(newPage)) {

    if (newPage === ADD_POSTS_PAGE) {
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      renderApp();
      return;
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          page = POSTS_PAGE;
          posts = [];
          renderApp();
        });
      return;
    }

    if (newPage === USER_POSTS_PAGE) {
      page = USER_POSTS_PAGE;
      window.currentUserId = data?.userId;
      renderApp();
      return;
    }

    page = newPage;
    renderApp();
    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = () => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    renderLoadingPageComponent({ appEl, user, goToPage, logout });
    return;
  }

  if (page === AUTH_PAGE) {
    renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
      logout,
    });
    return;
  }

  if (page === ADD_POSTS_PAGE) {
    renderAddPostPageComponent({
      appEl,
      user,
      goToPage,
      logout,
      onAddPostClick: ({ description, imageUrl }) => {
        console.log("Данные для отправки:", { description, imageUrl });
        const token = getToken();
        console.log("Токен:", token);

        if (!token) {
          alert("Нет авторизации. Войдите снова.");
          goToPage(AUTH_PAGE);
          return;
        }

        addPost({ token, description, imageUrl })
          .then((response) => {
            console.log("Пост добавлен:", response);
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error("Ошибка добавления поста:", error);
            alert("Не удалось добавить пост: " + error.message);
          });
      },
    });
    return;
  }

  if (page === POSTS_PAGE) {
    renderPostsPageComponent({
      appEl,
      posts,
      user,
      goToPage,
      logout,
    });
    return;
  }

  if (page === USER_POSTS_PAGE) {
    renderUserPostsPageComponent({
      appEl,
      userId: window.currentUserId,
      user,
      goToPage,
      logout,
    });
    return;
  }
};

goToPage(POSTS_PAGE);