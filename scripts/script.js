document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".dropdown-main-menu > li > a");
  const currentPath = window.location.pathname;

  navLinks.forEach((link) => {
    const linkPath = link.pathname;
    // Use endsWith to handle both /page.html and /page
    if (currentPath.endsWith(linkPath)) {
      link.parentElement.classList.add("active");
    }
  });

  // Back to top button functionality
  const backToTopButton = document.getElementById("back-to-top");
  const tocElement = document.querySelector(".toc"); // Get the TOC element
  const footerElement = document.querySelector("footer"); // Get the footer element

  // Function to position the back-to-top button
  function positionBackToTopButton() {
    if (!backToTopButton || !tocElement || !footerElement) return;

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
  }

  if (backToTopButton) {
    backToTopButton.addEventListener("click", () => {
      window.scrollTo({
        top: 0,
        behavior: "smooth", // Use smooth scrolling
      });
    });

    // Show/hide the button based on scroll position
    window.addEventListener("scroll", () => {
      if (window.scrollY > 200) {
        // Show after scrolling down 200px
        backToTopButton.style.display = "block"; // Make it visible
      } else {
        backToTopButton.style.display = "none"; // Hide it
      }
      positionBackToTopButton(); // Always reposition on scroll
    });

    // Initial positioning on load
    positionBackToTopButton();
    // Reposition on window resize
    window.addEventListener("resize", positionBackToTopButton);
  }

  // --- Table of Contents Active Link on Scroll (Revised) ---
  const sections = document.querySelectorAll(".main-content-column section");
  const tocLinks = document.querySelectorAll(".toc ul li a");
  const tocMainSectionSpan = document.querySelector(
    ".toc ul li.main-section span"
  ); // Get the span for "Arm Injuries"

  function updateActiveTocLink() {
    let currentActiveSectionId = null;

    // Determine which section is currently at the top of the viewport
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const rect = section.getBoundingClientRect();
      // If the top of the section is at or just above the viewport top (within a small offset)
      // and the section is still largely visible
      if (rect.top <= 100 && rect.bottom > 100) {
        // Using 100px offset from top
        currentActiveSectionId = section.id;
        break; // Found the top-most visible section, break the loop
      }
    }

    // If no section is found (e.g., at the very top of the page before any section starts)
    // or if the first section is the target and we are at the very top
    if (
      !currentActiveSectionId &&
      window.scrollY < 100 &&
      sections.length > 0
    ) {
      currentActiveSectionId = sections[0].id;
    }

    // Remove active class from all TOC links and the span
    tocLinks.forEach((link) => {
      link.classList.remove("active-toc-link");
    });
    if (tocMainSectionSpan) {
      tocMainSectionSpan.classList.remove("active-toc-link");
    }

    // Add active class to the corresponding TOC link or span
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
        // Special case for "Arm Injuries" if it's a non-clickable span
        tocMainSectionSpan.classList.add("active-toc-link");
      }
    }
  }

  // Listen for scroll events to update the active TOC link
  window.addEventListener("scroll", updateActiveTocLink);

  // Call it once on load to set the initial active link
  updateActiveTocLink();

  // --- End Table of Contents Active Link on Scroll (Revised) ---

  // Cursor hover over slider functionality
  // Get references to the slider and indicator elements
  const slider = document.getElementById("slider"); // Changed to 'slider' as per your HTML
  const sliderIndicator = document.getElementById("sliderIndicator");

  // Function to hide the indicator
  const hideIndicator = () => {
    // Add the 'hidden' class to fade out the indicator
    sliderIndicator.classList.add("hidden");
  };

  // Event listener for when the user changes the slider's value
  slider.addEventListener("input", hideIndicator);

  // Event listeners for initial interaction (click/touch) on the slider
  slider.addEventListener("mousedown", hideIndicator); // For mouse clicks on the slider track
  slider.addEventListener("touchstart", hideIndicator); // For touch on mobile devices

  // Event listener for when the slider gains focus (e.g., via keyboard navigation)
  slider.addEventListener("focus", hideIndicator);
});

// Accordion functionality
document.addEventListener("DOMContentLoaded", () => {
  var acc = document.getElementsByClassName("accordion");
  for (var i = 0; i < acc.length; i++) {
    acc[i].addEventListener("click", function () {
      this.classList.toggle("active");
      var panel = this.nextElementSibling;
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  }
});
