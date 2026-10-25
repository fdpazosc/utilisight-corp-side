(() => {
  "use strict";
  const chips = [...document.querySelectorAll(".chip")];
  const items = [...document.querySelectorAll("[data-cat]")];
  if (!chips.length) return;
  chips.forEach((c) =>
    c.addEventListener("click", () => {
      const cat = c.dataset.filter;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      items.forEach((el) => {
        el.hidden = !(cat === "all" || el.dataset.cat === cat);
      });
    }),
  );
})();