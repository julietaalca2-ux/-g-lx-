const STORAGE_KEY = "og_settings_v1";

const DEFAULT_SETTINGS = {
    profile: {
        name: "usuario_og",
        username: "usuario_og",
        bio: "Bienvenido a mi perfil de ÖG."
    },
    toggles: {
        privateAccount: false,
        showActivity: true,
        pushLikes: true,
        pushMessages: true,
        twoFactor: false,
        loginAlerts: true
    }
};

function loadSavedSettings() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            return structuredClone(DEFAULT_SETTINGS);
        }

        const parsed = JSON.parse(raw);

        return {
            profile: {
                ...DEFAULT_SETTINGS.profile,
                ...(parsed.profile || {})
            },
            toggles: {
                ...DEFAULT_SETTINGS.toggles,
                ...(parsed.toggles || {})
            }
        };
    } catch (error) {
        console.warn("No se pudieron leer los ajustes guardados:", error);
        return structuredClone(DEFAULT_SETTINGS);
    }
}

function saveSettings(settings) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
        console.warn("No se pudieron guardar los ajustes:", error);
    }
}

function sanitizeUsername(rawValue) {
    return rawValue
        .trim()
        .replace(/^@+/, "")
        .replace(/\s+/g, "_")
        .toLowerCase();
}

function applyProfileToDOM(profileData) {
    const avatarEl = document.querySelector("#profile-section .profile-avatar");
    const nameEl = document.querySelector("#profile-section .profile-header h2");
    const usernameEl = document.querySelector("#profile-section .profile-header p");
    const bioEl = document.querySelector("#profile-section .profile-description p");

    const displayName = profileData.name.trim() || DEFAULT_SETTINGS.profile.name;
    const cleanUsername = sanitizeUsername(profileData.username) || DEFAULT_SETTINGS.profile.username;
    const bioText = profileData.bio.trim() || DEFAULT_SETTINGS.profile.bio;

    if (avatarEl) {
        avatarEl.textContent = displayName.charAt(0).toUpperCase() || "Ö";
    }

    if (nameEl) {
        nameEl.textContent = displayName;
    }

    if (usernameEl) {
        usernameEl.textContent = "@" + cleanUsername;
    }

    if (bioEl) {
        bioEl.textContent = bioText;
    }
}

export function showSettingsSubview(subviewName) {
    const settingsSection = document.getElementById("settings-section");
    if (!settingsSection) return;

    const mainView = settingsSection.querySelector('[data-settings-view="main"]');
    const subviews = settingsSection.querySelectorAll(".settings-subview");
    const feedbackEl = document.getElementById("settingsProfileFeedback");

    if (feedbackEl) {
        feedbackEl.textContent = "";
    }

    if (!subviewName || subviewName === "main") {
        if (mainView) {
            mainView.hidden = false;
        }
        subviews.forEach((panel) => {
            panel.hidden = true;
        });
        return;
    }

    const targetPanel = settingsSection.querySelector(
        `[data-settings-subview="${subviewName}"]`
    );

    if (!targetPanel) {
        console.error("No existe la subvista de configuración:", subviewName);
        return;
    }

    if (mainView) {
        mainView.hidden = true;
    }

    subviews.forEach((panel) => {
        panel.hidden = panel !== targetPanel;
    });

    window.scrollTo({
        top: 0,
        behavior: "auto"
    });
}

export function initSettings() {
    const settingsSection = document.getElementById("settings-section");
    if (!settingsSection) return;

    const settings = loadSavedSettings();

    // Referencias del formulario Editar perfil
    const profileForm = document.getElementById("settingsEditProfileForm");
    const nameInput = document.getElementById("settingsNameInput");
    const usernameInput = document.getElementById("settingsUsernameInput");
    const bioInput = document.getElementById("settingsBioInput");
    const feedbackEl = document.getElementById("settingsProfileFeedback");

    // Sincronizar campos y DOM inicial
    if (nameInput) nameInput.value = settings.profile.name;
    if (usernameInput) usernameInput.value = settings.profile.username;
    if (bioInput) bioInput.value = settings.profile.bio;
    applyProfileToDOM(settings.profile);

    // Sincronizar interruptores
    const toggleInputs = settingsSection.querySelectorAll("[data-setting-toggle]");
    toggleInputs.forEach((input) => {
        const key = input.dataset.settingToggle;
        if (key && key in settings.toggles) {
            input.checked = Boolean(settings.toggles[key]);
        }

        input.addEventListener("change", () => {
            if (!key) return;
            settings.toggles[key] = input.checked;
            saveSettings(settings);
        });
    });

    // Abrir subvistas desde la lista principal
    const optionButtons = settingsSection.querySelectorAll("[data-settings-target]");
    optionButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            const target = button.dataset.settingsTarget;
            if (target) {
                showSettingsSubview(target);
            }
        });
    });

    // Botones para volver al menú de Configuración
    const backButtons = settingsSection.querySelectorAll("[data-settings-back]");
    backButtons.forEach((button) => {
        button.addEventListener("click", (event) => {
            event.preventDefault();
            showSettingsSubview("main");
        });
    });

    // Guardado de Editar perfil
    if (profileForm) {
        profileForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const nextName = nameInput ? nameInput.value.trim() : "";
            const nextUsername = usernameInput ? sanitizeUsername(usernameInput.value) : "";
            const nextBio = bioInput ? bioInput.value.trim() : "";

            if (!nextUsername) {
                if (feedbackEl) {
                    feedbackEl.textContent = "Ingresá un nombre de usuario válido.";
                }
                if (usernameInput) {
                    usernameInput.focus();
                }
                return;
            }

            settings.profile = {
                name: nextName || nextUsername,
                username: nextUsername,
                bio: nextBio || DEFAULT_SETTINGS.profile.bio
            };

            if (nameInput) nameInput.value = settings.profile.name;
            if (usernameInput) usernameInput.value = settings.profile.username;
            if (bioInput) bioInput.value = settings.profile.bio;

            saveSettings(settings);
            applyProfileToDOM(settings.profile);

            if (feedbackEl) {
                feedbackEl.textContent = "Cambios guardados.";
            }
        });
    }

    // Asegurar vista principal al iniciar
    showSettingsSubview("main");
}

