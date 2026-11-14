(function () {
    "use strict";

    function initApp() {

        // =====================================
        // ESTADO DE LA APLICACIÓN
        // =====================================

        const state = {
            currentUser: {
                username: "usuario_og",
                bio: "Bienvenido a mi perfil de ÖG."
            },
            selectedPhotoDataUrl: null,
            activeCommentPostId: null,
            activeChatId: null,
            commentsByPost: {
                "post-1": [
                    { user: "sofia", text: "Qué buen comienzo en ÖG." },
                    { user: "mateo", text: "Me gusta mucho el diseño limpio." }
                ],
                "post-2": [
                    { user: "lucia", text: "Excelente día para compartir." }
                ]
            },
            conversations: [
                {
                    id: "chat-sofia",
                    username: "sofia",
                    initial: "S",
                    messages: [
                        { sender: "them", text: "Hola, ¿ya probaste la nueva versión de ÖG?", time: "10:15" }
                    ]
                },
                {
                    id: "chat-mateo",
                    username: "mateo",
                    initial: "M",
                    messages: [
                        { sender: "them", text: "Vi tu última publicación en el inicio.", time: "09:40" }
                    ]
                },
                {
                    id: "chat-lucia",
                    username: "lucia",
                    initial: "L",
                    messages: [
                        { sender: "them", text: "Avísame cuando subas nuevas fotos.", time: "Ayer" }
                    ]
                }
            ]
        };


        // =====================================
        // REFERENCIAS DEL DOM
        // =====================================

        const navItems = document.querySelectorAll(".nav-item");
        const sections = document.querySelectorAll(".app-section");
        const feedPostsContainer = document.getElementById("feedPosts");

        const profileTabs = document.querySelectorAll(".profile-tab");
        const profilePanels = document.querySelectorAll(".profile-tab-panel");
        const savedPostsContainer = document.getElementById("savedPosts");
        const savedEmpty = document.getElementById("savedEmpty");
        const profilePostsContainer = document.getElementById("profilePosts");
        const profilePublicationsEmpty = document.getElementById("profilePublicationsEmpty");

        const chatListView = document.getElementById("chatListView");
        const chatThreadView = document.getElementById("chatThreadView");
        const chatListContainer = document.getElementById("chatList");
        const chatBackBtn = document.getElementById("chatBackBtn");
        const chatThreadAvatar = document.getElementById("chatThreadAvatar");
        const chatThreadName = document.getElementById("chatThreadName");
        const chatMessagesContainer = document.getElementById("chatMessages");
        const chatForm = document.getElementById("chatForm");
        const chatMessageInput = document.getElementById("chatMessageInput");

        const createPostForm = document.getElementById("createPostForm");
        const postPhotoInput = document.getElementById("postPhotoInput");
        const selectPhotoBtn = document.getElementById("selectPhotoBtn");
        const changePhotoBtn = document.getElementById("changePhotoBtn");
        const removePhotoBtn = document.getElementById("removePhotoBtn");
        const createPickerBox = document.getElementById("createPickerBox");
        const createPreviewBox = document.getElementById("createPreviewBox");
        const createPreviewImg = document.getElementById("createPreviewImg");
        const postCaptionInput = document.getElementById("postCaptionInput");

        const settingsMenuView = document.getElementById("settingsMenuView");
        const settingsSubviews = document.querySelectorAll(".settings-subview");
        const editProfileForm = document.getElementById("editProfileForm");
        const editNameInput = document.getElementById("editNameInput");
        const editBioInput = document.getElementById("editBioInput");

        const sheetBackdrop = document.getElementById("sheetBackdrop");
        const sheetTitle = document.getElementById("sheetTitle");
        const sheetBody = document.getElementById("sheetBody");
        const sheetCloseBtn = document.getElementById("sheetCloseBtn");
        const sheetCommentForm = document.getElementById("sheetCommentForm");
        const sheetCommentInput = document.getElementById("sheetCommentInput");

        const appToast = document.getElementById("appToast");
        let toastTimer = null;


        // =====================================
        // UTILIDADES
        // =====================================

        function showToast(message) {
            if (!appToast) return;
            appToast.textContent = message;
            appToast.classList.add("visible");
            clearTimeout(toastTimer);
            toastTimer = setTimeout(function () {
                appToast.classList.remove("visible");
            }, 2400);
        }

        function getCurrentTime() {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, "0");
            const minutes = String(now.getMinutes()).padStart(2, "0");
            return hours + ":" + minutes;
        }

        function escapeHTML(text) {
            const div = document.createElement("div");
            div.textContent = text;
            return div.innerHTML;
        }


        // =====================================
        // NAVEGACIÓN PRINCIPAL (5 SECCIONES)
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

            if (name === "chat") {
                closeChatThread();
                renderChatList();
            }

            if (name === "profile") {
                loadProfilePosts();
                updateSavedPosts();
            }

            if (name === "settings") {
                showSettingsMenu();
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

        document.querySelectorAll("[data-section-link]").forEach(function (button) {
            button.addEventListener("click", function (event) {
                event.preventDefault();
                const name = button.dataset.sectionLink;
                if (name) {
                    showSection(name);
                }
            });
        });

        const logoHomeBtn = document.getElementById("logoHomeBtn");
        if (logoHomeBtn) {
            logoHomeBtn.addEventListener("click", function () {
                showSection("home");
            });
        }


        // =====================================
        // 1. INICIO: HISTORIAS Y ACCIONES DE POSTS
        // =====================================

        document.querySelectorAll(".story").forEach(function (storyBtn) {
            storyBtn.addEventListener("click", function () {
                const user = storyBtn.dataset.storyUser || "Historia";
                const text = storyBtn.dataset.storyText || "";
                openSheet(user, "<p>" + escapeHTML(text) + "</p>", false);
            });
        });

        const notificationsBtn = document.getElementById("notificationsBtn");
        if (notificationsBtn) {
            notificationsBtn.addEventListener("click", function () {
                const html =
                    '<div class="sheet-comment-item"><strong>sofia</strong> indicó Me gusta en tu publicación.</div>' +
                    '<div class="sheet-comment-item"><strong>mateo</strong> comentó: "Me gusta mucho el diseño limpio."</div>';
                openSheet("Actividad reciente", html, false);
            });
        }

        function updateCommentCountLabel(postEl, postId) {
            const btn = postEl.querySelector(".view-comments-btn");
            if (!btn) return;
            const list = state.commentsByPost[postId] || [];
            if (list.length === 0) {
                btn.textContent = "Agregar un comentario";
            } else if (list.length === 1) {
                btn.textContent = "Ver 1 comentario";
            } else {
                btn.textContent = "Ver los " + list.length + " comentarios";
            }
        }

        function openCommentsForPost(postId) {
            state.activeCommentPostId = postId;
            const list = state.commentsByPost[postId] || [];
            let html = "";

            if (list.length === 0) {
                html = '<p style="color:#888;">Todavía no hay comentarios. Sé el primero en comentar.</p>';
            } else {
                html = list.map(function (c) {
                    return '<div class="sheet-comment-item"><strong>' +
                        escapeHTML(c.user) +
                        "</strong>" +
                        escapeHTML(c.text) +
                        "</div>";
                }).join("");
            }

            openSheet("Comentarios", html, true);
        }

        // Delegación de eventos en el Feed (funciona en posts iniciales y recién creados)
        if (feedPostsContainer) {
            feedPostsContainer.addEventListener("click", function (event) {
                const post = event.target.closest(".post");
                if (!post) return;

                const postId = post.dataset.postId || post.id;

                // Me gusta
                const likeBtn = event.target.closest(".like-button");
                if (likeBtn) {
                    const countEl = post.querySelector(".likes-count");
                    if (!countEl) return;
                    const liked = likeBtn.classList.toggle("liked");
                    let current = parseInt(countEl.textContent, 10) || 0;
                    current = liked ? current + 1 : Math.max(0, current - 1);
                    countEl.textContent = current + " Me gusta";
                    return;
                }

                // Guardar
                const saveBtn = event.target.closest(".save-button");
                if (saveBtn) {
                    const isSaved = saveBtn.classList.toggle("saved");
                    updateSavedPosts();
                    showToast(isSaved ? "Guardado en tu perfil" : "Eliminado de guardados");
                    return;
                }

                // Comentar
                const commentBtn = event.target.closest(".comment-button") || event.target.closest(".view-comments-btn");
                if (commentBtn) {
                    openCommentsForPost(postId);
                    return;
                }

                // Compartir
                const shareBtn = event.target.closest(".share-button");
                if (shareBtn) {
                    const author = post.dataset.username || "usuario";
                    const captionEl = post.querySelector(".post-caption-text");
                    const caption = captionEl ? captionEl.textContent : "";
                    const shareText = "Publicación de " + author + " en ÖG: " + caption;

                    if (navigator.share) {
                        navigator.share({
                            title: "ÖG",
                            text: shareText,
                            url: window.location.href
                        }).catch(function () {});
                    } else if (navigator.clipboard && navigator.clipboard.writeText) {
                        navigator.clipboard.writeText(shareText).then(function () {
                            showToast("Texto de publicación copiado");
                        }).catch(function () {
                            showToast("Listo para compartir");
                        });
                    } else {
                        showToast("Listo para compartir");
                    }
                    return;
                }

                // Más opciones
                const moreBtn = event.target.closest(".more-button");
                if (moreBtn) {
                    const isOwn = post.dataset.username === state.currentUser.username;
                    let html = '<button type="button" class="settings-option" id="modalCopyPostBtn"><span>Copiar descripción</span><span>›</span></button>';
                    if (isOwn) {
                        html += '<button type="button" class="settings-option" id="modalDeletePostBtn" style="color:#d93025;"><span>Eliminar publicación</span><span>›</span></button>';
                    }
                    openSheet("Opciones de publicación", html, false);

                    const copyBtn = document.getElementById("modalCopyPostBtn");
                    if (copyBtn) {
                        copyBtn.addEventListener("click", function () {
                            const txt = post.querySelector(".post-caption-text")?.textContent || "";
                            if (navigator.clipboard) {
                                navigator.clipboard.writeText(txt).catch(function () {});
                            }
                            closeSheet();
                            showToast("Descripción copiada");
                        });
                    }

                    const deleteBtn = document.getElementById("modalDeletePostBtn");
                    if (deleteBtn) {
                        deleteBtn.addEventListener("click", function () {
                            post.remove();
                            loadProfilePosts();
                            updateSavedPosts();
                            closeSheet();
                            showToast("Publicación eliminada");
                        });
                    }
                }
            });
        }


        // =====================================
        // MODAL INFERIOR (COMENTARIOS / INFO)
        // =====================================

        function openSheet(title, bodyHTML, showCommentForm) {
            if (!sheetBackdrop) return;
            sheetTitle.textContent = title;
            sheetBody.innerHTML = bodyHTML;
            sheetCommentForm.hidden = !showCommentForm;
            sheetBackdrop.hidden = false;
            if (showCommentForm && sheetCommentInput) {
                sheetCommentInput.value = "";
            }
        }

        function closeSheet() {
            if (!sheetBackdrop) return;
            sheetBackdrop.hidden = true;
            state.activeCommentPostId = null;
        }

        if (sheetCloseBtn) {
            sheetCloseBtn.addEventListener("click", closeSheet);
        }

        if (sheetBackdrop) {
            sheetBackdrop.addEventListener("click", function (event) {
                if (event.target === sheetBackdrop) {
                    closeSheet();
                }
            });
        }

        if (sheetCommentForm) {
            sheetCommentForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const text = sheetCommentInput.value.trim();
                const postId = state.activeCommentPostId;
                if (!text || !postId) return;

                if (!state.commentsByPost[postId]) {
                    state.commentsByPost[postId] = [];
                }

                state.commentsByPost[postId].push({
                    user: state.currentUser.username,
                    text: text
                });

                const postEl = document.querySelector('.post[data-post-id="' + postId + '"]');
                if (postEl) {
                    updateCommentCountLabel(postEl, postId);
                }

                openCommentsForPost(postId);
            });
        }


        // =====================================
        // 2. CHAT: LISTA Y CONVERSACIÓN INDIVIDUAL
        // =====================================

        function renderChatList() {
            if (!chatListContainer) return;
            chatListContainer.innerHTML = "";

            state.conversations.forEach(function (conv) {
                const lastMsg = conv.messages[conv.messages.length - 1];
                const previewText = lastMsg
                    ? (lastMsg.sender === "me" ? "Tú: " + lastMsg.text : lastMsg.text)
                    : "Sin mensajes";
                const timeText = lastMsg ? lastMsg.time : "";

                const item = document.createElement("button");
                item.type = "button";
                item.className = "chat-item";
                item.innerHTML =
                    '<div class="chat-item-avatar">' + escapeHTML(conv.initial) + "</div>" +
                    '<div class="chat-item-body">' +
                        '<div class="chat-item-top">' +
                            "<strong>" + escapeHTML(conv.username) + "</strong>" +
                            '<span class="chat-item-time">' + escapeHTML(timeText) + "</span>" +
                        "</div>" +
                        '<span class="chat-item-preview">' + escapeHTML(previewText) + "</span>" +
                    "</div>";

                item.addEventListener("click", function () {
                    openChatThread(conv.id);
                });

                chatListContainer.appendChild(item);
            });
        }

        function openChatThread(chatId) {
            const conv = state.conversations.find(function (c) {
                return c.id === chatId;
            });
            if (!conv) return;

            state.activeChatId = chatId;
            chatThreadAvatar.textContent = conv.initial;
            chatThreadName.textContent = conv.username;

            renderChatMessages(conv);

            chatListView.hidden = true;
            chatThreadView.hidden = false;
        }

        function closeChatThread() {
            state.activeChatId = null;
            if (chatThreadView) chatThreadView.hidden = true;
            if (chatListView) chatListView.hidden = false;
        }

        function renderChatMessages(conv) {
            if (!chatMessagesContainer) return;
            chatMessagesContainer.innerHTML = "";

            conv.messages.forEach(function (msg) {
                const bubble = document.createElement("div");
                bubble.className = "chat-bubble " + (msg.sender === "me" ? "sent" : "received");
                bubble.innerHTML =
                    "<span>" + escapeHTML(msg.text) + "</span>" +
                    '<span class="chat-bubble-time">' + escapeHTML(msg.time) + "</span>";
                chatMessagesContainer.appendChild(bubble);
            });
        }

        if (chatBackBtn) {
            chatBackBtn.addEventListener("click", function () {
                closeChatThread();
                renderChatList();
            });
        }

        if (chatForm) {
            chatForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const text = chatMessageInput.value.trim();
                if (!text || !state.activeChatId) return;

                const conv = state.conversations.find(function (c) {
                    return c.id === state.activeChatId;
                });
                if (!conv) return;

                conv.messages.push({
                    sender: "me",
                    text: text,
                    time: getCurrentTime()
                });

                chatMessageInput.value = "";
                renderChatMessages(conv);
            });
        }


        // =====================================
        // 3. CREAR PUBLICACIÓN
        // =====================================

        function resetCreateForm() {
            state.selectedPhotoDataUrl = null;
            if (postPhotoInput) postPhotoInput.value = "";
            if (postCaptionInput) postCaptionInput.value = "";
            if (createPreviewImg) createPreviewImg.src = "";
            if (createPreviewBox) createPreviewBox.hidden = true;
            if (createPickerBox) createPickerBox.hidden = false;
        }

        if (selectPhotoBtn && postPhotoInput) {
            selectPhotoBtn.addEventListener("click", function () {
                postPhotoInput.click();
            });
        }

        if (changePhotoBtn && postPhotoInput) {
            changePhotoBtn.addEventListener("click", function () {
                postPhotoInput.click();
            });
        }

        if (removePhotoBtn) {
            removePhotoBtn.addEventListener("click", function () {
                state.selectedPhotoDataUrl = null;
                if (postPhotoInput) postPhotoInput.value = "";
                if (createPreviewImg) createPreviewImg.src = "";
                createPreviewBox.hidden = true;
                createPickerBox.hidden = false;
            });
        }

        if (postPhotoInput) {
            postPhotoInput.addEventListener("change", function () {
                const file = postPhotoInput.files && postPhotoInput.files[0];
                if (!file) return;

                if (!file.type.startsWith("image/")) {
                    showToast("Selecciona un archivo de imagen válido");
                    return;
                }

                const reader = new FileReader();
                reader.onload = function (e) {
                    state.selectedPhotoDataUrl = e.target.result;
                    createPreviewImg.src = state.selectedPhotoDataUrl;
                    createPickerBox.hidden = true;
                    createPreviewBox.hidden = false;
                };
                reader.readAsDataURL(file);
            });
        }

        function createPostElement(imageSrc, caption) {
            const newId = "post-" + Date.now();
            state.commentsByPost[newId] = [];

            const username = state.currentUser.username;
            const initial = username.charAt(0).toUpperCase();

            const article = document.createElement("article");
            article.className = "post";
            article.id = newId;
            article.dataset.postId = newId;
            article.dataset.username = username;

            article.innerHTML =
                '<div class="post-header">' +
                    '<div class="user-avatar">' + escapeHTML(initial) + "</div>" +
                    '<div class="user-info">' +
                        '<strong class="post-author-name">' + escapeHTML(username) + "</strong>" +
                        "<span>Ahora mismo</span>" +
                    "</div>" +
                    '<button class="more-button" type="button" aria-label="Más opciones">•••</button>' +
                "</div>" +
                '<div class="post-image">' +
                    '<img src="' + imageSrc + '" alt="Publicación de ' + escapeHTML(username) + '">' +
                "</div>" +
                '<div class="post-actions">' +
                    '<div class="post-actions-left">' +
                        '<button class="action-button like-button" type="button" aria-label="Me gusta">' +
                            '<svg viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></svg>' +
                        "</button>" +
                        '<button class="action-button comment-button" type="button" aria-label="Comentar">' +
                            '<svg viewBox="0 0 24 24"><path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8Z"/></svg>' +
                        "</button>" +
                        '<button class="action-button share-button" type="button" aria-label="Compartir">' +
                            '<svg viewBox="0 0 24 24"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>' +
                        "</button>" +
                    "</div>" +
                    '<button class="action-button save-button" type="button" aria-label="Guardar">' +
                        '<svg viewBox="0 0 24 24"><path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-4-6 4Z"/></svg>' +
                    "</button>" +
                "</div>" +
                '<div class="post-description">' +
                    '<strong class="likes-count">0 Me gusta</strong>' +
                    '<p><strong class="post-caption-user">' + escapeHTML(username) + '</strong> <span class="post-caption-text">' + escapeHTML(caption) + "</span></p>" +
                    '<button class="view-comments-btn" type="button">Agregar un comentario</button>' +
                "</div>";

            return article;
        }

        if (createPostForm) {
            createPostForm.addEventListener("submit", function (event) {
                event.preventDefault();

                if (!state.selectedPhotoDataUrl) {
                    showToast("Selecciona una fotografía primero");
                    return;
                }

                const caption = postCaptionInput.value.trim() || "Nueva publicación en ÖG.";
                const newPost = createPostElement(state.selectedPhotoDataUrl, caption);

                if (feedPostsContainer) {
                    feedPostsContainer.prepend(newPost);
                }

                loadProfilePosts();
                resetCreateForm();
                showSection("home");
                showToast("Publicación compartida");
            });
        }


        // =====================================
        // 4. PERFIL Y PESTAÑAS INTERNAS
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
                copy.removeAttribute("id");
                copy.classList.add("saved-post-copy");
                savedPostsContainer.appendChild(copy);
            });

            const hasSavedPosts = savedButtons.length > 0;
            savedEmpty.style.display = hasSavedPosts ? "none" : "flex";
            savedPostsContainer.style.display = hasSavedPosts ? "flex" : "none";
        }

        function loadProfilePosts() {
            if (!profilePostsContainer) return;

            profilePostsContainer.innerHTML = "";

            const ownPosts = document.querySelectorAll(
                '#feedPosts .post[data-username="' + state.currentUser.username + '"]'
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

        function syncProfileIdentityUI() {
            const displayNameEl = document.getElementById("profileDisplayName");
            const handleEl = document.getElementById("profileHandle");
            const bioEl = document.getElementById("profileBioText");
            const avatarEl = document.getElementById("profileAvatarInitial");

            if (displayNameEl) displayNameEl.textContent = state.currentUser.username;
            if (handleEl) handleEl.textContent = "@" + state.currentUser.username;
            if (bioEl) bioEl.textContent = state.currentUser.bio;
            if (avatarEl) {
                avatarEl.textContent = state.currentUser.username.charAt(0).toUpperCase();
            }
        }


        // =====================================
        // 5. AJUSTES Y SUBPANTALLAS
        // =====================================

        function showSettingsMenu() {
            if (settingsMenuView) settingsMenuView.hidden = false;
            settingsSubviews.forEach(function (view) {
                view.hidden = true;
            });
        }

        function openSettingsSubview(viewName) {
            const target = document.getElementById("settings-" + viewName);
            if (!target) return;

            if (settingsMenuView) settingsMenuView.hidden = true;
            settingsSubviews.forEach(function (view) {
                view.hidden = view !== target;
            });

            if (viewName === "edit-profile") {
                if (editNameInput) editNameInput.value = state.currentUser.username;
                if (editBioInput) editBioInput.value = state.currentUser.bio;
            }
        }

        document.querySelectorAll("[data-settings-view]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                openSettingsSubview(btn.dataset.settingsView);
            });
        });

        document.querySelectorAll(".settings-back-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                showSettingsMenu();
            });
        });

        if (editProfileForm) {
            editProfileForm.addEventListener("submit", function (event) {
                event.preventDefault();
                const oldUsername = state.currentUser.username;
                const newUsername = editNameInput.value.trim().replace(/\s+/g, "_") || oldUsername;
                const newBio = editBioInput.value.trim();

                state.currentUser.username = newUsername;
                state.currentUser.bio = newBio;

                // Actualizar publicaciones propias existentes en el Feed
                document.querySelectorAll('#feedPosts .post[data-username="' + oldUsername + '"]').forEach(function (post) {
                    post.dataset.username = newUsername;
                    const authorEl = post.querySelector(".post-author-name");
                    const captionUserEl = post.querySelector(".post-caption-user");
                    const avatarEl = post.querySelector(".user-avatar");
                    if (authorEl) authorEl.textContent = newUsername;
                    if (captionUserEl) captionUserEl.textContent = newUsername;
                    if (avatarEl) avatarEl.textContent = newUsername.charAt(0).toUpperCase();
                });

                syncProfileIdentityUI();
                loadProfilePosts();
                updateSavedPosts();
                showSettingsMenu();
                showToast("Perfil actualizado");
            });
        }

        document.querySelectorAll("#settings-privacy input[type='checkbox'], #settings-notifications input[type='checkbox']").forEach(function (checkbox) {
            checkbox.addEventListener("change", function () {
                showToast("Preferencia actualizada");
            });
        });

        const resetAppBtn = document.getElementById("resetAppBtn");
        if (resetAppBtn) {
            resetAppBtn.addEventListener("click", function () {
                window.location.reload();
            });
        }


        // =====================================
        // INICIALIZACIÓN
        // =====================================

        renderChatList();
        syncProfileIdentityUI();
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
