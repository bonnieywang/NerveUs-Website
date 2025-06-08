// This single DOMContentLoaded listener will execute once the HTML document is fully loaded.
// It's the best practice to wrap all DOM manipulation logic within this.
document.addEventListener("DOMContentLoaded", () => {
  // --- 1. Navigation Active Link Functionality ---
  // Purpose: Highlights the active link in the main navigation based on the current URL.
  const setupNavActiveLinks = () => {
    const navLinks = document.querySelectorAll(".dropdown-main-menu > li > a");
    const currentPath = window.location.pathname;

    navLinks.forEach((link) => {
      const linkPath = link.pathname;
      // Use endsWith to handle both /page.html and /page
      if (currentPath.endsWith(linkPath)) {
        link.parentElement.classList.add("active");
      }
    });
  };
  setupNavActiveLinks(); // Call the function to set up nav links on load

  // --- 2. Back to Top Button Functionality ---
  // Purpose: Controls the visibility and position of the back-to-top button.
  const setupBackToTopButton = () => {
    const backToTopButton = document.getElementById("back-to-top");
    // Use optional chaining (?. ) for elements that might not exist on all pages.
    const tocElement = document.querySelector(".toc");
    const footerElement = document.querySelector("footer");

    // Only proceed if the back-to-top button exists on the page.
    if (!backToTopButton) return;

    // Function to position the back-to-top button
    const positionBackToTopButton = () => {
      // Return early if any required element for positioning is missing.
      if (!tocElement || !footerElement) {
        return;
      }

      const tocRect = tocElement.getBoundingClientRect();
      const buttonRect = backToTopButton.getBoundingClientRect();
      const footerRect = footerElement.getBoundingClientRect();

      // Horizontal centering with TOC
      const tocCenterX = tocRect.left + tocRect.width / 2;
      const buttonLeft = tocCenterX - buttonRect.width / 2;
      backToTopButton.style.left = `${buttonLeft}px`;
      backToTopButton.style.right = "auto"; // Ensure right is not conflicting

      // Dynamic vertical positioning
      const defaultBottomMargin = 20; // Desired margin from the bottom of the viewport

      const newBottomValue = Math.max(
        defaultBottomMargin,
        window.innerHeight - footerRect.top + defaultBottomMargin
      );

      backToTopButton.style.bottom = `${newBottomValue}px`;
    };

    // Event listener for click to scroll to top
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Use smooth scrolling
      });
    });

    // Show/hide the button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        backToTopButton.style.display = "inline-flex"; // Use inline-flex as per your CSS
      } else {
        backToTopButton.style.display = "none"; // Hide it
      }
      positionBackToTopButton(); // Always reposition on scroll
    });

    // Initial positioning on load
    positionBackToTopButton();
    // Reposition on window resize
    window.addEventListener("resize", positionBackToTopButton);
  };
  setupBackToTopButton(); // Call the function to set up back-to-top button on load

  // --- 3. Table of Contents Active Link on Scroll & Click ---
  // Purpose: Highlights the active link in the TOC based on scroll position and expands sub-menus on click.
  const setupTocActiveLinks = () => {
    const sections = document.querySelectorAll(".main-content-column section");
    const tocLinks = document.querySelectorAll(".toc ul li a");
    const tocMainSectionSpan = document.querySelector(
      ".toc ul li.main-section span"
    );
    const mainTocLinks = document.querySelectorAll(".toc .main-section > a");

    // Only proceed if sections or TOC links exist.
    if (sections.length === 0 || tocLinks.length === 0) return;

    // Function to update active link on scroll
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

      // --- NEW: Clear all active classes and collapse all sub-TOCs at the start ---
      // This ensures a clean state before expanding the relevant one below.
      tocLinks.forEach((link) => {
        link.classList.remove("active-toc-link");
      });
      if (tocMainSectionSpan) {
        tocMainSectionSpan.classList.remove("active-toc-link");
      }
      // CRUCIAL: Collapse all sub-TOCs first on every scroll event
      document.querySelectorAll(".sub-toc").forEach((subToc) => {
        subToc.classList.remove("expanded");
      });
      // --- END NEW ---

      if (currentActiveSectionId) {
        const correspondingLink = document.querySelector(
          `.toc ul li a[href="#${currentActiveSectionId}"]`
        );
        if (correspondingLink) {
          correspondingLink.classList.add("active-toc-link");
          // If a sub-link is active, also highlight its parent main link and expand its sub-toc
          const parentSubToc = correspondingLink.closest(".sub-toc");
          if (parentSubToc) {
            parentSubToc.classList.add("expanded"); // Make sure sub-toc is expanded
            const mainSectionParent = parentSubToc.closest(".main-section");
            if (mainSectionParent) {
              const mainSectionLink = mainSectionParent.querySelector(
                ".toc-main-section-link"
              );
              if (mainSectionLink) {
                mainSectionLink.classList.add("active-toc-link");
              }
            }
          } else {
            // If the active section is a main link (not a sub-link), check if it has a direct sub-toc
            // and expand it. This is for when main section itself is in view (e.g., #arm-injuries-section).
            const directSubToc = correspondingLink.nextElementSibling;
            if (directSubToc && directSubToc.classList.contains("sub-toc")) {
              directSubToc.classList.add("expanded");
            }
          }
        } else if (
          // This handles cases where the active section's TOC entry might be a special span
          currentActiveSectionId === "arm-injuries-section" && // Replace with actual ID if your main section is a span
          tocMainSectionSpan
        ) {
          tocMainSectionSpan.classList.add("active-toc-link");
          const directSubToc = tocMainSectionSpan.nextElementSibling;
          if (directSubToc && directSubToc.classList.contains("sub-toc")) {
            directSubToc.classList.add("expanded");
          }
        }
      }
    };

    // Listen for scroll events to update the active TOC link
    window.addEventListener("scroll", updateActiveTocLink);
    updateActiveTocLink(); // Initial call to set active link on load

    // --- NEW: Add click listener for TOC links to handle expansion/highlight ---
    tocLinks.forEach((link) => {
      link.addEventListener("click", function (event) {
        // Prevent default hash behavior if you want to control scroll with JS or ensure no jump
        // event.preventDefault(); // Keep commented out to allow page jump

        // First, clear all active states from all links
        document
          .querySelectorAll(".sub-toc")
          .forEach((st) => st.classList.remove("expanded")); // Always collapse all on click initially
        mainTocLinks.forEach((mtl) => mtl.classList.remove("active-toc-link"));
        tocLinks.forEach((tl) => tl.classList.remove("active-toc-link")); // Remove from all sub-links too

        // Add active class to the clicked link
        this.classList.add("active-toc-link");

        // If a sub-section is clicked, ensure its parent `sub-toc` is expanded and main link highlighted
        const parentSubToc = this.closest(".sub-toc");
        if (parentSubToc) {
          parentSubToc.classList.add("expanded"); // Expand the sub-TOC for the clicked sub-link
          const mainSectionParent = parentSubToc.closest(".main-section");
          if (mainSectionParent) {
            // Assuming 'toc-main-section-link' is a class on the main link element
            const mainSectionLink = mainSectionParent.querySelector(
              ".toc-main-section-link"
            );
            if (mainSectionLink) {
              mainSectionLink.classList.add("active-toc-link");
            }
          }
        } else {
          // If a main link is clicked (and it doesn't have a closest .sub-toc)
          // IMPORTANT: Removed directToggle here. Its expansion/collapse is now ONLY
          // managed by the scroll handler (`updateActiveTocLink`).
          // The page jump will trigger the scroll handler.
          // const directSubToc = this.nextElementSibling;
          // if (directSubToc && directSubToc.classList.contains("sub-toc")) {
          //   directSubToc.classList.toggle("expanded"); // <-- THIS LINE IS REMOVED
          // }
        }
      });
    });
  };
  setupTocActiveLinks(); // Call the function to set up TOC active links

  // --- 4. Accordion Functionality ---
  // Purpose: Implements expand/collapse behavior for accordion elements.
  const setupAccordions = () => {
    const accordions = document.getElementsByClassName("accordion");

    // Convert HTMLCollection to Array for easier iteration with forEach
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
  setupAccordions(); // Call the function to set up accordions

  // --- 5. Cursor Hover Over Slider Functionality ---
  // Purpose: Hides a slider indicator on user interaction.
  const setupSliderIndicator = () => {
    const slider = document.getElementById("slider");
    const sliderIndicator = document.getElementById("sliderIndicator");

    // Only proceed if both slider elements exist.
    if (!slider || !sliderIndicator) return;

    const hideIndicator = () => {
      sliderIndicator.classList.add("hidden");
    };

    slider.addEventListener("input", hideIndicator);
    slider.addEventListener("mousedown", hideIndicator);
    slider.addEventListener("touchstart", hideIndicator);
    slider.addEventListener("focus", hideIndicator);
  };
  setupSliderIndicator(); // Call the function to set up slider indicator
});
