// Lógica modular de la sección Feed (ÖG)
import { updateSavedPosts, loadProfilePosts } from "./profile.js?v=1";

export function updateFeedEmptyState() {
    const feedPostsContainer = document.getElementById("feedPosts");
    const feedEmpty = document.getElementById("feedEmpty");

    if (!feedPostsContainer || !feedEmpty) return;

    const hasPosts = feedPostsContainer.querySelectorAll(".post").length > 0;

    feedEmpty.hidden = hasPosts;
    feedEmpty.style.display = hasPosts ? "none" : "flex";
    feedPostsContainer.style.display = hasPosts ? "block" : "none";
}

export function syncFeedWithProfile() {
    loadProfilePosts();
    updateSavedPosts();
    updateFeedEmptyState();
}

export function initFeed() {
    const feedPostsContainer = document.getElementById("feedPosts");

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

    updateFeedEmptyState();
}

