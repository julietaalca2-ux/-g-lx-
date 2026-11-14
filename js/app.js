// Punto de entrada principal de ÖG
import { initSettings, showSettingsSubview } from "./settings.js?v=1";
import { initProfile, updateSavedPosts, loadProfilePosts } from "./profile.js?v=1";
import { initFeed, syncFeedWithProfile } from "./feed.js?v=1";

function initApp() {

    // =====================================
    // ELEMENTOS PRINCIPALES
    // =====================================

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".app-section");


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

        if (name === "home") {
            syncFeedWithProfile();
        }

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
    // INICIALIZACIÓN
    // =====================================

    initSettings();

    initProfile();

    initFeed();

    showSection("home");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
