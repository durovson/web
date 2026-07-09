document.addEventListener('DOMContentLoaded', () => {
  const heroTitle = document.querySelector('[data-scramble]');
  if (heroTitle) {
    const phrases = ['CREATOR & DEVELOPER', 'NFT & BOT SPECIALIST', 'UI / UX ENGINEER'];
    let index = 0;
    setInterval(() => {
      heroTitle.textContent = phrases[index];
      index = (index + 1) % phrases.length;
    }, 2600);
  }

  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => observer.observe(el));

  const marquee = document.querySelector('.marquee__track');
  if (marquee) {
    const clone = marquee.innerHTML;
    marquee.innerHTML = clone + clone;
  }
});
