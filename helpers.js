export function saveUserToLocalStorage(user) {
  console.log("Сохранение пользователя в localStorage:", user);
  window.localStorage.setItem("user", JSON.stringify(user));
}

export function getUserFromLocalStorage() {
  try {
    const user = JSON.parse(window.localStorage.getItem("user"));
    console.log("Получен пользователь из localStorage:", user);
    return user;
  } catch (error) {
    return null;
  }
}

export function removeUserFromLocalStorage() {
  window.localStorage.removeItem("user");
}