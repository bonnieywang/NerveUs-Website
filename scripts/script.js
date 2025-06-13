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
    const sections = document.querySelectorAll(
      ".main-content-column section, .main-content-column h1[id]"
    ); // Include H1s that act as section starts
    const tocLinks = document.querySelectorAll(".toc ul li a"); // All TOC links
    const mainTocLinks = document.querySelectorAll(".toc .main-section > a"); // Only the main section links for toggling

    if (sections.length === 0 || tocLinks.length === 0) return;

    const updateActiveTocLink = () => {
      let currentActiveSectionId = null;
      let lastVisibleSectionId = null; // Track the lowest section visible for better accuracy

      // Find the most prominent section in view
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = sections[i];
        const rect = section.getBoundingClientRect();

        // If the section is at least partially in view
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          lastVisibleSectionId = section.id; // Keep track of the last visible section
          // Prioritize sections that are crossing the top threshold
          if (rect.top <= 100) {
            // Section's top is near or above the viewport top
            currentActiveSectionId = section.id;
            break; // Found the primary active section
          }
        }
      }

      // Fallback: If no section crosses the top threshold, use the last visible one
      if (!currentActiveSectionId && lastVisibleSectionId) {
        currentActiveSectionId = lastVisibleSectionId;
      }
      // If still no active section and at the very top, default to the first section
      if (
        !currentActiveSectionId &&
        window.scrollY < 10 &&
        sections.length > 0
      ) {
        currentActiveSectionId = sections[0].id;
      }

      // Reset all active classes and close all sub-TOCs initially for a clean state
      tocLinks.forEach((link) => link.classList.remove("active-toc-link"));
      mainTocLinks.forEach((link) => link.classList.remove("active-toc-link")); // Ensure main links are also reset

      document.querySelectorAll(".sub-toc").forEach((subToc) => {
        // ONLY collapse if it's not the parent of the currently active section.
        // This is the key change to prevent flickering.
        // We need to check if any child of this sub-toc is the active section.
        const hasActiveChild = subToc.querySelector(
          `a[href="#${currentActiveSectionId}"]`
        );
        if (!hasActiveChild) {
          subToc.classList.remove("expanded");
        }
      });

      if (currentActiveSectionId) {
        const correspondingLink = document.querySelector(
          `.toc ul li a[href="#${currentActiveSectionId}"]`
        );

        if (correspondingLink) {
          correspondingLink.classList.add("active-toc-link");

          const parentSubToc = correspondingLink.closest(".sub-toc");
          if (parentSubToc) {
            parentSubToc.classList.add("expanded"); // Ensure parent is expanded
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
            // If it's a main section link itself (e.g., "Your Care Team")
            const mainSectionParent =
              correspondingLink.closest(".main-section");
            if (mainSectionParent) {
              const subTocDirect = mainSectionParent.querySelector(".sub-toc");
              if (subTocDirect) {
                subTocDirect.classList.add("expanded"); // Ensure its direct sub-toc is expanded
              }
            }
          }
        }
      }
    };

    // Add a slight debounce to the scroll listener for performance and smoother updates
    let scrollTimeout;
    window.addEventListener("scroll", () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(updateActiveTocLink, 50); // Adjust debounce time if needed
    });

    updateActiveTocLink(); // Initial call on page load

    // Click listener for TOC links
    tocLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default hash jump to handle scroll smoothly

        const clickedLink = this;
        const targetId = clickedLink.getAttribute("href").substring(1);
        const targetSection = document.getElementById(targetId);

        if (targetSection) {
          window.scrollTo({
            top: targetSection.offsetTop - 80, // Adjust offset as needed for fixed header
            behavior: "smooth",
          });

          // Manually update active class immediately after click
          tocLinks.forEach((l) => l.classList.remove("active-toc-link"));
          mainTocLinks.forEach((l) => l.classList.remove("active-toc-link"));

          // If a main section link is clicked, toggle its sub-toc,
          // otherwise ensure parent sub-toc is expanded.
          const clickedLinkParentLi = clickedLink.parentElement;
          const directSubToc = clickedLink.nextElementSibling; // checks if it's a direct ul.sub-toc

          // Collapse all sub-TOCs except the one being opened/clicked into
          document.querySelectorAll(".sub-toc").forEach((st) => {
            if (st !== directSubToc && !st.contains(clickedLink)) {
              // Don't collapse if it's the direct sub-toc or an ancestor
              st.classList.remove("expanded");
            }
          });

          if (
            clickedLinkParentLi.classList.contains("main-section") &&
            directSubToc &&
            directSubToc.classList.contains("sub-toc")
          ) {
            // This is a main section link that toggles a sub-toc
            directSubToc.classList.toggle("expanded");
            // The main link itself should be active
            clickedLink.classList.add("active-toc-link");
          } else {
            // This is a sub-section link
            clickedLink.classList.add("active-toc-link");
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
        }
      });
    });

    // Initial state of TOC for "Your Care Team" - assume it should be expanded on load
    // This needs to be done *after* the DOM is ready but potentially before the first scroll update
    // Find the "Your Care Team" main section and its sub-toc
    const yourCareTeamMainLink = document.querySelector(
      '.toc a[href="#your-care-team"]'
    );
    if (yourCareTeamMainLink) {
      const yourCareTeamSubToc = yourCareTeamMainLink.nextElementSibling;
      if (
        yourCareTeamSubToc &&
        yourCareTeamSubToc.classList.contains("sub-toc")
      ) {
        yourCareTeamSubToc.classList.add("expanded");
        yourCareTeamMainLink.classList.add("active-toc-link"); // Also set it active
      }
    }
  };
  setupTocActiveLinks(); // Call this function to set up listeners and initial state

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
