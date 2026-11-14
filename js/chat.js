// Lógica modular de la sección Chat (ÖG)

const CHAT_STORAGE_KEY = "og_chat_conversations_v1";

let conversations = [];
let activeConversationId = null;

function loadStoredConversations() {
    try {
        const raw = localStorage.getItem(CHAT_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        return [];
    }
}

function saveStoredConversations() {
    try {
        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(conversations));
    } catch (error) {
        // Ignorar si el almacenamiento local no está disponible
    }
}

function formatCurrentTime() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return hours + ":" + minutes;
}

function getInitial(name) {
    const clean = (name || "").trim();
    return clean ? clean.charAt(0).toUpperCase() : "Ö";
}

function renderConversationList() {
    const chatList = document.getElementById("chatList");
    const chatEmpty = document.getElementById("chatEmpty");

    if (!chatList || !chatEmpty) return;

    chatList.innerHTML = "";

    const hasConversations = conversations.length > 0;
    chatEmpty.hidden = hasConversations;
    chatList.hidden = !hasConversations;

    if (!hasConversations) return;

    conversations.forEach(function (conv) {
        const messages = Array.isArray(conv.messages) ? conv.messages : [];
        const lastMsg = messages.length > 0 ? messages[messages.length - 1] : null;
        const previewText = lastMsg ? lastMsg.text : (conv.lastMessage || "Sin mensajes todavía");
        const timeText = lastMsg ? lastMsg.time : (conv.lastTime || "");

        const item = document.createElement("button");
        item.type = "button";
        item.className = "chat-item";
        item.dataset.chatId = conv.id;

        const avatar = document.createElement("div");
        avatar.className = "chat-avatar";
        avatar.textContent = conv.avatar || getInitial(conv.name);

        const body = document.createElement("div");
        body.className = "chat-item-body";

        const top = document.createElement("div");
        top.className = "chat-item-top";

        const nameEl = document.createElement("span");
        nameEl.className = "chat-item-name";
        nameEl.textContent = conv.name || "Usuario";

        const timeEl = document.createElement("span");
        timeEl.className = "chat-item-time";
        timeEl.textContent = timeText;

        const previewEl = document.createElement("p");
        previewEl.className = "chat-item-preview";
        previewEl.textContent = previewText;

        top.appendChild(nameEl);
        top.appendChild(timeEl);
        body.appendChild(top);
        body.appendChild(previewEl);

        item.appendChild(avatar);
        item.appendChild(body);

        chatList.appendChild(item);
    });
}

function renderMessages(conv) {
    const messagesContainer = document.getElementById("chatMessages");
    if (!messagesContainer) return;

    messagesContainer.innerHTML = "";

    const messages = Array.isArray(conv.messages) ? conv.messages : [];

    if (messages.length === 0) {
        const emptyNote = document.createElement("p");
        emptyNote.className = "chat-messages-empty";
        emptyNote.textContent = "Escribí un mensaje para iniciar la conversación.";
        messagesContainer.appendChild(emptyNote);
        return;
    }

    messages.forEach(function (msg) {
        const bubble = document.createElement("div");
        bubble.className = "chat-message " + (msg.sender === "me" ? "sent" : "received");

        const textEl = document.createElement("span");
        textEl.textContent = msg.text;

        const timeEl = document.createElement("span");
        timeEl.className = "chat-message-time";
        timeEl.textContent = msg.time || "";

        bubble.appendChild(textEl);
        bubble.appendChild(timeEl);
        messagesContainer.appendChild(bubble);
    });

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function showChatList() {
    const listView = document.getElementById("chatListView");
    const roomView = document.getElementById("chatRoomView");

    activeConversationId = null;

    if (listView) listView.hidden = false;
    if (roomView) roomView.hidden = true;

    renderConversationList();
}

export function openConversation(conversationId) {
    const conv = conversations.find(function (item) {
        return item.id === conversationId;
    });

    if (!conv) return;

    activeConversationId = conv.id;

    const listView = document.getElementById("chatListView");
    const roomView = document.getElementById("chatRoomView");
    const roomAvatar = document.getElementById("chatRoomAvatar");
    const roomName = document.getElementById("chatRoomName");
    const roomHandle = document.getElementById("chatRoomHandle");
    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("chatSendButton");

    if (roomAvatar) roomAvatar.textContent = conv.avatar || getInitial(conv.name);
    if (roomName) roomName.textContent = conv.name || "Usuario";
    if (roomHandle) roomHandle.textContent = conv.username ? "@" + conv.username.replace(/^@/, "") : "";

    renderMessages(conv);

    if (listView) listView.hidden = true;
    if (roomView) roomView.hidden = false;

    if (chatInput) {
        chatInput.value = "";
    }
    if (sendButton) {
        sendButton.disabled = true;
    }
}

export function sendMessage(text) {
    const cleanText = (text || "").trim();
    if (!cleanText || !activeConversationId) return;

    const conv = conversations.find(function (item) {
        return item.id === activeConversationId;
    });

    if (!conv) return;

    if (!Array.isArray(conv.messages)) {
        conv.messages = [];
    }

    const time = formatCurrentTime();

    conv.messages.push({
        id: "msg_" + Date.now(),
        sender: "me",
        text: cleanText,
        time: time
    });

    conv.lastMessage = cleanText;
    conv.lastTime = time;

    saveStoredConversations();
    renderMessages(conv);
    renderConversationList();
}

export function getConversations() {
    return conversations.slice();
}

export function setConversations(nextConversations) {
    conversations = Array.isArray(nextConversations) ? nextConversations : [];
    saveStoredConversations();
    renderConversationList();
}

export function initChat() {
    conversations = loadStoredConversations();

    const chatList = document.getElementById("chatList");
    const backButton = document.getElementById("chatBackButton");
    const chatForm = document.getElementById("chatForm");
    const chatInput = document.getElementById("chatInput");
    const sendButton = document.getElementById("chatSendButton");

    if (chatList) {
        chatList.addEventListener("click", function (event) {
            const item = event.target.closest(".chat-item");
            if (!item) return;

            const chatId = item.dataset.chatId;
            if (chatId) {
                openConversation(chatId);
            }
        });
    }

    if (backButton) {
        backButton.addEventListener("click", function () {
            showChatList();
        });
    }

    if (chatInput && sendButton) {
        chatInput.addEventListener("input", function () {
            sendButton.disabled = chatInput.value.trim().length === 0;
        });
    }

    if (chatForm && chatInput) {
        chatForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const value = chatInput.value.trim();
            if (!value) return;

            sendMessage(value);
            chatInput.value = "";

            if (sendButton) {
                sendButton.disabled = true;
            }
        });
    }

    showChatList();
}

