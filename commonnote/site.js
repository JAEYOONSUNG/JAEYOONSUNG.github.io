document.documentElement.classList.add("js");

(() => {
  const isKorean = document.documentElement.lang === "ko";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("[data-nav]");
  const navToggle = document.querySelector("[data-nav-toggle]");

  const closeNavigation = () => {
    if (!nav || !navToggle) return;
    nav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", navToggle.dataset.openLabel || (isKorean ? "메뉴 열기" : "Open menu"));
  };

  if (nav && navToggle) {
    navToggle.addEventListener("click", () => {
      const open = navToggle.getAttribute("aria-expanded") !== "true";
      nav.classList.toggle("is-open", open);
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? navToggle.dataset.closeLabel : navToggle.dataset.openLabel);
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

  const motionFrames = [...document.querySelectorAll("[data-motion-frame]")];
  motionFrames.forEach((frame) => {
    const video = frame.querySelector("[data-motion-video]");
    const toggle = frame.querySelector("[data-motion-toggle]");
    const toggleText = toggle?.querySelector("[data-motion-toggle-text]");
    const toggleIcon = toggle?.querySelector(".motion-control-icon");
    if (!(video instanceof HTMLVideoElement) || !(toggle instanceof HTMLButtonElement)) return;

    let userPaused = false;
    let visibilityPaused = false;
    video.muted = true;

    const updateMotionControl = () => {
      const paused = video.paused;
      toggle.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", paused ? toggle.dataset.playLabel : toggle.dataset.pauseLabel);
      if (toggleText) toggleText.textContent = paused ? toggle.dataset.playText : toggle.dataset.pauseText;
      if (toggleIcon) toggleIcon.textContent = paused ? "▶" : "Ⅱ";
    };

    const playMotion = () => {
      void video.play().catch(() => updateMotionControl());
    };

    const applyMotionPreference = () => {
      if (reducedMotion.matches) {
        video.pause();
        video.currentTime = 0;
      } else if (!userPaused && !document.hidden) {
        playMotion();
      }
      updateMotionControl();
    };

    toggle.addEventListener("click", () => {
      if (video.paused) {
        userPaused = false;
        playMotion();
      } else {
        userPaused = true;
        video.pause();
      }
      updateMotionControl();
    });
    video.addEventListener("play", updateMotionControl);
    video.addEventListener("pause", updateMotionControl);
    reducedMotion.addEventListener("change", applyMotionPreference);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden && !video.paused) {
        visibilityPaused = true;
        video.pause();
      } else if (!document.hidden && visibilityPaused && !userPaused && !reducedMotion.matches) {
        visibilityPaused = false;
        playMotion();
      }
    });
    applyMotionPreference();
  });

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
      { rootMargin: "0px 0px -7%", threshold: 0.06 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const tabs = [...gallery.querySelectorAll("[data-gallery-tab]")];
    const panels = [...gallery.querySelectorAll("[data-gallery-panel]")];

    const selectGallery = (name, moveFocus = false, updateUrl = false) => {
      tabs.forEach((tab) => {
        const selected = tab.dataset.galleryTab === name;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        if (selected && moveFocus) tab.focus();
      });
      panels.forEach((panel) => {
        const selected = panel.dataset.galleryPanel === name;
        panel.hidden = !selected;
        panel.classList.toggle("is-active", selected);
      });
      gallery.dataset.active = name;
      if (updateUrl) history.replaceState(null, "", `#gallery-${name}`);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectGallery(tab.dataset.galleryTab, false, true));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        selectGallery(tabs[nextIndex].dataset.galleryTab, true, true);
      });
    });
    const deepLinkedGallery = location.hash.match(/^#gallery-([a-z-]+)$/)?.[1];
    const initialGallery = tabs.some((tab) => tab.dataset.galleryTab === deepLinkedGallery)
      ? deepLinkedGallery
      : tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.galleryTab || tabs[0]?.dataset.galleryTab;
    selectGallery(initialGallery);
  }

  const guideSearch = document.querySelector("[data-guide-search]");
  const guideSections = [...document.querySelectorAll("[data-guide-section]")];
  const guideOutput = document.querySelector("[data-guide-output]");
  const guideEmpty = document.querySelector("[data-guide-empty]");

  if (guideSearch && guideSections.length) {
    guideSearch.value = new URLSearchParams(location.search).get("q") || "";
    const filterGuide = () => {
      const query = guideSearch.value.trim().toLocaleLowerCase(document.documentElement.lang);
      let visible = 0;
      guideSections.forEach((section) => {
        const haystack = `${section.dataset.search || ""} ${section.textContent}`.toLocaleLowerCase(document.documentElement.lang);
        const match = !query || haystack.includes(query);
        section.hidden = !match;
        if (match) visible += 1;
      });
      if (guideOutput) {
        guideOutput.textContent = query
          ? isKorean
            ? `${visible}개 설명 항목을 찾았습니다.`
            : `${visible} guide section${visible === 1 ? "" : "s"} found.`
          : isKorean
            ? `전체 ${guideSections.length}개 설명 항목`
            : `${guideSections.length} complete guide sections`;
      }
      guideEmpty?.classList.toggle("is-visible", visible === 0);
      const params = new URLSearchParams(location.search);
      if (query) params.set("q", guideSearch.value.trim());
      else params.delete("q");
      const search = params.toString();
      history.replaceState(null, "", `${location.pathname}${search ? `?${search}` : ""}${location.hash}`);
    };
    guideSearch.addEventListener("input", filterGuide);
    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        guideSearch.focus();
      }
      if (event.key === "Escape" && document.activeElement === guideSearch) {
        guideSearch.value = "";
        filterGuide();
        guideSearch.blur();
      }
    });
    filterGuide();
  }

  const guideLinks = [...document.querySelectorAll("[data-guide-link]")];
  if (guideLinks.length && guideSections.length && "IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        guideLinks.forEach((link) => link.classList.toggle("is-current", link.getAttribute("href") === `#${visible.target.id}`));
      },
      { rootMargin: "-15% 0px -70%", threshold: [0.05, 0.25, 0.5] },
    );
    guideSections.forEach((section) => sectionObserver.observe(section));
  }
})();
