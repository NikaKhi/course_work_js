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
window.posts = posts;

const getToken = () => {
  return user ? `Bearer ${user.token}` : undefined;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
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
        console.log("Устанавливаем пользователя:", newUser);
        if (newUser && !newUser.id && newUser._id) {
          newUser.id = newUser._id;
        }
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
        const token = getToken();

        addPost({ token, description, imageUrl })
          .then(() => {
            return getPosts({ token });
          })
          .then((newPosts) => {
            posts = newPosts;
            window.posts = newPosts;
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            console.error(error);
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
      renderApp: renderApp,
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
          window.posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          page = POSTS_PAGE;
          posts = [];
          window.posts = [];
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

goToPage(POSTS_PAGE);