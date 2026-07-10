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

// Текстовый scramble (Постоянная анимация)
  const title = document.querySelector("[data-scramble]");
  if (title) {
    // Здесь вы можете добавить или изменить фразы, которые будут меняться
    const phrases = [
      "CREATOR &\nDEVELOPER",
      "NFT & BOT\nSPECIALIST",
      "BACKEND\nENGINEER"
    ];
    let currentPhrase = phrases[0];
    let phraseIndex = 0;
    const chars = "!<>-_\\/[]{}=+*^?#";

    const runScramble = () => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      const nextPhrase = phrases[phraseIndex];
      const maxLength = Math.max(currentPhrase.length, nextPhrase.length);
      const queue = [];

      for (let i = 0; i < maxLength; i++) {
        const from = currentPhrase[i] || "";
        const to = nextPhrase[i] || "";
        const start = Math.floor(Math.random() * 15);
        const end = start + Math.floor(Math.random() * 25) + 10;
        queue.push({ from, to, start, end, char: "" });
      }

      let frame = 0;
      const scramble = () => {
        let output = "";
        let complete = 0;
        queue.forEach((item) => {
          if (item.to === "\n" && frame >= item.end) { output += "<br>"; complete += 1; return; }
          if (frame >= item.end) { output += (item.to === "\n" ? "<br>" : item.to); complete += 1; return; }
          if (frame >= item.start) {
            if (!item.char || Math.random() < 0.28) item.char = chars[Math.floor(Math.random() * chars.length)];
            output += `<span class="scramble-char">${item.char}</span>`;
            return;
          }
          output += (item.from === "\n" ? "<br>" : item.from);
        });

        title.innerHTML = output;
        frame++;
        if (complete < queue.length) {
          requestAnimationFrame(scramble);
        } else {
          currentPhrase = nextPhrase;
          // Время ожидания до следующей смены текста (в миллисекундах)
          setTimeout(runScramble, 3500); 
        }
      };
      requestAnimationFrame(scramble);
    };

    // Запуск первой анимации через 3 секунды после загрузки
    setTimeout(runScramble, 3000); 
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
