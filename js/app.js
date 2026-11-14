
document.addEventListener("DOMContentLoaded", () => {
    const navigation = document.querySelectorAll(".nav-item");

    navigation.forEach(button => {
        button.addEventListener("click", () => {
            navigation.forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            const section = button.dataset.section;

            if (section !== "home") {
                console.log("Sección pendiente:", section);
            }
        });
    });
});
