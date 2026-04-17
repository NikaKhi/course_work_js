import { renderHeaderComponent } from "./header-component.js";
import { renderUploadImageComponent } from "./upload-image-component.js";

export function renderAddPostPageComponent({ appEl, user, goToPage, logout, onAddPostClick }) {
  let imageUrl = "";
  let description = "";
  let errorMessage = "";

  const showError = (message) => {
    errorMessage = message;
    render();
  };

  const render = () => {
    const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <div class="form">
          <h3 class="form-title">Добавить новый пост</h3>
          <div class="form-inputs">
            <div id="upload-image-container"></div>
            <textarea 
              id="post-description" 
              class="input textarea" 
              placeholder="Введите описание поста..."
              rows="4"
            ></textarea>
            ${errorMessage ? `<div class="form-error" style="color: red; margin-top: 10px;">${errorMessage}</div>` : ""}
          </div>
          <div class="form-footer">
            <button id="submit-post-button" class="button" ${!imageUrl ? 'disabled' : ''}>Опубликовать</button>
            <button id="cancel-button" class="secondary-button">Отмена</button>
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

    const uploadContainer = document.getElementById("upload-image-container");
    if (uploadContainer) {
      renderUploadImageComponent({
        element: uploadContainer,
        onImageUrlChange: (url) => {
          imageUrl = url;
          errorMessage = "";
          const submitButton = document.getElementById("submit-post-button");
          if (submitButton) {
            submitButton.disabled = !imageUrl;
          }
          render();
        },
      });
    }

    const descriptionTextarea = document.getElementById("post-description");
    if (descriptionTextarea) {
      descriptionTextarea.addEventListener("input", (event) => {
        description = event.target.value;
        if (errorMessage) {
          errorMessage = "";
          render();
        }
      });
    }

    const submitButton = document.getElementById("submit-post-button");
    if (submitButton) {
      submitButton.addEventListener("click", () => {
        if (!imageUrl) {
          showError("Выберите фото для поста");
          return;
        }

        if (!description.trim()) {
          showError("Введите описание поста");
          return;
        }

        onAddPostClick({
          description: description.trim(),
          imageUrl: imageUrl,
        });
      });
    }

    const cancelButton = document.getElementById("cancel-button");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => {
        goToPage("posts");
      });
    }
  };

  render();
}