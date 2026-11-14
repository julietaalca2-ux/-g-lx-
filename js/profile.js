// Lógica modular de la sección Perfil (ÖG)

export function showProfileTab(name) {
    const target = document.getElementById("profile-" + name);

    if (!target) {
        console.error("No existe la pestaña del perfil: " + name);
        return;
    }

    const profileTabs = document.querySelectorAll(".profile-tab");
    const profilePanels = document.querySelectorAll(".profile-tab-panel");

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

export function updateSavedPosts() {
    const savedPostsContainer = document.getElementById("savedPosts");
    const savedEmpty = document.getElementById("savedEmpty");

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

export function loadProfilePosts() {
    const profilePostsContainer = document.getElementById("profilePosts");
    const profilePublicationsEmpty = document.getElementById("profilePublicationsEmpty");

    if (!profilePostsContainer) return;

    profilePostsContainer.innerHTML = "";

    const usernameEl = document.querySelector("#profile-section .profile-header p");
    const activeUsername = usernameEl
        ? usernameEl.textContent.trim().replace(/^@+/, "")
        : "usuario_og";

    const ownPosts = document.querySelectorAll(
        `#feedPosts .post[data-username="${activeUsername || "usuario_og"}"]`
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

export function initProfile() {
    const profileTabs = document.querySelectorAll(".profile-tab");

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

    loadProfilePosts();
    updateSavedPosts();
    showProfileTab("publications");
}

