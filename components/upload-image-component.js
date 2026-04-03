import { uploadImage } from "../api.js";

export function renderUploadImageComponent({ element, onImageUrlChange }) {
  let imageUrl = "";

  const render = () => {
    element.innerHTML = `
      <div class="upload-image">
        ${imageUrl ? `
          <div class="file-upload-image-container">
            <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение">
            <button class="file-upload-remove-button button">Заменить фото</button>
          </div>
        ` : `
          <label class="file-upload-label secondary-button" id="file-upload-label">
            <input type="file" class="file-upload-input" style="display:none" accept="image/*" />
            Выберите фото
          </label>
        `}
      </div>
    `;

    const fileInputElement = element.querySelector(".file-upload-input");
    if (fileInputElement) {
      fileInputElement.addEventListener("change", () => {
        const file = fileInputElement.files[0];
        if (file) {
          const labelEl = document.getElementById("file-upload-label");
          if (labelEl) {
            labelEl.setAttribute("disabled", true);
            labelEl.textContent = "Загружаю файл...";
          }

          uploadImage({ file })
            .then(({ fileUrl }) => {
              imageUrl = fileUrl;
              onImageUrlChange(imageUrl);
              render();
            })
            .catch((error) => {
              console.error("Ошибка загрузки:", error);
              alert("Не удалось загрузить изображение");
              if (labelEl) {
                labelEl.removeAttribute("disabled");
                labelEl.textContent = "Выберите фото";
              }
            });
        }
      });
    }

    const removeButton = element.querySelector(".file-upload-remove-button");
    if (removeButton) {
      removeButton.addEventListener("click", () => {
        imageUrl = "";
        onImageUrlChange(imageUrl);
        render();
      });
    }
  };

  render();
}