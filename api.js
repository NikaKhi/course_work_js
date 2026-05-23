const personalKey = "nika_khaimina_instapro";
const baseHost = "https://wedev-api.sky.pro";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      console.log("Получены посты с сервера:", data.posts?.length || 0);
      return data.posts || [];
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  console.log("Регистрация:", { login, name });

  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    console.log("Статус регистрации:", response.status);

    if (!response.ok) {
      return response.json().then(data => {
        console.log("Ошибка регистрации:", data);
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error(data.message || "Ошибка при регистрации");
      });
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  console.log("Вход:", { login });

  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    console.log("Статус входа:", response.status);

    if (!response.ok) {
      return response.json().then(data => {
        console.log("Ошибка входа:", data);
        if (data.error) {
          throw new Error(data.error);
        }
        throw new Error(data.message || "Неверный логин или пароль");
      });
    }
    return response.json();
  });
}

export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

export function addPost({ token, description, imageUrl }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      description: description,
      imageUrl: imageUrl,
    }),
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    if (response.status === 400) {
      return response.json().then(data => {
        throw new Error(data.message || data.error || "Ошибка при добавлении поста");
      });
    }
    return response.json();
  });
}

export function getUserPosts({ token, userId }) {
  console.log("Запрос постов пользователя:", { userId });

  return getPosts({ token })
    .then((allPosts) => {
      const userPosts = allPosts.filter(post => post.user.id === userId);
      console.log("Найдено постов для пользователя:", userPosts.length);

      let userInfo = { id: userId, name: "Пользователь", imageUrl: null };
      if (userPosts.length > 0 && userPosts[0].user) {
        userInfo = userPosts[0].user;
      }

      return {
        user: userInfo,
        posts: userPosts,
      };
    })
    .catch((error) => {
      console.error("Ошибка при получении постов пользователя:", error);
      throw new Error("Не удалось загрузить посты пользователя");
    });
}

export function toggleLike({ token, postId }) {
  console.log("Отправка лайка:", { postId });

  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  })
    .then(async (response) => {
      console.log("Статус ответа лайка:", response.status);

      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      const data = await response.json();
      console.log("Ответ сервера лайка:", data);

      if (data.post) {
        return data.post;
      }
      return data;
    });
}