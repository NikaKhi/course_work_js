import { loginUser, registerUser } from "../api.js";
import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAuthPageComponent({ appEl, setUser, user, goToPage, logout }) {
  let isLoginMode = true;
  let imageUrl = "";

  const renderForm = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">
            ${isLoginMode ? "Вход в Instapro" : "Регистрация в Instapro"}
          </h3>
          <div class="form-inputs">
            ${!isLoginMode ? `
              <div class="upload-image-container"></div>
              <input type="text" id="name-input" class="input" placeholder="Имя" />
            ` : ""}
            <input type="text" id="login-input" class="input" placeholder="Логин" />
            <input type="password" id="password-input" class="input" placeholder="Пароль" />
            <div class="form-error"></div>
            <button class="button" id="login-button">${isLoginMode ? "Войти" : "Зарегистрироваться"}</button>
          </div>
          <div class="form-footer">
            <p class="form-footer-title">
              ${isLoginMode ? "Нет аккаунта?" : "Уже есть аккаунт?"}
              <button class="link-button" id="toggle-button">
                ${isLoginMode ? "Зарегистрироваться" : "Войти"}
              </button>
            </p>
          </div>
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

    const setError = (message) => {
      const errorEl = appEl.querySelector(".form-error");
      if (errorEl) errorEl.textContent = message;
    };

    const uploadImageContainer = appEl.querySelector(".upload-image-container");
    if (uploadImageContainer) {
      renderUploadImageComponent({
        element: uploadImageContainer,
        onImageUrlChange: (newImageUrl) => {
          imageUrl = newImageUrl;
        },
      });
    }

    const loginButton = document.getElementById("login-button");
    if (loginButton) {
      loginButton.addEventListener("click", () => {
        setError("");

        if (isLoginMode) {
          const login = document.getElementById("login-input").value;
          const password = document.getElementById("password-input").value;

          if (!login || !password) {
            alert("Заполните все поля");
            return;
          }

          loginUser({ login, password })
            .then((data) => {
              setUser(data.user);
            })
            .catch((error) => {
              setError(error.message);
            });
        } else {
          const login = document.getElementById("login-input").value;
          const name = document.getElementById("name-input").value;
          const password = document.getElementById("password-input").value;

          if (!login || !name || !password) {
            alert("Заполните все поля");
            return;
          }

          if (!imageUrl) {
            alert("Выберите фото");
            return;
          }

          registerUser({ login, password, name, imageUrl })
            .then((data) => {
              setUser(data.user);
            })
            .catch((error) => {
              setError(error.message);
            });
        }
      });
    }

    const toggleButton = document.getElementById("toggle-button");
    if (toggleButton) {
      toggleButton.addEventListener("click", () => {
        isLoginMode = !isLoginMode;
        renderForm();
      });
    }
  };

  renderForm();
}