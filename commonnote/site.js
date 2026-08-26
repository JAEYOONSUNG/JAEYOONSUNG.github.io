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

  const macClocks = [...document.querySelectorAll("[data-mac-clock]")];
  if (macClocks.length) {
    const clockFormatter = new Intl.DateTimeFormat(isKorean ? "ko-KR" : "en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const updateMacClocks = () => {
      const value = clockFormatter.format(new Date()).replaceAll(",", "");
      macClocks.forEach((clock) => { clock.textContent = value; });
    };
    updateMacClocks();
    window.setInterval(updateMacClocks, 30_000);
  }

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

  const livingSymbols = [...document.querySelectorAll("[data-motion-symbol]")];
  if (livingSymbols.length) {
    const settleTimers = new WeakMap();
    const markEntered = (symbol) => {
      symbol.classList.add("is-in-view");
      symbol.dataset.motionState = reducedMotion.matches ? "rest" : "entering";
      window.clearTimeout(settleTimers.get(symbol));
      settleTimers.set(symbol, window.setTimeout(() => {
        symbol.dataset.motionState = "rest";
      }, reducedMotion.matches ? 0 : 980));
    };
    const replaySymbol = (symbol) => {
      if (reducedMotion.matches || document.hidden || !symbol.classList.contains("is-in-view")) return;
      symbol.classList.remove("is-interacting");
      void symbol.offsetWidth;
      symbol.classList.add("is-interacting");
      symbol.dataset.motionState = "active";
      symbol.dataset.motionPlays = String(Number(symbol.dataset.motionPlays || "0") + 1);
      window.clearTimeout(settleTimers.get(symbol));
      settleTimers.set(symbol, window.setTimeout(() => {
        symbol.classList.remove("is-interacting");
        symbol.dataset.motionState = "rest";
      }, 980));
    };

    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      livingSymbols.forEach(markEntered);
    } else {
      const livingObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            markEntered(entry.target);
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: "8% 0px", threshold: 0.08 },
      );
      livingSymbols.forEach((symbol) => livingObserver.observe(symbol));
    }

    livingSymbols.forEach((symbol) => {
      const surface = symbol.closest("article") || symbol;
      surface.addEventListener("pointerenter", () => replaySymbol(symbol));
      surface.addEventListener("focusin", () => replaySymbol(symbol));
    });
    reducedMotion.addEventListener("change", () => {
      livingSymbols.forEach((symbol) => {
        symbol.classList.remove("is-interacting");
        if (!symbol.classList.contains("is-in-view")) markEntered(symbol);
        symbol.dataset.motionState = "rest";
      });
    });
  }

  const fineMotionSymbols = [...document.querySelectorAll("[data-fine-motion]")];
  if (fineMotionSymbols.length) {
    const visibleSymbols = new WeakSet();
    const syncMotionSymbols = () => {
      const canRun = !reducedMotion.matches && !document.hidden;
      fineMotionSymbols.forEach((symbol) => {
        symbol.classList.toggle("is-in-view", canRun && visibleSymbols.has(symbol));
      });
    };

    if ("IntersectionObserver" in window) {
      const symbolObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) visibleSymbols.add(entry.target);
            else visibleSymbols.delete(entry.target);
          });
          syncMotionSymbols();
        },
        { rootMargin: "8% 0px", threshold: 0.04 },
      );
      fineMotionSymbols.forEach((symbol) => symbolObserver.observe(symbol));
    } else {
      fineMotionSymbols.forEach((symbol) => visibleSymbols.add(symbol));
    }

    reducedMotion.addEventListener("change", syncMotionSymbols);
    document.addEventListener("visibilitychange", syncMotionSymbols);
    syncMotionSymbols();
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const tabs = [...gallery.querySelectorAll("[data-gallery-tab]")];
    const panels = [...gallery.querySelectorAll("[data-gallery-panel]")];
    const scrubber = gallery.querySelector("[data-gallery-scrubber]");
    const scrubberOutput = gallery.querySelector("[data-gallery-output]");
    const counter = gallery.querySelector("[data-gallery-counter]");
    const galleryTabs = gallery.querySelector(".gallery-tabs");
    const lastIndex = Math.max(1, tabs.length - 1);
    let interactionLockUntil = 0;
    const warmGalleryFrames = () => panels.forEach((panel) => {
      const image = panel.querySelector("img");
      if (image instanceof HTMLImageElement) image.loading = "eager";
    });

    if ("IntersectionObserver" in window) {
      const preloadObserver = new IntersectionObserver(
        (entries, observer) => {
          if (!entries.some((entry) => entry.isIntersecting)) return;
          warmGalleryFrames();
          observer.disconnect();
        },
        { rootMargin: "900px 0px", threshold: 0 },
      );
      preloadObserver.observe(gallery);
    } else {
      warmGalleryFrames();
    }

    const updateGalleryProgress = (position) => {
      const bounded = Math.min(lastIndex, Math.max(0, position));
      const progress = bounded / lastIndex;
      galleryTabs?.style.setProperty("--workflow-progress", String(progress));
      if (scrubber instanceof HTMLInputElement) {
        scrubber.value = String(bounded);
        scrubber.style.setProperty("--scrub-progress", `${progress * 100}%`);
      }
    };

    const selectGallery = (name, moveFocus = false, updateUrl = false, syncProgress = true) => {
      const selectedIndex = Math.max(0, tabs.findIndex((tab) => tab.dataset.galleryTab === name));
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
      if (scrubber instanceof HTMLInputElement) {
        scrubber.setAttribute("aria-valuetext", tabs[selectedIndex]?.querySelector("b")?.textContent?.trim() || name);
      }
      if (syncProgress) updateGalleryProgress(selectedIndex);
      if (scrubberOutput) scrubberOutput.textContent = tabs[selectedIndex]?.querySelector("b")?.textContent?.trim() || name;
      if (counter) counter.textContent = `${String(selectedIndex + 1).padStart(2, "0")} / ${String(tabs.length).padStart(2, "0")}`;
      if (updateUrl) history.replaceState(null, "", `#gallery-${name}`);
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => {
        interactionLockUntil = performance.now() + 760;
        selectGallery(tab.dataset.galleryTab, false, true);
      });
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        interactionLockUntil = performance.now() + 760;
        selectGallery(tabs[nextIndex].dataset.galleryTab, true, true);
      });
    });
    if (scrubber instanceof HTMLInputElement) {
      scrubber.addEventListener("input", () => {
        interactionLockUntil = performance.now() + 760;
        const position = Math.min(lastIndex, Math.max(0, Number(scrubber.value)));
        const next = tabs[Math.round(position)];
        updateGalleryProgress(position);
        if (next && gallery.dataset.active !== next.dataset.galleryTab) {
          selectGallery(next.dataset.galleryTab, false, true, false);
        }
      });
      scrubber.addEventListener("change", () => {
        const next = tabs[Math.round(Number(scrubber.value))];
        if (next) selectGallery(next.dataset.galleryTab, false, true);
      });
    }
    const deepLinkedGallery = location.hash.match(/^#gallery-([a-z-]+)$/)?.[1];
    const initialGallery = tabs.some((tab) => tab.dataset.galleryTab === deepLinkedGallery)
      ? deepLinkedGallery
      : tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.galleryTab || tabs[0]?.dataset.galleryTab;
    selectGallery(initialGallery);

    const desktopWorkflow = window.matchMedia("(min-width: 821px)");
    let workflowFrame = 0;
    const updateWorkflowFromScroll = () => {
      workflowFrame = 0;
      if (!desktopWorkflow.matches || performance.now() < interactionLockUntil) return;
      const bounds = gallery.getBoundingClientRect();
      if (bounds.bottom < innerHeight * 0.18 || bounds.top > innerHeight * 0.84) return;
      const center = innerHeight * 0.5;
      const centers = tabs.map((tab) => {
        const { top, height } = tab.getBoundingClientRect();
        return top + height / 2;
      });
      let position = 0;
      if (center >= centers[centers.length - 1]) position = lastIndex;
      else if (center > centers[0]) {
        const segment = centers.findIndex((value, index) => index < lastIndex && center <= centers[index + 1]);
        const start = Math.max(0, segment);
        position = start + (center - centers[start]) / Math.max(1, centers[start + 1] - centers[start]);
      }
      updateGalleryProgress(position);
      const next = tabs[Math.round(position)];
      if (next && gallery.dataset.active !== next.dataset.galleryTab) {
        selectGallery(next.dataset.galleryTab, false, false, false);
      }
    };
    const scheduleWorkflowUpdate = () => {
      if (workflowFrame) return;
      workflowFrame = requestAnimationFrame(updateWorkflowFromScroll);
    };
    addEventListener("scroll", scheduleWorkflowUpdate, { passive: true });
    addEventListener("resize", scheduleWorkflowUpdate, { passive: true });
    scheduleWorkflowUpdate();
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
