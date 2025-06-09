// This single DOMContentLoaded listener will execute once the HTML document is fully loaded.
// It's the best practice to wrap all DOM manipulation logic within this.
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Navigation Active Link Functionality ---
  const setupNavActiveLinks = () => {
    const navLinks = document.querySelectorAll(".dropdown-main-menu > li > a");
    const currentPath = window.location.pathname;

    navLinks.forEach((link) => {
      const linkPath = link.pathname;
      if (currentPath.endsWith(linkPath)) {
        link.parentElement.classList.add("active");
      }
    });
  };
  setupNavActiveLinks();

  // --- 2. Back to Top Button Functionality ---
  const setupBackToTopButton = () => {
    const backToTopButton = document.getElementById("back-to-top");
    // Ensure you target the main content column correctly
    const mainContentColumn = document.querySelector(".main-content-column");
    const footerElement = document.querySelector("footer");

    if (!backToTopButton) return;

    // Function to position the back-to-top button
    const positionBackToTopButton = () => {
      if (!mainContentColumn || !footerElement) {
        // Fallback to a fixed right if main content column or footer is not found
        backToTopButton.style.right = "20px";
        return;
      }

      const mainContentRect = mainContentColumn.getBoundingClientRect();
      const footerRect = footerElement.getBoundingClientRect();

      // Get the computed padding-right of the main content column
      const computedStyle = getComputedStyle(mainContentColumn);
      const mainContentPaddingRight = parseFloat(computedStyle.paddingRight);

      // Calculate the right edge of the *text content area* within the main column
      // This is the absolute position of the right edge of the content (excluding its padding).
      const textContentRightAbsolute =
        mainContentRect.right - mainContentPaddingRight;

      // Define the desired margin from the text content's right edge to the button's right edge
      const marginFromTextContentRight = 20; // Adjust this value as needed for desired spacing

      // Calculate the 'right' CSS value for the button
      // This value is the distance from the viewport's right edge to the button's right edge.
      const calculatedRight =
        window.innerWidth -
        textContentRightAbsolute +
        marginFromTextContentRight;

      backToTopButton.style.right = `${calculatedRight}px`;

      // Dynamic vertical positioning:
      const defaultBottomMargin = 20;
      const newBottomValue = Math.max(
        defaultBottomMargin,
        window.innerHeight - footerRect.top + defaultBottomMargin
      );
      backToTopButton.style.bottom = `${newBottomValue}px`;
    };

    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    });

    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        backToTopButton.style.display = "inline-flex";
      } else {
        backToTopButton.style.display = "none";
      }
      positionBackToTopButton();
    });

    positionBackToTopButton(); // Initial call
    window.addEventListener("resize", positionBackToTopButton); // Recalculate on resize
  };
  setupBackToTopButton();

  // --- 3. Table of Contents Active Link on Scroll & Click ---
  const setupTocActiveLinks = () => {
    const sections = document.querySelectorAll(".main-content-column section");
    const tocLinks = document.querySelectorAll(".toc ul li a");
    const tocMainSectionSpan = document.querySelector(
      ".toc ul li.main-section span"
    );
    const mainTocLinks = document.querySelectorAll(".toc .main-section > a");

    if (sections.length === 0 || tocLinks.length === 0) return;

    const updateActiveTocLink = () => {
      let currentActiveSectionId = null;

      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom > 100) {
          currentActiveSectionId = section.id;
          break;
        }
      }

      if (
        !currentActiveSectionId &&
        window.scrollY < 100 &&
        sections.length > 0
      ) {
        currentActiveSectionId = sections[0].id;
      }

      tocLinks.forEach((link) => {
        link.classList.remove("active-toc-link");
      });
      if (tocMainSectionSpan) {
        tocMainSectionSpan.classList.remove("active-toc-link");
      }
      document.querySelectorAll(".sub-toc").forEach((subToc) => {
        subToc.classList.remove("expanded");
      });

      if (currentActiveSectionId) {
        const correspondingLink = document.querySelector(
          `.toc ul li a[href="#${currentActiveSectionId}"]`
        );
        if (correspondingLink) {
          correspondingLink.classList.add("active-toc-link");

          const parentSubToc = correspondingLink.closest(".sub-toc");
          if (parentSubToc) {
            parentSubToc.classList.add("expanded");
            const mainSectionParent = parentSubToc.closest(".main-section");
            if (mainSectionParent) {
              const mainLink = mainSectionParent.querySelector(
                ".toc-main-section-link"
              );
              if (mainLink) {
                mainLink.classList.add("active-toc-link");
              }
            }
          } else {
            const directSubToc = correspondingLink.nextElementSibling;
            if (directSubToc && directSubToc.classList.contains("sub-toc")) {
              directSubToc.classList.add("expanded");
            }
          }
        } else if (
          tocMainSectionSpan &&
          tocMainSectionSpan
            .closest(".main-section")
            ?.querySelector("a")
            ?.getAttribute("href") === `#${currentActiveSectionId}`
        ) {
          tocMainSectionSpan.classList.add("active-toc-link");
          const directSubToc = tocMainSectionSpan.nextElementSibling;
          if (directSubToc && directSubToc.classList.contains("sub-toc")) {
            directSubToc.classList.add("expanded");
          }
        }
      }
    };

    window.addEventListener("scroll", updateActiveTocLink);
    updateActiveTocLink();

    tocLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        const clickedLink = this;
        const clickedLinkParentLi = clickedLink.parentElement;
        const directSubToc = clickedLink.nextElementSibling;

        const isMainLinkWithSubToc =
          clickedLinkParentLi.classList.contains("main-section") &&
          directSubToc &&
          directSubToc.classList.contains("sub-toc");

        document
          .querySelectorAll(".sub-toc")
          .forEach((st) => st.classList.remove("expanded"));
        mainTocLinks.forEach((mtl) => mtl.classList.remove("active-toc-link"));
        tocLinks.forEach((tl) => tl.classList.remove("active-toc-link"));
        if (tocMainSectionSpan) {
          tocMainSectionSpan.classList.remove("active-toc-link");
        }

        clickedLink.classList.add("active-toc-link");

        if (!isMainLinkWithSubToc) {
          const parentSubToc = clickedLink.closest(".sub-toc");
          if (parentSubToc) {
            parentSubToc.classList.add("expanded");
            const mainSectionParent = parentSubToc.closest(".main-section");
            if (mainSectionParent) {
              const mainLink = mainSectionParent.querySelector(
                ".toc-main-section-link"
              );
              if (mainLink) {
                mainLink.classList.add("active-toc-link");
              }
            }
          }
        }
      });
    });
  };
  setupTocActiveLinks();

  // --- 4. Accordion Functionality ---
  const setupAccordions = () => {
    const accordions = document.getElementsByClassName("accordion");
    Array.from(accordions).forEach((accordion) => {
      accordion.addEventListener("click", function () {
        this.classList.toggle("active");
        const panel = this.nextElementSibling;
        if (panel.style.maxHeight) {
          panel.style.maxHeight = null;
        } else {
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  };
  setupAccordions();

  // --- 5. Cursor Hover Over Slider Functionality ---
  const setupSliderIndicator = () => {
    const slider = document.getElementById("slider");
    const sliderIndicator = document.getElementById("sliderIndicator");

    if (!slider || !sliderIndicator) return;

    const hideIndicator = () => {
      sliderIndicator.classList.add("hidden");
    };

    slider.addEventListener("input", hideIndicator);
    slider.addEventListener("mousedown", hideIndicator);
    slider.addEventListener("touchstart", hideIndicator);
    slider.addEventListener("focus", hideIndicator);
  };
  setupSliderIndicator();
});
