
document.addEventListener("DOMContentLoaded", () => {

    // =====================================
    // ME GUSTA
    // =====================================
    document.querySelectorAll(".like-button").forEach(button => {
        button.addEventListener("click", () => {
            const post = button.closest(".post");
            if (!post) return;

            const count = post.querySelector(".likes-count");
            if (!count) return;

            const liked = button.classList.toggle("liked");
            let current = parseInt(count.textContent, 10) || 0;

            current = liked ? current + 1 : Math.max(0, current - 1);

            count.textContent = `${current} Me gusta`;
        });
    });


    // =====================================
    // GUARDAR PUBLICACIONES
    // =====================================
    document.querySelectorAll(".save-button").forEach(button => {
        button.addEventListener("click", () => {
            button.classList.toggle("saved");
        });
    });


    // =====================================
    // NAVEGACIÓN ENTRE SECCIONES
    // =====================================
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".app-section");

    function showSection(sectionName) {
        const targetSection = document.getElementById(
            `${sectionName}-section`
        );

        // Si la sección no existe, no hacemos el cambio
        if (!targetSection) {
            console.warn("No se encontró la sección:", sectionName);
            return;
        }

        // Ocultar todas las secciones
        sections.forEach(section => {
            section.classList.remove("active");
        });

        // Mostrar la sección seleccionada
        targetSection.classList.add("active");

        // Actualizar el botón seleccionado
        navItems.forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.section === sectionName
            );
        });

        // Volver arriba al cambiar de pantalla
        window.scrollTo(0, 0);
    }

    // Activar navegación
    navItems.forEach(button => {
        button.addEventListener("click", () => {
            const sectionName = button.dataset.section;

            if (sectionName) {
                showSection(sectionName);
            }
        });
    });

    // Mostrar Inicio al abrir la aplicación
    showSection("home");

});
