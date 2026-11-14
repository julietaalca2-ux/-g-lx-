
document.addEventListener("DOMContentLoaded", function () {

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

            current = liked ? current + 1 : Math.max(0, current - 1);

            count.textContent = current + " Me gusta";
        });
    });


    // =====================================
    // GUARDAR PUBLICACIONES
    // =====================================

    document.querySelectorAll(".save-button").forEach(function (button) {
        button.addEventListener("click", function () {
            button.classList.toggle("saved");
        });
    });


    // =====================================
    // NAVEGACIÓN
    // =====================================

    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".app-section");

    function showSection(name) {

        const target = document.getElementById(name + "-section");

        if (!target) {
            console.error("No existe la sección: " + name);
            return;
        }

        // Ocultar todas las pantallas directamente
        sections.forEach(function (section) {
            section.classList.remove("active");
            section.style.setProperty("display", "none", "important");
        });

        // Mostrar solamente la pantalla seleccionada
        target.classList.add("active");
        target.style.setProperty("display", "block", "important");

        // Actualizar los botones inferiores
        navItems.forEach(function (item) {
            item.classList.toggle(
                "active",
                item.dataset.section === name
            );
        });

        window.scrollTo(0, 0);
    }


    // Conectar los botones
    navItems.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();

            const name = button.getAttribute("data-section");

            if (name) {
                showSection(name);
            }
        });
    });


    // Abrir Inicio al cargar
    showSection("home");

});
