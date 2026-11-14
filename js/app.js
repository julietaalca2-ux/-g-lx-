(function () {
    "use strict";

    function initApp() {

        // =====================================
        // ELEMENTOS PRINCIPALES
        // =====================================

        const navItems = document.querySelectorAll(".nav-item");
        const sections = document.querySelectorAll(".app-section");

        const profileTabs = document.querySelectorAll(".profile-tab");
        const profilePanels = document.querySelectorAll(".profile-tab-panel");

        const savedPostsContainer = document.getElementById("savedPosts");
        const savedEmpty = document.getElementById("savedEmpty");

        const profilePostsContainer = document.getElementById("profilePosts");
        const profilePublicationsEmpty = document.getElementById("profilePublicationsEmpty");


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
                showSection(button.dataset.sectionLink);
            });

        });


        // =====================================
        // PESTAÑAS INTERNAS DEL PERFIL
        // =====================================

        function showProfileTab(name) {

            const target = document.getElementById("profile-" + name);

            if (!target) {
                console.error("No existe la pestaña del perfil: " + name);
                return;
            }

            profileTabs.forEach(function (tab) {

                const selected = tab.dataset.profileTab === name;

                tab.classList.toggle("active", selected);
                tab.setAttribute("aria-selected", selected ? "true" : "false");

            });

            profilePanels.forEach(function (panel) {
                const isTarget = panel === target;
                panel.classList.toggle("active", isTarget);
                panel.hidden = !isTarget;
            });
        }


        profileTabs.forEach(function (button) {

            button.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const name = button.dataset.profileTab;

                if (name) {
                    showProfileTab(name);
                }

            });

        });


        // =====================================
        // ME GUSTA
        // =====================================

        document.querySelectorAll(".like-button").forEach(function (button) {

            button.addEventListener("click", function () {

                const post = button.closest(".post");

                if (!post) return;

                const count = post.querySelector(".likes-count");

                if (!count) return;

                const liked = button.classList.toggle("liked");

                let current = parseInt(count.textContent, 10) || 0;

                current = liked
                    ? current + 1
                    : Math.max(0, current - 1);

                count.textContent = current + " Me gusta";

            });

        });


        // =====================================
        // GUARDAR PUBLICACIONES
        // =====================================

        function updateSavedPosts() {

            if (!savedPostsContainer || !savedEmpty) return;

            savedPostsContainer.innerHTML = "";

            const savedButtons = document.querySelectorAll(
                "#feedPosts .save-button.saved"
            );

            savedButtons.forEach(function (button) {

                const originalPost = button.closest(".post");

                if (!originalPost) return;

                const copy = originalPost.cloneNode(true);

                // Evitar IDs duplicados.
                copy.removeAttribute("id");

                copy.classList.add("saved-post-copy");

                // Las copias son solo una vista de los guardados.
                savedPostsContainer.appendChild(copy);

            });

            const hasSavedPosts = savedButtons.length > 0;

            savedEmpty.style.display = hasSavedPosts ? "none" : "flex";
            savedPostsContainer.style.display = hasSavedPosts ? "flex" : "none";
        }


        document.querySelectorAll("#feedPosts .save-button").forEach(function (button) {

            button.addEventListener("click", function () {

                button.classList.toggle("saved");

                updateSavedPosts();

            });

        });


        // =====================================
        // PUBLICACIONES PROPIAS DEL PERFIL
        // =====================================

        function loadProfilePosts() {

            if (!profilePostsContainer) return;

            profilePostsContainer.innerHTML = "";

            const ownPosts = document.querySelectorAll(
                '#feedPosts .post[data-username="usuario_og"]'
            );

            ownPosts.forEach(function (post) {

                const image = post.querySelector(".post-image");

                if (!image) return;

                const tile = document.createElement("div");

                tile.className = "profile-post-tile";

                tile.appendChild(image.cloneNode(true));

                profilePostsContainer.appendChild(tile);

            });

            const hasPosts = profilePostsContainer.children.length > 0;

            if (profilePublicationsEmpty) {
                profilePublicationsEmpty.style.display = hasPosts ? "none" : "flex";
            }

            const count = document.getElementById("profilePostCount");

            if (count) {
                count.textContent = ownPosts.length;
            }
        }


        // =====================================
        // INICIALIZACIÓN
        // =====================================

        loadProfilePosts();

        updateSavedPosts();

        showProfileTab("publications");

        showSection("home");
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initApp);
    } else {
        initApp();
    }

})();
