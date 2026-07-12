/* Анимации и меню сайта. Внешние библиотеки не используются. */
(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const topbar = document.querySelector("#topbar");
  const menuToggle = document.querySelector("#menuToggle");
  const mainNav = document.querySelector("#mainNav");

  // Мобильное меню: закрывается по ссылке, Escape и при переходе на десктоп.
  const setMenu = (open) => {
    if (!menuToggle || !mainNav) return;
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
    mainNav.classList.toggle("open", open);
    document.body.classList.toggle("menu-open", open);
  };

  menuToggle?.addEventListener("click", () => setMenu(menuToggle.getAttribute("aria-expanded") !== "true"));
  mainNav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (event) => event.key === "Escape" && setMenu(false));
  window.matchMedia("(min-width: 761px)").addEventListener("change", (event) => event.matches && setMenu(false));

  // Компактная шапка после начала прокрутки.
  let scrollQueued = false;
  window.addEventListener("scroll", () => {
    if (scrollQueued) return;
    scrollQueued = true;
    requestAnimationFrame(() => {
      topbar?.classList.toggle("scrolled", window.scrollY > 40);
      scrollQueued = false;
    });
  }, { passive: true });

  // Появление блоков и подсветка активного пункта меню.
  if ("IntersectionObserver" in window && !reduceMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -35px" });
    document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));
  } else {
    document.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
  }

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      mainNav?.querySelectorAll("a").forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`));
    });
  }, { rootMargin: "-35% 0px -55%", threshold: 0 });
  document.querySelectorAll("[data-section]").forEach((section) => sectionObserver.observe(section));

  // Счетчики запускаются один раз при появлении блока статистики.
  const animateCount = (element) => {
    const target = Number(element.dataset.count);
    const startedAt = performance.now();
    const draw = (now) => {
      const progress = Math.min((now - startedAt) / 1500, 1);
      element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) requestAnimationFrame(draw);
    };
    requestAnimationFrame(draw);
  };

  const counters = document.querySelectorAll("[data-count]");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    counters.forEach((counter) => { counter.textContent = counter.dataset.count; });
  } else {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.8 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

// Текстовый scramble: каждая строка анимируется отдельно, поэтому макет не меняет ширину.
  const title = document.querySelector("[data-scramble]");
  if (title) {
    const lines = [...title.querySelectorAll("[data-scramble-line]")];
    const phrases = [
      ["CREATOR &", "DEVELOPER"],
      ["NFT & BOT", "SPECIALIST"],
      ["BACKEND", "ENGINEER"]
    ];
    const chars = "!<>-_\\/[]{}=+*^?#";
    let phraseIndex = 0;

    const setPhrase = (phrase) => {
      lines.forEach((line, index) => { line.textContent = phrase[index] || ""; });
      title.setAttribute("aria-label", phrase.join(" "));
    };

    const scrambleLine = (element, from, to) => new Promise((resolve) => {
      const length = Math.max(from.length, to.length);
      const queue = Array.from({ length }, (_, i) => ({
        from: from[i] || "",
        to: to[i] || "",
        start: Math.floor(Math.random() * 10),
        end: 14 + Math.floor(Math.random() * 18),
        char: ""
      }));
      let frame = 0;

      const draw = () => {
        let output = "";
        let complete = 0;
        queue.forEach((item) => {
          if (frame >= item.end) {
            output += item.to;
            complete++;
          } else if (frame >= item.start) {
            if (!item.char || Math.random() < .28) {
              item.char = chars[Math.floor(Math.random() * chars.length)];
            }
            output += `<span class="scramble-char">${item.char}</span>`;
          } else {
            output += item.from;
          }
        });
        element.innerHTML = output;
        frame++;
        if (complete < queue.length) requestAnimationFrame(draw);
        else resolve();
      };
      requestAnimationFrame(draw);
    });

    setPhrase(phrases[0]);

    if (!reduceMotion) {
      const runScramble = async () => {
        const current = phrases[phraseIndex];
        phraseIndex = (phraseIndex + 1) % phrases.length;
        const next = phrases[phraseIndex];
        await Promise.all(lines.map((line, i) => scrambleLine(line, current[i], next[i])));
        title.setAttribute("aria-label", next.join(" "));
        setTimeout(runScramble, 3500);
      };
      setTimeout(runScramble, 3000);
    }
  }

  // Для бесшовного marquee в HTML хранится только один набор карточек.
  document.querySelectorAll("[data-marquee]").forEach((marquee) => {
    const track = marquee.querySelector(".marquee__track");
    const group = marquee.querySelector(".marquee__group");
    if (!track || !group || track.children.length > 1) return;
    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.querySelectorAll("img").forEach((image) => image.setAttribute("alt", ""));
    track.appendChild(clone);
  });

  // Небольшой наклон героя за курсором; на touch-устройствах не запускается.
  const heroVisual = document.querySelector("#heroVisual");
  const heroFrame = heroVisual?.querySelector(".hero__image-frame");
  if (heroVisual && heroFrame && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    heroVisual.addEventListener("pointermove", (event) => {
      const rect = heroVisual.getBoundingClientRect();
      const rotateY = ((event.clientX - rect.left) / rect.width - .5) * 5;
      const rotateX = ((event.clientY - rect.top) / rect.height - .5) * -5;
      heroFrame.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(1deg)`;
    });
    heroVisual.addEventListener("pointerleave", () => { heroFrame.style.transform = "rotate(1deg)"; });
  }
})();
