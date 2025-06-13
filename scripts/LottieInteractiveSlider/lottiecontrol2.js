currentTooltipElements = { text: null, rect: null };

// Get DOM input objects
var slider = document.getElementById("slider");
// Define tick snap points and threshold
var animationContainer = document.getElementById("animationContainer");

const keyPoints = [0, 0.5, 1]; // Tick mark positions (normalized)
const snapThreshold = 0.05; // How close the slider needs to be to snap

var anim = {
  container: animationContainer, // the dom element that will contain the animation
  renderer: "svg",
  loop: false,
  autoplay: false,
  rendererSettings: {
    preserveAspectRatio: "xMidYMid meet",
  },
  path: "../../pages/data2.json", // the path to the animation json
};

var animInstance = lottie.loadAnimation(anim);

// --- NEW: Configuration for multiple SVG tooltips ---
const svgTooltipsConfig = [
  { id: "tooltipone", text: "This is the first tooltip!" },
  {
    id: "tooltiptwo",
    text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
  },
  // Add more objects here for other SVG elements you want tooltips on
  // { id: 'yetAnotherId', text: 'More details here.' },
];

// Helper function to create and position SVG text with a background
function createSvgTextWithBackground(mainSvgElement, textMessage, centerX) {
  // tooltipDesiredTopY is removed as it's calculated internally
  const paddingX = 20; // Horizontal padding for the background
  const paddingY = 15; // Vertical padding for the background
  const lineHeight = 50; // Approximate line height in SVG units. Adjust based on font size and desired spacing.
  const maxWidth = 500; // Maximum width for tooltip text in SVG units. Adjust based on your animation's scale.

  // Create the SVG text element initially
  const textElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  textElement.classList.add("svg-text-tooltip");
  textElement.setAttribute("text-anchor", "middle"); // Center text horizontally
  textElement.setAttribute("x", centerX); // Set X now, Y will be adjusted after wrapping and bbox calculation.

  // Append temporarily to mainSvgElement to enable getComputedTextLength()
  mainSvgElement.appendChild(textElement);

  const words = textMessage.split(" ");
  let currentLine = "";
  let tspanElements = [];

  // Simple word wrapping logic
  for (let i = 0; i < words.length; i++) {
    const testLine =
      currentLine === "" ? words[i] : currentLine + " " + words[i];
    textElement.textContent = testLine; // Temporarily set content to measure
    if (textElement.getComputedTextLength() > maxWidth && currentLine !== "") {
      const tspan = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
      );
      tspan.textContent = currentLine;
      tspan.setAttribute("x", centerX); // Keep centered
      tspan.setAttribute("dy", lineHeight); // Vertical offset from previous line
      tspanElements.push(tspan);
      currentLine = words[i]; // Start new line with current word
    } else {
      currentLine = testLine; // Keep adding to current line
    }
  }
  // Add the last line
  if (currentLine !== "") {
    const tspan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan"
    );
    tspan.textContent = currentLine;
    tspan.setAttribute("x", centerX);
    tspan.setAttribute("dy", tspanElements.length === 0 ? 0 : lineHeight); // First tspan dy is 0, others from prev line
    tspanElements.push(tspan);
  }

  // Clear temporary text and append actual tspan elements
  textElement.textContent = "";
  tspanElements.forEach((tspan) => textElement.appendChild(tspan));

  // Get the actual bounding box of the multi-line text after wrapping
  const textBBox = textElement.getBBox();

  // Create the SVG rectangle element for the background
  const rectElement = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "rect"
  );
  rectElement.classList.add("svg-tooltip-background"); // Add class for CSS transition and styling

  // --- RE-ADDED: Set x, y, width, height attributes for the rectangle ---
  const rectX = textBBox.x - paddingX;
  const rectY = textBBox.y - paddingY;
  const rectWidth = textBBox.width + 2 * paddingX;
  const rectHeight = textBBox.height + 2 * paddingY;

  rectElement.setAttribute("x", rectX);
  rectElement.setAttribute("y", rectY);
  rectElement.setAttribute("width", rectWidth);
  rectElement.setAttribute("height", rectHeight);
  // --------------------------------------------------------------------

  // Set initial opacity/visibility for transition
  rectElement.style.opacity = "0";
  rectElement.style.visibility = "hidden";
  textElement.style.opacity = "0";
  textElement.style.visibility = "hidden";

  // Append rectangle before text element to place it behind.
  // These will be positioned precisely after all elements are measured.
  mainSvgElement.insertBefore(rectElement, textElement);

  return { text: textElement, rect: rectElement };
}

// Function to update the slider value based on Lottie's current frame
function onEnterAnimationFrame(e) {
  // Convert current frame to a normalized value (0 to 1) based on total frames
  slider.value = e.currentTime / (animInstance.totalFrames - 1);
}

// Fired when Lottie animation configuration is ready (before animation data is loaded)
function onAnimConfigReady(e) {
  console.log("Lottie config_ready");
  // Set the max value of the slider to the total number of frames - 1
  // This ensures slider.value corresponds directly to frame numbers for goToAndStop
  slider.setAttribute("max", animInstance.totalFrames - 1);

  // Add event listener for when the user starts dragging the slider
  slider.addEventListener("mousedown", onSliderDown);
}

// Fired after Lottie animation data is loaded
function onAnimDataReady(e) {
  console.log("Lottie data_ready");
}

// Fired when Lottie animation elements have been added to the DOM
function onAnimDomLoaded(e) {
  console.log(
    "Lottie elements have been added to the DOM. Attaching SVG tooltip listeners."
  );

  const mainSvgElement = animationContainer.querySelector("svg");

  if (!mainSvgElement) {
    console.warn(
      "Main SVG element not found in animationContainer. Cannot attach SVG tooltips."
    );
    return;
  }

  // Ensure the main SVG element itself has pointer events enabled
  mainSvgElement.style.pointerEvents = "auto";

  // Loop through the tooltip configuration and attach listeners
  svgTooltipsConfig.forEach((config) => {
    const targetSvgElement = document.getElementById(config.id);

    if (targetSvgElement) {
      console.log(`Found SVG element for tooltip: ${config.id}`);

      // Ensure this specific target element also has pointer events enabled
      targetSvgElement.style.pointerEvents = "auto";

      targetSvgElement.addEventListener("mouseenter", () => {
        // If there's an existing tooltip from a previous hover, remove it first
        if (
          currentTooltipElements.text &&
          currentTooltipElements.text.parentNode
        ) {
          currentTooltipElements.text.parentNode.removeChild(
            currentTooltipElements.text
          );
          if (
            currentTooltipElements.rect &&
            currentTooltipElements.rect.parentNode
          ) {
            currentTooltipElements.rect.parentNode.removeChild(
              currentTooltipElements.rect
            );
          }
          currentTooltipElements = { text: null, rect: null };
        }

        // Get the bounding box of the target SVG element in its local coordinate system
        const bbox = targetSvgElement.getBBox();

        // Get the CTM (Current Transformation Matrix) of the target element
        const ctm = targetSvgElement.getScreenCTM();

        // Create an SVGPoint and transform the top-middle point of the bbox
        // into the screen coordinates using the target element's CTM.
        const svgPoint = mainSvgElement.createSVGPoint();
        svgPoint.x = bbox.x + bbox.width / 2; // Center point in local X
        svgPoint.y = bbox.y; // Top of the bbox in local Y
        const screenPoint = svgPoint.matrixTransform(ctm);

        // Now, convert these screen coordinates back into the main SVG's coordinate system.
        // This accounts for any transformations on the main SVG or its ancestors.
        const inverseMainSvgCtm = mainSvgElement.getScreenCTM().inverse();
        const svgGlobalPoint = screenPoint.matrixTransform(inverseMainSvgCtm);

        // Create tooltip elements using the helper function
        currentTooltipElements = createSvgTextWithBackground(
          mainSvgElement,
          config.text,
          svgGlobalPoint.x // Centered X
        );

        // After creating and appending, precisely position them.
        // The `createSvgTextWithBackground` function already positions text relative to rect.
        // Now, we need to position the whole group relative to the hovered element.
        const paddingY = 15; // Vertical padding for the background (re-used from helper)
        const clearanceFromElement = 20; // Desired vertical space from hovered element

        // Get the actual bounding box of the rect *after* createSvgTextWithBackground has set its attributes
        const rectBBoxAfterCreation = currentTooltipElements.rect.getBBox();
        const tooltipHeight = rectBBoxAfterCreation.height;

        // The top of the rect should be: (top of hovered element) - (rect height) - (clearance)
        const finalRectY =
          svgGlobalPoint.y - tooltipHeight - clearanceFromElement;

        // Calculate translation amount for the whole tooltip group
        // We need to translate from its current Y position (`rectBBoxAfterCreation.y`) to `finalRectY`.
        const translateY = finalRectY - rectBBoxAfterCreation.y;

        // Apply the translation to both the rectangle and the text element.
        // A more elegant solution would be to wrap them in a <g> element and apply transform to the group.
        currentTooltipElements.rect.setAttribute(
          "transform",
          `translate(0, ${translateY})`
        );
        currentTooltipElements.text.setAttribute(
          "transform",
          `translate(0, ${translateY})`
        );

        console.log(
          `Tooltip for ${config.id} created and appended. Final Y adjustment applied.`
        );

        // Fade in both the text and background
        setTimeout(() => {
          if (currentTooltipElements.text) {
            currentTooltipElements.text.style.opacity = "1";
            currentTooltipElements.text.style.visibility = "visible";
          }
          if (currentTooltipElements.rect) {
            currentTooltipElements.rect.style.opacity = "1";
            currentTooltipElements.rect.style.visibility = "visible";
            console.log("Tooltip visibility set to visible.");
          }
        }, 10); // Small delay for transition
      });

      targetSvgElement.addEventListener("mouseleave", () => {
        if (currentTooltipElements.text && currentTooltipElements.rect) {
          const textToFade = currentTooltipElements.text;
          const rectToFade = currentTooltipElements.rect;

          textToFade.style.opacity = "0";
          textToFade.style.visibility = "hidden";
          rectToFade.style.opacity = "0";
          rectToFade.style.visibility = "hidden";

          // Reset currentTooltipElements *immediately* after triggering fade-out
          currentTooltipElements = { text: null, rect: null };

          // Listen for transition end on one of them (e.g., text)
          textToFade.addEventListener("transitionend", function handler() {
            if (textToFade.parentNode) {
              textToFade.parentNode.removeChild(textToFade);
            }
            if (rectToFade.parentNode) {
              rectToFade.parentNode.removeChild(rectToFade);
            }
            textToFade.removeEventListener("transitionend", handler);
            console.log(`Tooltip for ${config.id} removed from DOM.`);
          });
        }
      });
    } else {
      console.warn(
        `SVG element with ID '${config.id}' not found. Tooltip will not appear for this element.`
      );
    }
  });
}

// When user starts dragging the slider
function onSliderDown(e) {
  animInstance.pause(); // Pause animation during drag
  // Remove enterFrame listener to prevent conflict with manual slider control
  animInstance.removeEventListener("enterFrame", onEnterAnimationFrame);
  // Listen for slider value changes during drag
  slider.addEventListener("input", onSliderChange);
  // Listen for mouse up anywhere on the window to stop dragging
  window.addEventListener("mouseup", onSliderUp);
}

// When user releases the slider
function onSliderUp(e) {
  // Re-attach enterFrame listener to update slider if animation resumes playback
  animInstance.addEventListener("enterFrame", onEnterAnimationFrame);
  // Remove event listeners for slider input and mouse up
  slider.removeEventListener("input", onSliderChange);
  window.removeEventListener("mouseup", onSliderUp);
}

function onSliderChange(e) {
  let rawValue = parseFloat(slider.value);
  let snappedValue = rawValue;

  console.log("Raw slider value:", rawValue); // 🔍 Debug: show slider position before snapping

  for (let i = 0; i < keyPoints.length; i++) {
    if (Math.abs(rawValue - keyPoints[i]) <= snapThreshold) {
      snappedValue = keyPoints[i];
      console.log("Snapped to:", snappedValue); // 🔍 Debug: show snapped value
      break;
    }
  }

  slider.value = snappedValue;
  animInstance.goToAndStop(snappedValue * 30.0, false);

  console.log("Final slider value:", slider.value); // 🔍 Debug: confirm what was set
}

animInstance.addEventListener("enterFrame", onEnterAnimationFrame);
animInstance.addEventListener("data_ready", onAnimDataReady);
animInstance.addEventListener("config_ready", onAnimConfigReady);
animInstance.addEventListener("DOMLoaded", onAnimDomLoaded);

document.addEventListener("DOMContentLoaded", function () {
  const tickmarks = document.getElementById("tickmarks");

  // Get the width of the slider and thumb
  const sliderWidth = slider.offsetWidth;
  const thumbWidth = 25; // Slider thumb width
  const thumbOffset = thumbWidth / 2; // Offset for center alignment

  // Create tick marks dynamically
  keyPoints.forEach((point, index) => {
    const tick = document.createElement("div");
    tick.classList.add("tick");

    // Calculate the base position for each tick mark (normalized to slider width)
    let tickPosition = point * sliderWidth;

    // Adjust position for 0% and 100% ticks to account for thumb's visual position
    if (index === 0) {
      // For the 0% mark, move it slightly inward by half the thumb width
      tickPosition = thumbOffset;
    } else if (index === keyPoints.length - 1) {
      // For the 100% mark, move it slightly inward from the right edge
      tickPosition = sliderWidth - thumbOffset;
    }

    // Apply the adjusted position
    tick.style.left = `${tickPosition}px`;

    // Append the tick to the container
    tickmarks.appendChild(tick);
  });
});
