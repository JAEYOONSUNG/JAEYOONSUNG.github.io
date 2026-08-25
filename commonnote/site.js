document.documentElement.classList.add("js");

(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  const closeNavigation = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "메뉴 열기");
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "메뉴 닫기" : "메뉴 열기");
    });

    nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeNavigation));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeNavigation();
    });
    document.addEventListener("pointerdown", (event) => {
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target) && !navToggle.contains(event.target)) closeNavigation();
    });
  }

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 18);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const revealItems = [...document.querySelectorAll("[data-reveal]")];
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -7%", threshold: 0.08 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const journey = document.querySelector("[data-journey]");
  const journeyButtons = [...document.querySelectorAll("[data-journey-button]")];
  const journeyLabel = document.querySelector("[data-journey-label]");
  const journeyLabels = [
    "관찰을 선택합니다.",
    "원본을 유지한 채 근거로 연결합니다.",
    "담당자와 기한이 있는 다음 할 일이 열립니다.",
  ];
  let journeyScene = 0;
  let journeyTimer;
  let journeyVisible = false;

  const setJourneyScene = (scene) => {
    if (!journey) return;
    journeyScene = ((scene % journeyLabels.length) + journeyLabels.length) % journeyLabels.length;
    journey.dataset.scene = String(journeyScene);
    if (journeyLabel) journeyLabel.textContent = journeyLabels[journeyScene];
    journeyButtons.forEach((button, index) => {
      const active = index === journeyScene;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const stopJourney = () => window.clearInterval(journeyTimer);
  const startJourney = () => {
    stopJourney();
    if (!reducedMotion.matches && journeyVisible && !document.hidden) {
      journeyTimer = window.setInterval(() => setJourneyScene(journeyScene + 1), 3600);
    }
  };

  journeyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      setJourneyScene(Number(button.dataset.journeyButton));
      startJourney();
    });
  });

  if (journey && "IntersectionObserver" in window) {
    const journeyObserver = new IntersectionObserver(
      ([entry]) => {
        journeyVisible = entry.isIntersecting;
        startJourney();
      },
      { threshold: 0.14 },
    );
    journeyObserver.observe(journey);
  }

  const updateMotionPreference = () => {
    if (reducedMotion.matches) {
      stopJourney();
      setJourneyScene(0);
    } else {
      startJourney();
    }
  };

  reducedMotion.addEventListener?.("change", updateMotionPreference);
  document.addEventListener("visibilitychange", startJourney);
  setJourneyScene(0);
})();
