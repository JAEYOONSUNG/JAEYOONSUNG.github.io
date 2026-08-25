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

  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 12);
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
      { rootMargin: "0px 0px -8%", threshold: 0.08 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const kineticWord = document.querySelector("[data-kinetic-word]");
  const kineticParticle = document.querySelector("[data-kinetic-particle]");
  const kineticWords = [
    ["근거", "로"],
    ["결정", "으로"],
    ["실행", "으로"],
  ];
  let kineticIndex = 0;
  let kineticTimer;

  const advanceKineticWord = () => {
    if (!kineticWord || reducedMotion.matches || document.hidden) return;
    kineticWord.classList.remove("is-settling");
    kineticWord.classList.add("is-changing");
    window.setTimeout(() => {
      kineticIndex = (kineticIndex + 1) % kineticWords.length;
      const [word, particle] = kineticWords[kineticIndex];
      kineticWord.textContent = word;
      if (kineticParticle) kineticParticle.textContent = particle;
      kineticWord.classList.remove("is-changing");
      kineticWord.classList.add("is-settling");
    }, 150);
  };

  const startKineticWord = () => {
    window.clearInterval(kineticTimer);
    if (!reducedMotion.matches) kineticTimer = window.setInterval(advanceKineticWord, 2600);
  };

  const motionLab = document.querySelector("[data-motion-lab]");
  const sceneTiles = [...document.querySelectorAll("[data-scene-tile]")];
  const sceneCount = document.querySelector("[data-scene-count]");
  const sceneLabel = document.querySelector("[data-scene-label]");
  const sceneProgress = document.querySelector("[data-scene-progress]");
  const sceneLabels = [
    "관찰을 기록하는 순간",
    "근거와 판단을 연결하고",
    "담당자와 다음 일을 정한 뒤",
    "실행할 시간까지 이어집니다",
  ];
  let sceneIndex = 0;
  let sceneTimer;
  let motionVisible = true;

  const showScene = (nextIndex) => {
    if (!sceneTiles.length) return;
    sceneIndex = nextIndex % sceneTiles.length;
    sceneTiles.forEach((tile, index) => tile.classList.toggle("is-active", index === sceneIndex));
    if (sceneCount) sceneCount.textContent = `${String(sceneIndex + 1).padStart(2, "0")} / 04`;
    if (sceneLabel) sceneLabel.textContent = sceneLabels[sceneIndex];
    if (sceneProgress) {
      sceneProgress.style.animation = "none";
      void sceneProgress.offsetWidth;
      sceneProgress.style.animation = "";
    }
  };

  const stopSceneRotation = () => window.clearInterval(sceneTimer);
  const startSceneRotation = () => {
    stopSceneRotation();
    if (!reducedMotion.matches && motionVisible && !document.hidden) {
      sceneTimer = window.setInterval(() => showScene(sceneIndex + 1), 3200);
    }
  };

  if (motionLab && "IntersectionObserver" in window) {
    const motionObserver = new IntersectionObserver(
      ([entry]) => {
        motionVisible = entry.isIntersecting;
        motionLab.classList.toggle("is-paused", !motionVisible);
        startSceneRotation();
      },
      { threshold: 0.08 },
    );
    motionObserver.observe(motionLab);
  }

  const flowSteps = [...document.querySelectorAll("[data-flow-step]")];
  const flowKicker = document.querySelector("[data-flow-kicker]");
  const flowValue = document.querySelector("[data-flow-value]");
  const flowMeta = document.querySelector("[data-flow-meta]");
  const flowInstrument = document.querySelector(".flow-instrument");
  const flowFrames = [
    ["Observation", "37°C / activity stable", "notebook · Collagenase"],
    ["Evidence", "assay #24 / linked", "source · observation 09:41"],
    ["Decision", "3-day culture / confirmed", "decision log · JY + DW"],
    ["Action", "scale-up / scheduled", "task + calendar · Aug 26"],
  ];
  let flowIndex = 0;
  let flowTimer;
  let flowVisible = false;

  const showFlow = (nextIndex) => {
    if (!flowSteps.length || !flowValue) return;
    flowIndex = nextIndex % flowSteps.length;
    flowSteps.forEach((step, index) => step.classList.toggle("is-current", index === flowIndex));
    flowValue.classList.add("is-changing");
    window.setTimeout(() => {
      const [kicker, value, meta] = flowFrames[flowIndex];
      if (flowKicker) flowKicker.textContent = kicker;
      flowValue.textContent = value;
      if (flowMeta) flowMeta.textContent = meta;
      flowValue.classList.remove("is-changing");
    }, reducedMotion.matches ? 0 : 180);
  };

  const startFlowRotation = () => {
    window.clearInterval(flowTimer);
    if (!reducedMotion.matches && flowVisible && !document.hidden) {
      flowTimer = window.setInterval(() => showFlow(flowIndex + 1), 3600);
    }
  };

  if (flowInstrument && "IntersectionObserver" in window) {
    const flowObserver = new IntersectionObserver(
      ([entry]) => {
        flowVisible = entry.isIntersecting;
        startFlowRotation();
      },
      { threshold: 0.12 },
    );
    flowObserver.observe(flowInstrument);
  }

  document.addEventListener("visibilitychange", () => {
    startKineticWord();
    startSceneRotation();
    startFlowRotation();
  });

  const handleMotionPreference = () => {
    if (reducedMotion.matches) {
      window.clearInterval(kineticTimer);
      stopSceneRotation();
      window.clearInterval(flowTimer);
      showScene(0);
      showFlow(0);
      motionLab?.classList.remove("is-paused");
    } else {
      startKineticWord();
      startSceneRotation();
      startFlowRotation();
    }
  };

  reducedMotion.addEventListener?.("change", handleMotionPreference);
  startKineticWord();
  startSceneRotation();
})();
