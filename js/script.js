(() => {
  "use strict";
  const $ = (s, c = document) => c.querySelector(s),
    $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- sticky header shadow ---------- */
  const hdr = $("#hdr");
  if (hdr)
    addEventListener(
      "scroll",
      () => hdr.classList.toggle("scrolled", scrollY > 10),
      { passive: true },
    );

  /* ---------- mobile menu ---------- */
  const burger = $("#burger"),
    mnav = $("#mnav");
  if (burger && mnav) {
    burger.addEventListener("click", () => {
      const open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      document.body.style.overflow = open ? "hidden" : "";
    });
    $$("#mnav a").forEach((a) =>
      a.addEventListener("click", () => {
        mnav.classList.remove("open");
        burger.classList.remove("open");
        burger.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }),
    );
  }

  /* ---------- fade-up on scroll (600 ms) ---------- */
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("in");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12, rootMargin: "0px 0px -5% 0px" },
  );
  $$("[data-reveal]").forEach((el) => io.observe(el));

  /* ---------- process accordion ---------- */
  $$(".acc").forEach((acc) => {
    $(".acc-head", acc).addEventListener("click", () => {
      const isOpen = acc.classList.contains("open");
      $$(".acc.open").forEach((o) => {
        o.classList.remove("open");
        $(".acc-head", o).setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        acc.classList.add("open");
        $(".acc-head", acc).setAttribute("aria-expanded", "true");
      }
    });
  });

  /* ---------- data-lock sound (opt-in, Web Audio) ---------- */
  let AC = null;
  function lockSound() {
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === "suspended") AC.resume();
      const t = AC.currentTime + 0.02,
        out = AC.createGain();
      out.gain.value = 0.15;
      out.connect(AC.destination);
      const tone = (f, st, d, v) => {
        const o = AC.createOscillator(),
          g = AC.createGain();
        o.type = "sine";
        o.frequency.value = f;
        g.gain.setValueAtTime(0, st);
        g.gain.linearRampToValueAtTime(v, st + 0.01);
        g.gain.exponentialRampToValueAtTime(0.0001, st + d);
        o.connect(g);
        g.connect(out);
        o.start(st);
        o.stop(st + d + 0.05);
      };
      tone(740, t, 0.1, 0.8); // click
      tone(1108, t + 0.12, 0.22, 0.8); // confirm
      tone(370, t + 0.12, 0.22, 0.3); // low body
    } catch (e) {
      /* audio unavailable — stay silent */
    }
  }

  /* ---------- quote form ---------- */
  const form = $("#quoteForm");
  if (form) {
    const sendBtn = $("#sendBtn"),
      btnLabel = $("#btnLabel"),
      sentPanel = $("#sentPanel"),
      toast = $("#toast"),
      toastRef = $("#toastRef");
    let busy = false,
      toastTimer = null;
    const req = [
      ["#fName", (v) => v.trim()],
      ["#fCo", (v) => v.trim()],
      ["#fMail", (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())],
      ["#fType", (v) => !!v],
    ];
    req.forEach(([sel]) => {
      const el = $(sel);
      el.addEventListener("input", () =>
        el.closest(".fld").classList.remove("err"),
      );
      el.addEventListener("change", () =>
        el.closest(".fld").classList.remove("err"),
      );
    });
    
    // Cambiamos la función a 'async' para poder esperar la respuesta del servidor
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (busy) return;
      let ok = true;
      req.forEach(([sel, test]) => {
        const el = $(sel),
          bad = !test(el.value);
        el.closest(".fld").classList.toggle("err", bad);
        if (bad) ok = false;
      });
      if (!ok) return;
      
      busy = true;
      sendBtn.disabled = true;
      btnLabel.textContent = "Sending…";

      try {
                // Enviar datos de forma segura a nuestra API en Vercel
        const response = await fetch('/api/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: $("#fName").value,
            company: $("#fCo").value,
            email: $("#fMail").value,
            type: $("#fType").value,
            size: $("#fSize").value,
            window: $("#fWin").value,
            notes: $("#fNotes").value,
            website: $("#fWebsite").value // <-- AÑADE ESTA LÍNEA
          })
        });

        console.log(response);

        // 2. Si el servidor respondió correctamente, mostramos el panel de éxito
        if (response.ok) {
          const ref = `UT-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;
          if ($("#sndOpt").checked) lockSound();
          $("#refNo").textContent = "REF " + ref;
          $("#sumAsset").textContent = (
            $("#fType").value || "asset"
          ).toLowerCase();
          form.hidden = true;
          sentPanel.hidden = false;
          toastRef.textContent = ref;
          toast.classList.add("show");
          clearTimeout(toastTimer);
          toastTimer = setTimeout(() => toast.classList.remove("show"), 4500);
        } else {
          // Si el servidor devuelve un error
          alert("There was an error sending your request. Please try again or email us directly at ralvares@utilisight.ca");
        }
      } catch (error) {
        // Si hay un error de red o no se puede conectar al servidor
        console.error("Error:", error);
        alert("A network error occurred. Please check your connection and try again.");
      } finally {
        // 3. Restaurar el botón sin importar qué pase
        busy = false;
        sendBtn.disabled = false;
        btnLabel.textContent = "Request inspection quote";
      }
    });

    $("#againBtn").addEventListener("click", () => {
      sentPanel.hidden = true;
      form.hidden = false;
      form.reset();
      $$(".fld.err", form).forEach((f) => f.classList.remove("err"));
      $("#fName").focus();
    });
  }

  /* ---------- footer year ---------- */
  const yr = $("#year");
  if (yr) yr.textContent = new Date().getFullYear();
})();