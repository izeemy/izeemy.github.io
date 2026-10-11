const navToggle = document.querySelector(".nav-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-menu a");
const themeToggle = document.querySelector(".theme-toggle");
const themeColor = document.querySelector('meta[name="theme-color"]');
const themeStorageKey = "portfolio-theme";

const trackPortfolioEvent = (eventName, parameters = {}) => {
  if (typeof window.gtag !== "function") return;
  window.gtag("event", eventName, parameters);
};

document.querySelectorAll("[data-analytics-label]").forEach((link) => {
  link.addEventListener("click", () => {
    trackPortfolioEvent("portfolio_link_click", {
      link_label: link.dataset.analyticsLabel,
    });
  });
});

const updateThemeToggle = () => {
  if (!themeToggle) return;

  const isDark = document.body.classList.contains("theme-dark");
  const label = isDark ? "Switch to light mode" : "Switch to dark mode";
  themeToggle.setAttribute("aria-label", label);
  themeToggle.title = label;
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeColor?.setAttribute("content", isDark ? "#171815" : "#f4f1ea");
};

if (themeToggle) {
  try {
    if (localStorage.getItem(themeStorageKey) === "dark") {
      document.body.classList.add("theme-dark");
    }
  } catch (error) {
    console.error("Could not read the saved color theme preference.", error);
  }

  updateThemeToggle();
  themeToggle.addEventListener("click", () => {
    const isDark = document.body.classList.toggle("theme-dark");
    updateThemeToggle();
    trackPortfolioEvent("theme_toggle", { theme: isDark ? "dark" : "light" });

    try {
      localStorage.setItem(themeStorageKey, isDark ? "dark" : "light");
    } catch (error) {
      console.error("Could not save the color theme preference.", error);
    }
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      trackPortfolioEvent("navigation_click", { link_target: link.hash });
      navMenu.classList.remove("is-open");
      navToggle.classList.remove("is-active");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const revealItems = document.querySelectorAll(".reveal");
const backToTop = document.querySelector(".back-to-top");
const progressBar = document.querySelector(".scroll-progress");
const statCounters = document.querySelectorAll("[data-count]");
const detailButtons = document.querySelectorAll(".detail-toggle");
const uiProjectButtons = document.querySelectorAll(".ui-project-toggle");
const parallaxItems = document.querySelectorAll("[data-parallax]");
const projectImages = document.querySelectorAll(".work-media img");
const studyImages = document.querySelectorAll(".ui-project-detail img");
const imageViewer = document.querySelector(".image-viewer");
const imageViewerContent = imageViewer?.querySelector(".image-viewer-content");
const imageViewerCaption = imageViewer?.querySelector("figcaption");
const imageViewerClose = imageViewer?.querySelector(".image-viewer-close");
const magneticLinks = document.querySelectorAll(".hero-actions .btn, .footer-cta");
const customCursor = document.querySelector(".custom-cursor");
const hero = document.querySelector(".experimental-hero");
const heroSpotlight = hero?.querySelector(".hero-spotlight");
const heroType = hero?.querySelector(".hero-type");
const customCursorMedia = window.matchMedia(
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)"
);
const heroMotionAllowed = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (hero && heroType && heroMotionAllowed) {
  heroType.classList.add("is-scroll-shifting");
  let shiftFrame = 0;

  const updateNameShift = () => {
    shiftFrame = 0;
    const heroTop = window.scrollY + hero.getBoundingClientRect().top;
    const scrollProgress = Math.max(
      0,
      Math.min(1, (window.scrollY - heroTop) / Math.max(hero.offsetHeight, 1))
    );
    const shift = Math.min(window.innerWidth * 0.12, 160) * scrollProgress;

    heroType.style.setProperty("--name-shift-first", `${-shift}px`);
    heroType.style.setProperty("--name-shift-second", `${shift}px`);
  };

  const scheduleNameShift = () => {
    if (shiftFrame) return;
    shiftFrame = window.requestAnimationFrame(updateNameShift);
  };

  window.addEventListener("scroll", scheduleNameShift, { passive: true });
  window.addEventListener("resize", scheduleNameShift);
  updateNameShift();
}

if (
  imageViewer instanceof HTMLDialogElement &&
  imageViewerContent instanceof HTMLImageElement &&
  imageViewerCaption instanceof HTMLElement &&
  imageViewerClose instanceof HTMLButtonElement
) {
  [...projectImages, ...studyImages].forEach((image) => {
    image.tabIndex = 0;
    image.setAttribute("role", "button");
    image.setAttribute("aria-haspopup", "dialog");
    image.setAttribute("aria-label", `View larger image: ${image.alt}`);

    const openViewer = () => {
      imageViewerContent.src = image.currentSrc || image.src;
      imageViewerContent.alt = image.alt;
      imageViewerCaption.textContent = image.alt;
      imageViewer.showModal();
      imageViewerClose.focus();
    };

    image.addEventListener("click", openViewer);
    image.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openViewer();
    });
  });

  imageViewerClose.addEventListener("click", () => imageViewer.close());
  imageViewer.addEventListener("keydown", (event) => {
    if (event.key === "Escape") imageViewer.close();
  });
  imageViewer.addEventListener("click", (event) => {
    if (event.target === imageViewer) imageViewer.close();
  });
  imageViewer.addEventListener("close", () => {
    imageViewerContent.removeAttribute("src");
    imageViewerContent.alt = "";
    imageViewerCaption.textContent = "";
  });
}

if (customCursor && customCursorMedia.matches) {
  document.body.classList.add("has-custom-cursor");

  document.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;

    customCursor.style.left = `${event.clientX}px`;
    customCursor.style.top = `${event.clientY}px`;
    customCursor.classList.add("is-visible");
  });

  document.addEventListener("pointerover", (event) => {
    if (!(event.target instanceof Element)) return;

    const isInteractive = event.target.closest("a, button, [role='button']");
    customCursor.classList.toggle("is-hover", Boolean(isInteractive));
  });

  document.addEventListener("pointerout", (event) => {
    if (event.relatedTarget === null) {
      customCursor.classList.remove("is-visible", "is-hover");
      customCursor.style.left = "-100px";
      customCursor.style.top = "-100px";
    }
  });

  window.addEventListener("blur", () => {
    customCursor.classList.remove("is-visible", "is-hover");
    customCursor.style.left = "-100px";
    customCursor.style.top = "-100px";
  });
}

if (hero && heroSpotlight && heroMotionAllowed) {
  let touchHideTimer = 0;

  const moveSpotlight = (event) => {
    const bounds = hero.getBoundingClientRect();
    heroSpotlight.style.left = `${event.clientX - bounds.left}px`;
    heroSpotlight.style.top = `${event.clientY - bounds.top}px`;
    hero.classList.add("has-spotlight");
  };

  hero.addEventListener("pointermove", (event) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(touchHideTimer);
    moveSpotlight(event);
  });

  hero.addEventListener("pointerleave", (event) => {
    if (event.pointerType === "mouse") hero.classList.remove("has-spotlight");
  });

  hero.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "touch") return;
    moveSpotlight(event);
    window.clearTimeout(touchHideTimer);
    touchHideTimer = window.setTimeout(() => {
      hero.classList.remove("has-spotlight");
    }, 900);
  });
}

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

const sectionLinks = [...navLinks].map((link) => ({
  link,
  section: document.querySelector(link.getAttribute("href")),
})).filter(({ section }) => section);

if ("IntersectionObserver" in window && sectionLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const activeEntry = entries.find((entry) => entry.isIntersecting);
      if (!activeEntry) return;

      sectionLinks.forEach(({ link, section }) => {
        if (section === activeEntry.target) {
          link.setAttribute("aria-current", "location");
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    { rootMargin: "-30% 0px -60% 0px", threshold: 0 }
  );

  sectionLinks.forEach(({ section }) => sectionObserver.observe(section));
}

if (customCursorMedia.matches) {
  magneticLinks.forEach((link) => {
    link.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      const bounds = link.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      link.style.setProperty("--magnetic-x", `${x * 8}px`);
      link.style.setProperty("--magnetic-y", `${y * 8}px`);
    });

    link.addEventListener("pointerleave", () => {
      link.style.setProperty("--magnetic-x", "0px");
      link.style.setProperty("--magnetic-y", "0px");
    });
  });

  projectImages.forEach((image) => {
    image.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;

      const bounds = image.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;

      image.style.setProperty("--pointer-rotate-x", `${y * -2}deg`);
      image.style.setProperty("--pointer-rotate-y", `${x * 2}deg`);
      image.style.setProperty("--pointer-scale", "1.015");
    });

    image.addEventListener("pointerleave", () => {
      image.style.setProperty("--pointer-rotate-x", "0deg");
      image.style.setProperty("--pointer-rotate-y", "0deg");
      image.style.setProperty("--pointer-scale", "1");
    });
  });
}

if (backToTop) {
  backToTop.addEventListener("click", (event) => {
    event.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  });
}

const updateScrollProgress = () => {
  if (!progressBar) return;

  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
  progressBar.style.width = `${Math.min(progress, 100)}%`;
};

window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const animateCounter = (counter) => {
  const target = Number(counter.dataset.count || 0);
  const duration = 900;
  const startTime = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(target * eased);

    if (progress < 1) {
      requestAnimationFrame(tick);
    }
  };

  requestAnimationFrame(tick);
};

if ("IntersectionObserver" in window && statCounters.length) {
  const statObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.8 }
  );

  statCounters.forEach((counter) => statObserver.observe(counter));
} else {
  statCounters.forEach((counter) => {
    counter.textContent = counter.dataset.count || "0";
  });
}

detailButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("aria-controls");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    const isOpen = button.getAttribute("aria-expanded") === "true";
    button.setAttribute("aria-expanded", String(!isOpen));
    button.textContent = isOpen ? button.textContent.replace("Hide", "View") : button.textContent.replace("View", "Hide");
    target.hidden = isOpen;
  });
});

uiProjectButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetId = button.getAttribute("aria-controls");
    const target = targetId ? document.getElementById(targetId) : null;
    if (!target) return;

    const isOpen = button.getAttribute("aria-expanded") === "true";
    if (!isOpen) {
      trackPortfolioEvent("ui_study_open", { study_id: targetId });
    }
    uiProjectButtons.forEach((otherButton) => {
      const otherTargetId = otherButton.getAttribute("aria-controls");
      const otherTarget = otherTargetId ? document.getElementById(otherTargetId) : null;
      const isCurrentButton = otherButton === button;
      const shouldOpen = isCurrentButton && !isOpen;

      otherButton.setAttribute("aria-expanded", String(shouldOpen));
      if (otherTarget) {
        otherTarget.classList.toggle("is-open", shouldOpen);
        otherTarget.setAttribute("aria-hidden", String(!shouldOpen));
        otherTarget.inert = !shouldOpen;
      }

      const action = otherButton.querySelector(".ui-project-action");
      if (action) action.textContent = shouldOpen ? "Close study" : "View study";
    });
  });
});

if (parallaxItems.length && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const updateParallax = () => {
    parallaxItems.forEach((item) => {
      const speed = Number(item.dataset.parallax || 0.04);
      const rect = item.getBoundingClientRect();
      const distance = rect.top - window.innerHeight / 2;
      item.style.setProperty("--parallax-y", `${distance * speed * -1}px`);
    });
  };

  window.addEventListener("scroll", updateParallax, { passive: true });
  window.addEventListener("resize", updateParallax);
  updateParallax();
}
