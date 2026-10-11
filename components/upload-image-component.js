import { uploadImage } from "../api.js";

export function renderUploadImageComponent({ element, onImageUrlChange }) {
  let imageUrl = "";

  const render = () => {
    element.innerHTML = `
      <div class="upload-image">
        ${imageUrl ? `
          <div class="file-upload-image-container">
            <img class="file-upload-image" src="${imageUrl}" alt="Загруженное изображение">
            <button class="file-upload-remove-button secondary-button" style="margin-left: 10px;">Заменить фото</button>
          </div>
        ` : `
          <label class="file-upload-label secondary-button" style="cursor: pointer; display: inline-block;">
            <input type="file" class="file-upload-input" style="display:none" accept="image/*" />
            Выберите фото
          </label>
        `}
      </div>
    `;

    const fileInputElement = element.querySelector(".file-upload-input");
    if (fileInputElement) {
      fileInputElement.addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (file) {
          const labelEl = element.querySelector(".file-upload-label");
          if (labelEl) {
            labelEl.textContent = "Загружаю файл...";
            labelEl.style.pointerEvents = "none";
          }

          uploadImage({ file })
            .then((response) => {
              console.log("Ответ сервера при загрузке:", response);
              const uploadedUrl = response.fileUrl || response.url || response;
              if (typeof uploadedUrl === 'string' && uploadedUrl.startsWith('http')) {
                imageUrl = uploadedUrl;
                onImageUrlChange(imageUrl);
                render();
              } else {
                throw new Error("Не удалось получить ссылку на изображение");
              }
            })
            .catch((error) => {
              console.error("Ошибка загрузки:", error);
              alert("Не удалось загрузить изображение: " + (error.message || "попробуйте другой файл"));
              render();
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