// Lógica modular de la sección Crear publicación (ÖG)
import { addFeedPost } from "./feed.js?v=1";
import { loadProfilePosts } from "./profile.js?v=1";

const PROFILE_STORAGE_KEY = "og_user_profile_v1";
const USER_POSTS_STORAGE_KEY = "og_user_posts_v1";

let selectedImageDataUrl = "";
let onPostCreatedCallback = null;

function getCurrentUserProfile() {
    try {
        const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (!raw) {
            return {
                name: "usuario_og",
                username: "usuario_og"
            };
        }
        const parsed = JSON.parse(raw);
        return {
            name: (parsed.name || "").trim() || "usuario_og",
            username: (parsed.username || "").trim().replace(/^@/, "") || "usuario_og"
        };
    } catch (error) {
        return {
            name: "usuario_og",
            username: "usuario_og"
        };
    }
}

function saveUserPost(post) {
    try {
        const raw = localStorage.getItem(USER_POSTS_STORAGE_KEY);
        const existing = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(existing) ? existing : [];
        list.unshift(post);
        localStorage.setItem(USER_POSTS_STORAGE_KEY, JSON.stringify(list));
    } catch (error) {
        // Ignorar si el almacenamiento local está lleno o bloqueado
    }
}

function readAndResizeImage(file) {
    return new Promise(function (resolve, reject) {
        const reader = new FileReader();

        reader.onload = function () {
            const img = new Image();

            img.onload = function () {
                const maxSide = 1080;
                let width = img.width;
                let height = img.height;

                if (width > maxSide || height > maxSide) {
                    if (width > height) {
                        height = Math.round((height * maxSide) / width);
                        width = maxSide;
                    } else {
                        width = Math.round((width * maxSide) / height);
                        height = maxSide;
                    }
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    resolve(reader.result);
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.85));
            };

            img.onerror = function () {
                reject(new Error("No se pudo procesar la imagen."));
            };

            img.src = reader.result;
        };

        reader.onerror = function () {
            reject(new Error("No se pudo leer el archivo."));
        };

        reader.readAsDataURL(file);
    });
}

function setFeedback(message) {
    const feedback = document.getElementById("createFeedback");
    if (feedback) {
        feedback.textContent = message || "";
    }
}

export function resetCreateForm() {
    selectedImageDataUrl = "";

    const emptyView = document.getElementById("createEmptyView");
    const editorView = document.getElementById("createEditorView");
    const fileInput = document.getElementById("createFileInput");
    const previewImage = document.getElementById("createPreviewImage");
    const captionInput = document.getElementById("createCaptionInput");
    const publishButton = document.getElementById("createPublishButton");

    if (fileInput) fileInput.value = "";
    if (previewImage) previewImage.removeAttribute("src");
    if (captionInput) captionInput.value = "";
    if (publishButton) publishButton.disabled = true;

    setFeedback("");

    if (emptyView) emptyView.hidden = false;
    if (editorView) editorView.hidden = true;
}

export function initCreate(options = {}) {
    onPostCreatedCallback = typeof options.onPublished === "function"
        ? options.onPublished
        : null;

    const selectButton = document.getElementById("createSelectButton");
    const changeButton = document.getElementById("createChangeButton");
    const fileInput = document.getElementById("createFileInput");
    const emptyView = document.getElementById("createEmptyView");
    const editorView = document.getElementById("createEditorView");
    const previewImage = document.getElementById("createPreviewImage");
    const captionInput = document.getElementById("createCaptionInput");
    const publishButton = document.getElementById("createPublishButton");
    const cancelButton = document.getElementById("createCancelButton");

    function triggerFilePicker() {
        if (fileInput) {
            fileInput.click();
        }
    }

    if (selectButton) {
        selectButton.addEventListener("click", triggerFilePicker);
    }

    if (changeButton) {
        changeButton.addEventListener("click", triggerFilePicker);
    }

    if (fileInput) {
        fileInput.addEventListener("change", async function () {
            const file = fileInput.files && fileInput.files[0];
            if (!file) return;

            if (!file.type.startsWith("image/")) {
                setFeedback("Seleccioná un archivo de imagen válido.");
                return;
            }

            setFeedback("Preparando fotografía...");

            try {
                const optimizedDataUrl = await readAndResizeImage(file);
                selectedImageDataUrl = optimizedDataUrl;

                if (previewImage) {
                    previewImage.src = selectedImageDataUrl;
                }

                if (emptyView) emptyView.hidden = true;
                if (editorView) editorView.hidden = false;
                if (publishButton) publishButton.disabled = false;

                setFeedback("");
            } catch (error) {
                setFeedback("No se pudo cargar la fotografía. Probá con otra.");
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", function () {
            resetCreateForm();
        });
    }

    if (publishButton) {
        publishButton.addEventListener("click", function () {
            if (!selectedImageDataUrl) return;

            const user = getCurrentUserProfile();
            const caption = captionInput ? captionInput.value.trim() : "";

            const newPost = {
                id: "post_" + Date.now(),
                user: user.username,
                avatar: user.name.charAt(0).toUpperCase() || "Ö",
                image: selectedImageDataUrl,
                caption: caption,
                likes: 0,
                liked: false,
                saved: false,
                createdAt: Date.now()
            };

            addFeedPost(newPost);
            saveUserPost(newPost);
            loadProfilePosts();
            resetCreateForm();

            if (onPostCreatedCallback) {
                onPostCreatedCallback(newPost);
            }
        });
    }

    resetCreateForm();
}

