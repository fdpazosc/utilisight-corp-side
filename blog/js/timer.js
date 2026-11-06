document.addEventListener("DOMContentLoaded", function() {
    // Define la fecha y hora exacta a partir de la cual se mostrará (Formato: YYYY-MM-DDTHH:mm:ss)
    const fechaMostrar = new Date("2026-11-15T00:00:00");
    const fechaActual = new Date();

    // Si la fecha actual es igual o posterior a la fecha programada
    if (fechaActual >= fechaMostrar) {
        const elemento = document.getElementById("roof-article");
        if (elemento) {
            elemento.removeAttribute("hidden");
        }
    }
});