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
    // This allows tocElement and footerElement to be undefined without throwing an error
    // when trying to access their properties if they are null.
    const tocElement = document.querySelector(".toc");
    const footerElement = document.querySelector("footer");

    // Only proceed if the back-to-top button exists on the page.
    if (!backToTopButton) return;

    // Function to position the back-to-top button
    const positionBackToTopButton = () => {
      // Return early if any required element for positioning is missing.
      // This is a more robust check now that tocElement and footerElement might be null.
      if (!tocElement || !footerElement) {
        // If TOC or footer are missing, you might choose a fallback position
        // e.g., backToTopButton.style.right = '20px'; backToTopButton.style.bottom = '20px';
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

      // Calculate the bottom position: either default margin from viewport, or 20px above footer
      // Math.max ensures the button never goes below the defaultBottomMargin
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

    // Event listener for scroll to show/hide and reposition the button
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

  // --- 3. Table of Contents Active Link on Scroll ---
  // Purpose: Highlights the active link in the TOC based on scroll position.
  const setupTocActiveLinks = () => {
    const sections = document.querySelectorAll(".main-content-column section");
    const tocLinks = document.querySelectorAll(".toc ul li a");
    const tocMainSectionSpan = document.querySelector(
      ".toc ul li.main-section span"
    );

    // Only proceed if sections and TOC links exist.
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

      if (currentActiveSectionId) {
        const correspondingLink = document.querySelector(
          `.toc ul li a[href="#${currentActiveSectionId}"]`
        );
        if (correspondingLink) {
          correspondingLink.classList.add("active-toc-link");
        } else if (
          currentActiveSectionId === "arm-injuries-section" &&
          tocMainSectionSpan
        ) {
          tocMainSectionSpan.classList.add("active-toc-link");
        }
      }
    };

    window.addEventListener("scroll", updateActiveTocLink);
    updateActiveTocLink(); // Initial call to set active link on load
  };
  setupTocActiveLinks(); // Call the function to set up TOC active links

  // --- 4. Accordion Functionality ---
  // Purpose: Implements expand/collapse behavior for accordion elements.
  const setupAccordions = () => {
    const accordions = document.getElementsByClassName("accordion"); // Use const/let

    // Convert HTMLCollection to Array for easier iteration with forEach
    Array.from(accordions).forEach((accordion) => {
      accordion.addEventListener("click", function () {
        this.classList.toggle("active");
        const panel = this.nextElementSibling; // Use const/let
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
