/* ==========================================
   CHESTER PORTFOLIO
   script.js
========================================== */

(() => {
  "use strict";

  /* ==========================
      TEXT SCRAMBLE
   ========================== */

  class TextScramble {

    constructor(el) {
      this.el = el;
      this.chars = "!<>-_\\/[]{}—=+*^?#_";
      this.frame = 0;
      this.queue = [];
      this.frameRequest = null;
      this.resolve = null;
    }

    setText(newText) {

      const oldText = this.el.innerText;

      const length = Math.max(oldText.length, newText.length);

      const promise = new Promise(resolve => this.resolve = resolve);

      this.queue = [];

      for (let i = 0; i < length; i++) {

        const from = oldText[i] || "";
        const to = newText[i] || "";

        const start = Math.floor(Math.random() * 40);
        const end = start + Math.floor(Math.random() * 40);

        this.queue.push({
          from,
          to,
          start,
          end
        });

      }

      cancelAnimationFrame(this.frameRequest);

      this.frame = 0;

      this.update();

      return promise;

    }

    update() {

      let output = "";
      let complete = 0;

      for (let i = 0; i < this.queue.length; i++) {

        let {
          from,
          to,
          start,
          end,
          char
        } = this.queue[i];

        if (this.frame >= end) {

          complete++;
          output += to;

        }

        else if (this.frame >= start) {

          if (!char || Math.random() < 0.28) {

            char = this.chars[Math.floor(Math.random() * this.chars.length)];
            this.queue[i].char = char;

          }

          output += `<span class="scramble-char">${char}</span>`;

        }

        else {

          output += from;

        }

      }

      this.el.innerHTML = output;

      if (complete === this.queue.length) {

        this.resolve();

      }

      else {

        this.frameRequest = requestAnimationFrame(() => this.update());

        this.frame++;

      }

    }

  }


  const heroTitle = document.querySelector("[data-scramble]");

  if (heroTitle) {

    const fx = new TextScramble(heroTitle);

    const phrases = [

      "CREATOR & BUILDER",
      "NFT & BOT",
      "UI/UX ENGINEER"

    ];

    let counter = 0;

    const next = () => {

      fx.setText(phrases[counter]).then(() => {

        setTimeout(next, 2600);

      });

      counter = (counter + 1) % phrases.length;

    }

    setTimeout(next, 500);

  }


  /* ==========================
        SCROLL REVEAL
   ========================== */

  const revealObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (entry.isIntersecting) {

        entry.target.classList.add("visible");

        revealObserver.unobserve(entry.target);

      }

    });

  }, {

    threshold: 0.15,
    rootMargin: "0px 0px -50px"

  });

  document.querySelectorAll(".reveal").forEach(el => {

    revealObserver.observe(el);

  });


  /* ==========================
       COUNTERS
   ========================== */

  function animateCounter(el, target) {

    const duration = 1800;

    const start = performance.now();

    function frame(time) {

      const progress = Math.min((time - start) / duration, 1);

      const ease = 1 - Math.pow(1 - progress, 4);

      el.textContent = Math.round(target * ease);

      if (progress < 1) {

        requestAnimationFrame(frame);

      }

    }

    requestAnimationFrame(frame);

  }

  const counterObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

      if (!entry.isIntersecting) return;

      animateCounter(

        entry.target,

        Number(entry.target.dataset.count)

      );

      counterObserver.unobserve(entry.target);

    });

  }, {

    threshold: 0.5

  });

  document.querySelectorAll("[data-count]").forEach(el => {

    counterObserver.observe(el);

  });


  /* ==========================
      NAVBAR
   ========================== */

  const nav = document.querySelector(".topbar");

  window.addEventListener("scroll", () => {

    if (!nav) return;

    nav.classList.toggle(

      "scrolled",

      window.scrollY > 50

    );

  });


  /* ==========================
      SMOOTH SCROLL
   ========================== */

  document.querySelectorAll('a[href^="#"]').forEach(link => {

    link.addEventListener("click", e => {

      const target = document.querySelector(

        link.getAttribute("href")

      );

      if (!target) return;

      e.preventDefault();

      window.scrollTo({

        top: target.offsetTop - 80,

        behavior: "smooth"

      });

    });

  });


  /* ==========================
      MARQUEE
   ========================== */

  const marquee = document.querySelector(".marquee__track");

  if (marquee) {

    // Если в HTML карточки ещё не продублированы —
    // автоматически продублируем один раз

    if (!marquee.dataset.ready) {

      marquee.innerHTML += marquee.innerHTML;

      marquee.dataset.ready = "true";

    }

  }


  /* ==========================
      HERO PARALLAX
   ========================== */

  const heroImage = document.querySelector(".hero__visual img");

  if (heroImage) {

    window.addEventListener("mousemove", e => {

      const x = (e.clientX / window.innerWidth - 0.5) * 16;

      const y = (e.clientY / window.innerHeight - 0.5) * 16;

      heroImage.style.transform =
        `translate(${x}px, ${y}px)`;

    });

  }

})();
