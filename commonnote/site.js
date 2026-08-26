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
      { rootMargin: "0px 0px -7%", threshold: 0.06 },
    );
    revealItems.forEach((item) => revealObserver.observe(item));
  }

  const gallery = document.querySelector("[data-gallery]");
  if (gallery) {
    const tabs = [...gallery.querySelectorAll("[data-gallery-tab]")];
    const panels = [...gallery.querySelectorAll("[data-gallery-panel]")];

    const selectGallery = (name, moveFocus = false) => {
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
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => selectGallery(tab.dataset.galleryTab));
      tab.addEventListener("keydown", (event) => {
        let nextIndex = index;
        if (event.key === "ArrowRight") nextIndex = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft") nextIndex = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") nextIndex = 0;
        else if (event.key === "End") nextIndex = tabs.length - 1;
        else return;
        event.preventDefault();
        selectGallery(tabs[nextIndex].dataset.galleryTab, true);
      });
    });
    selectGallery(tabs.find((tab) => tab.getAttribute("aria-selected") === "true")?.dataset.galleryTab || "project");
  }

  const guideSearch = document.querySelector("[data-guide-search]");
  const guideSections = [...document.querySelectorAll("[data-guide-section]")];
  const guideOutput = document.querySelector("[data-guide-output]");
  const guideEmpty = document.querySelector("[data-guide-empty]");

  if (guideSearch && guideSections.length) {
    const filterGuide = () => {
      const query = guideSearch.value.trim().toLocaleLowerCase("ko");
      let visible = 0;
      guideSections.forEach((section) => {
        const match = !query || section.textContent.toLocaleLowerCase("ko").includes(query);
        section.hidden = !match;
        if (match) visible += 1;
      });
      if (guideOutput) guideOutput.textContent = query ? `${visible}개 설명 항목을 찾았습니다.` : `전체 ${guideSections.length}개 설명 항목`;
      guideEmpty?.classList.toggle("is-visible", visible === 0);
    };
    guideSearch.addEventListener("input", filterGuide);
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
