const personalKey = "nika-khaimina"; //уникальный ключ
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
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then(data => {
        throw new Error(data.message || "Такой пользователь уже существует");
      });
    }
    if (response.status === 201) {
      return response.json();
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      return response.json().then(data => {
        throw new Error(data.message || "Неверный логин или пароль");
      });
    }
    if (response.status === 201) {
      return response.json();
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
    if (response.status === 201) {
      return response.json();
    }
    return response.json();
  });
}

export function addPost({ token, description, imageUrl }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      description,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function getUserPosts({ token, userId }) {
  return fetch(`${postsHost}/user/${userId}`, {
    method: "GET",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    if (response.status === 404) {
      throw new Error("Пользователь не найден");
    }
    return response.json();
  });
}

export function toggleLike({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}