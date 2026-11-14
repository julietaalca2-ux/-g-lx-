// Punto de entrada principal de ÖG
import { initSettings, showSettingsSubview } from "./settings.js?v=1";
import { initProfile, updateSavedPosts, loadProfilePosts } from "./profile.js?v=1";
import { initFeed, syncFeedWithProfile } from "./feed.js?v=1";
import { initChat, showChatList } from "./chat.js?v=1";
import { initCreate, resetCreateForm } from "./create.js?v=1";

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
            try { syncFeedWithProfile(); } catch (e) {}
        }

        if (name === "chat") {
            try { showChatList(); } catch (e) {}
        }

        if (name === "camera") {
            try { resetCreateForm(); } catch (e) {}
        }

        if (name === "settings") {
            try { showSettingsSubview("main"); } catch (e) {}
        }

        if (name === "profile") {
            try {
                loadProfilePosts();
                updateSavedPosts();
            } catch (e) {}
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
    // INICIALIZACIÓN SEGURA DE MÓDULOS
    // =====================================

    try { initSettings(); } catch (e) { console.error("Error en settings:", e); }
    try { initProfile(); } catch (e) { console.error("Error en profile:", e); }
    try { initFeed(); } catch (e) { console.error("Error en feed:", e); }
    try { initChat(); } catch (e) { console.error("Error en chat:", e); }
    
    try {
        initCreate({
            onPublished: function () {
                showSection("home");
            }
        });
    } catch (e) { console.error("Error en create:", e); }

    showSection("home");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
} else {
    initApp();
}
