
document.addEventListener("DOMContentLoaded", () => {

    // ME GUSTA
    document.querySelectorAll(".like-button").forEach(button => {
        button.addEventListener("click", () => {
            const post = button.closest(".post");
            const count = post.querySelector(".likes-count");
            const liked = button.classList.toggle("liked");

            let current = parseInt(count.textContent, 10) || 0;

            current = liked ? current + 1 : current - 1;

            count.textContent = `${current} Me gusta`;
        });
    });

    // GUARDAR PUBLICACIONES
    document.querySelectorAll(".save-button").forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("saved");
        });
    });

    // NAVEGACIÓN
    document.querySelectorAll(".nav-item").forEach(button => {
        button.addEventListener("click", () => {

            document.querySelectorAll(".nav-item").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const section = button.dataset.section;

            if (section !== "home") {
                console.log("Sección pendiente de construcción:", section);
            }
        });
    });

});
