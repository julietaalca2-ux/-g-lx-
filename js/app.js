// Punto de entrada principal de ÖG
import { initSettings, showSettingsSubview } from "./settings.js?v=1";
import { initProfile, updateSavedPosts, loadProfilePosts } from "./profile.js?v=1";

function initApp() {

    // =====================================
    // ELEMENTOS PRINCIPALES
    // =====================================

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".app-section");
    const feedPostsContainer = document.getElementById("feedPosts");


    // =====================================
    // NAVEGACIÓN PRINCIPAL
    // =====================================

    function showSection(name) {

        const target = document.getElementById(name + "-section");

        if (!target) {
            console.error("No existe la sección: " + name);
            return;
        }

        sections.forEach(function (section) {
            const isTarget = section === target;
            section.classList.toggle("active", isTarget);
            section.hidden = !isTarget;
        });

        navItems.forEach(function (item) {
            item.classList.toggle(
                "active",
                item.dataset.section === name
            );
        });

        if (name === "settings") {
            showSettingsSubview("main");
        }

        if (name === "profile") {
            loadProfilePosts();
            updateSavedPosts();
        }

        window.scrollTo({
            top: 0,
            behavior: "auto"
        });
    }


    navItems.forEach(function (button) {

        button.addEventListener("click", function (event) {
            event.preventDefault();

            const name = button.dataset.section;

            if (name) {
                showSection(name);
            }

        });

    });


    // También permite abrir Chat desde el encabezado.
    document.querySelectorAll("[data-section-link]").forEach(function (button) {

        button.addEventListener("click", function (event) {
            event.preventDefault();

            const name = button.dataset.sectionLink;

            if (name) {
                showSection(name);
            }

        });

    });


    // =====================================
    // ME GUSTA Y GUARDAR PUBLICACIONES
    // =====================================

    if (feedPostsContainer) {

        feedPostsContainer.addEventListener("click", function (event) {

            const likeButton = event.target.closest(".like-button");

            if (likeButton) {
                const post = likeButton.closest(".post");
                if (!post) return;

                const count = post.querySelector(".likes-count");
                if (!count) return;

                const liked = likeButton.classList.toggle("liked");
                let current = parseInt(count.textContent, 10) || 0;

                current = liked
                    ? current + 1
                    : Math.max(0, current - 1);

                count.textContent = current + " Me gusta";
                return;
            }

            const saveButton = event.target.closest(".save-button");

            if (saveButton) {
                saveButton.classList.toggle("saved");
                updateSavedPosts();
            }

        });

    }


    // =====================================
    // INICIALIZACIÓN
    // =====================================

    initSettings();

    initProfile();

    showSection("home");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
