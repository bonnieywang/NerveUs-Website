document.addEventListener("DOMContentLoaded", function () {
  // =========================================================
  // Interactive Slider 1 Logic
  // =========================================================
  let currentTooltipElements1 = { text: null, rect: null };

  // Get DOM input objects for slider 1
  const slider1 = document.getElementById("slider");
  const animationContainer1 = document.getElementById("animationContainer");
  const skinOverlay1 = document.getElementById("skinOverlay");
  const boneBehind1 = document.getElementById("boneBehind");
  const boneFront1 = document.getElementById("boneFront");
  const toggleSkinOverlayBtn1 = document.getElementById("toggleSkinOverlayBtn");
  const toggleBoneOverlayBtn1 = document.getElementById("toggleBoneOverlayBtn");
  const tickmarks1 = document.getElementById("tickmarks");

  const keyPoints1 = [0, 0.5, 1]; // Tick mark positions (normalized)
  const snapThreshold1 = 0.05; // How close the slider needs to be to snap

  const animConfig1 = {
    container: animationContainer1,
    renderer: "svg",
    loop: false,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
    },
    path: "../../pages/data1.json", // Path to your first animation JSON
  };

  const animInstance1 = lottie.loadAnimation(animConfig1);

  const svgTooltipsConfig1 = [
    { id: "tooltipone", text: "This is the first tooltip!" },
    {
      id: "tooltiptwo",
      text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    },
  ];

  function createSvgTextWithBackground1(mainSvgElement, textMessage, centerX) {
    const paddingX = 20;
    const paddingY = 15;
    const lineHeight = 50;
    const maxWidth = 500;

    const textElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textElement.classList.add("svg-text-tooltip");
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("x", centerX);
    mainSvgElement.appendChild(textElement);

    const words = textMessage.split(" ");
    let currentLine = "";
    let tspanElements = [];

    for (let i = 0; i < words.length; i++) {
      const testLine =
        currentLine === "" ? words[i] : currentLine + " " + words[i];
      textElement.textContent = testLine;
      if (
        textElement.getComputedTextLength() > maxWidth &&
        currentLine !== ""
      ) {
        const tspan = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "tspan"
        );
        tspan.textContent = currentLine;
        tspan.setAttribute("x", centerX);
        tspan.setAttribute("dy", lineHeight);
        tspanElements.push(tspan);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine !== "") {
      const tspan = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
      );
      tspan.textContent = currentLine;
      tspan.setAttribute("x", centerX);
      tspan.setAttribute("dy", tspanElements.length === 0 ? 0 : lineHeight);
      tspanElements.push(tspan);
    }

    textElement.textContent = "";
    tspanElements.forEach((tspan) => textElement.appendChild(tspan));
    const textBBox = textElement.getBBox();

    const rectElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rectElement.classList.add("svg-tooltip-background");
    const rectX = textBBox.x - paddingX;
    const rectY = textBBox.y - paddingY;
    const rectWidth = textBBox.width + 2 * paddingX;
    const rectHeight = textBBox.height + 2 * paddingY;
    rectElement.setAttribute("x", rectX);
    rectElement.setAttribute("y", rectY);
    rectElement.setAttribute("width", rectWidth);
    rectElement.setAttribute("height", rectHeight);

    rectElement.style.opacity = "0";
    rectElement.style.visibility = "hidden";
    textElement.style.opacity = "0";
    textElement.style.visibility = "hidden";
    mainSvgElement.insertBefore(rectElement, textElement);
    return { text: textElement, rect: rectElement };
  }

  function onEnterAnimationFrame1(e) {
    slider1.value = e.currentTime / (animInstance1.totalFrames - 1);
  }

  function onAnimConfigReady1(e) {
    console.log("Lottie config_ready for slider 1");
    slider1.setAttribute("max", animInstance1.totalFrames - 1);
    slider1.addEventListener("mousedown", onSliderDown1);
  }

  function onAnimDataReady1(e) {
    console.log("Lottie data_ready for slider 1");
  }

  function onAnimDomLoaded1(e) {
    console.log(
      "Lottie elements for slider 1 have been added to the DOM. Attaching SVG tooltip listeners."
    );
    const mainSvgElement = animationContainer1.querySelector("svg");
    if (!mainSvgElement) {
      console.warn(
        "Main SVG element not found in animationContainer1. Cannot attach SVG tooltips."
      );
      return;
    }
    mainSvgElement.style.pointerEvents = "auto";
    svgTooltipsConfig1.forEach((config) => {
      const targetSvgElement = document.getElementById(config.id);
      if (targetSvgElement) {
        console.log(`Found SVG element for tooltip: ${config.id}`);
        targetSvgElement.style.pointerEvents = "auto";
        targetSvgElement.addEventListener("mouseenter", () => {
          if (
            currentTooltipElements1.text &&
            currentTooltipElements1.text.parentNode
          ) {
            currentTooltipElements1.text.parentNode.removeChild(
              currentTooltipElements1.text
            );
            if (
              currentTooltipElements1.rect &&
              currentTooltipElements1.rect.parentNode
            ) {
              currentTooltipElements1.rect.parentNode.removeChild(
                currentTooltipElements1.rect
              );
            }
            currentTooltipElements1 = { text: null, rect: null };
          }
          const bbox = targetSvgElement.getBBox();
          const ctm = targetSvgElement.getScreenCTM();
          const svgPoint = mainSvgElement.createSVGPoint();
          svgPoint.x = bbox.x + bbox.width / 2;
          svgPoint.y = bbox.y;
          const screenPoint = svgPoint.matrixTransform(ctm);
          const inverseMainSvgCtm = mainSvgElement.getScreenCTM().inverse();
          const svgGlobalPoint = screenPoint.matrixTransform(inverseMainSvgCtm);

          currentTooltipElements1 = createSvgTextWithBackground1(
            mainSvgElement,
            config.text,
            svgGlobalPoint.x
          );
          const paddingY = 15;
          const clearanceFromElement = 20;
          const rectBBoxAfterCreation = currentTooltipElements1.rect.getBBox();
          const tooltipHeight = rectBBoxAfterCreation.height;
          const finalRectY =
            svgGlobalPoint.y - tooltipHeight - clearanceFromElement;
          const translateY = finalRectY - rectBBoxAfterCreation.y;

          currentTooltipElements1.rect.setAttribute(
            "transform",
            `translate(0, ${translateY})`
          );
          currentTooltipElements1.text.setAttribute(
            "transform",
            `translate(0, ${translateY})`
          );

          setTimeout(() => {
            if (currentTooltipElements1.text) {
              currentTooltipElements1.text.style.opacity = "1";
              currentTooltipElements1.text.style.visibility = "visible";
            }
            if (currentTooltipElements1.rect) {
              currentTooltipElements1.rect.style.opacity = "1";
              currentTooltipElements1.rect.style.visibility = "visible";
            }
          }, 10);
        });

        targetSvgElement.addEventListener("mouseleave", () => {
          if (currentTooltipElements1.text && currentTooltipElements1.rect) {
            const textToFade = currentTooltipElements1.text;
            const rectToFade = currentTooltipElements1.rect;

            textToFade.style.opacity = "0";
            textToFade.style.visibility = "hidden";
            rectToFade.style.opacity = "0";
            rectToFade.style.visibility = "hidden";

            currentTooltipElements1 = { text: null, rect: null };

            textToFade.addEventListener("transitionend", function handler() {
              if (textToFade.parentNode) {
                textToFade.parentNode.removeChild(textToFade);
              }
              if (rectToFade.parentNode) {
                rectToFade.parentNode.removeChild(rectToFade);
              }
              textToFade.removeEventListener("transitionend", handler);
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

  function onSliderDown1(e) {
    animInstance1.pause();
    animInstance1.removeEventListener("enterFrame", onEnterAnimationFrame1);
    slider1.addEventListener("input", onSliderChange1);
    window.addEventListener("mouseup", onSliderUp1);
  }

  function onSliderUp1(e) {
    animInstance1.addEventListener("enterFrame", onEnterAnimationFrame1);
    slider1.removeEventListener("input", onSliderChange1);
    window.removeEventListener("mouseup", onSliderUp1);
  }

  function onSliderChange1(e) {
    let rawValue = parseFloat(slider1.value);
    let snappedValue = rawValue;

    for (let i = 0; i < keyPoints1.length; i++) {
      if (Math.abs(rawValue - keyPoints1[i]) <= snapThreshold1) {
        snappedValue = keyPoints1[i];
        break;
      }
    }
    slider1.value = snappedValue;
    animInstance1.goToAndStop(snappedValue * 30.0, false);
  }

  // Overlay toggle buttons for slider 1
  if (toggleSkinOverlayBtn1) {
    toggleSkinOverlayBtn1.addEventListener("click", function () {
      this.classList.toggle("active");
      skinOverlay1.style.display =
        skinOverlay1.style.display === "block" ? "none" : "block";
    });
  }
  if (toggleBoneOverlayBtn1) {
    toggleBoneOverlayBtn1.addEventListener("click", function () {
      this.classList.toggle("active");
      boneBehind1.style.display =
        boneBehind1.style.display === "block" ? "none" : "block";
      boneFront1.style.display =
        boneFront1.style.display === "block" ? "none" : "block";
    });
  }

  animInstance1.addEventListener("enterFrame", onEnterAnimationFrame1);
  animInstance1.addEventListener("data_ready", onAnimDataReady1);
  animInstance1.addEventListener("config_ready", onAnimConfigReady1);
  animInstance1.addEventListener("DOMLoaded", onAnimDomLoaded1);

  // Tick marks for slider 1
  const sliderWidth1 = slider1.offsetWidth;
  const thumbWidth1 = 25;
  const thumbOffset1 = thumbWidth1 / 2;

  keyPoints1.forEach((point, index) => {
    const tick = document.createElement("div");
    tick.classList.add("tick");
    let tickPosition = point * sliderWidth1;
    if (index === 0) {
      tickPosition = thumbOffset1;
    } else if (index === keyPoints1.length - 1) {
      tickPosition = sliderWidth1 - thumbOffset1;
    }
    tick.style.left = `${tickPosition}px`;
    tickmarks1.appendChild(tick);
  });

  // =========================================================
  // Interactive Slider 2 Logic (Duplicated and modified)
  // =========================================================
  let currentTooltipElements2 = { text: null, rect: null };

  // Get DOM input objects for slider 2
  const slider2 = document.getElementById("slider2");
  const animationContainer2 = document.getElementById("animationContainer2");
  const skinOverlay2 = document.getElementById("skinOverlay2");
  const boneBehind2 = document.getElementById("boneBehind2");
  const boneFront2 = document.getElementById("boneFront2");
  const toggleSkinOverlayBtn2 = document.getElementById(
    "toggleSkinOverlayBtn2"
  );
  const toggleBoneOverlayBtn2 = document.getElementById(
    "toggleBoneOverlayBtn2"
  );
  const tickmarks2 = document.getElementById("tickmarks2");

  const keyPoints2 = [0, 0.5, 1]; // Tick mark positions (normalized)
  const snapThreshold2 = 0.05; // How close the slider needs to be to snap

  const animConfig2 = {
    container: animationContainer2,
    renderer: "svg",
    loop: false,
    autoplay: false,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid meet",
    },
    path: "../../pages/data2.json", // Path to your second animation JSON
  };

  const animInstance2 = lottie.loadAnimation(animConfig2);

  const svgTooltipsConfig2 = [
    { id: "tooltipone", text: "This is the first tooltip!" },
    {
      id: "tooltiptwo",
      text: "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
    },
  ];

  function createSvgTextWithBackground2(mainSvgElement, textMessage, centerX) {
    const paddingX = 20;
    const paddingY = 15;
    const lineHeight = 50;
    const maxWidth = 500;

    const textElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    textElement.classList.add("svg-text-tooltip");
    textElement.setAttribute("text-anchor", "middle");
    textElement.setAttribute("x", centerX);
    mainSvgElement.appendChild(textElement);

    const words = textMessage.split(" ");
    let currentLine = "";
    let tspanElements = [];

    for (let i = 0; i < words.length; i++) {
      const testLine =
        currentLine === "" ? words[i] : currentLine + " " + words[i];
      textElement.textContent = testLine;
      if (
        textElement.getComputedTextLength() > maxWidth &&
        currentLine !== ""
      ) {
        const tspan = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "tspan"
        );
        tspan.textContent = currentLine;
        tspan.setAttribute("x", centerX);
        tspan.setAttribute("dy", lineHeight);
        tspanElements.push(tspan);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine !== "") {
      const tspan = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "tspan"
      );
      tspan.textContent = currentLine;
      tspan.setAttribute("x", centerX);
      tspan.setAttribute("dy", tspanElements.length === 0 ? 0 : lineHeight);
      tspanElements.push(tspan);
    }

    textElement.textContent = "";
    tspanElements.forEach((tspan) => textElement.appendChild(tspan));
    const textBBox = textElement.getBBox();

    const rectElement = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect"
    );
    rectElement.classList.add("svg-tooltip-background");
    const rectX = textBBox.x - paddingX;
    const rectY = textBBox.y - paddingY;
    const rectWidth = textBBox.width + 2 * paddingX;
    const rectHeight = textBBox.height + 2 * paddingY;
    rectElement.setAttribute("x", rectX);
    rectElement.setAttribute("y", rectY);
    rectElement.setAttribute("width", rectWidth);
    rectElement.setAttribute("height", rectHeight);

    rectElement.style.opacity = "0";
    rectElement.style.visibility = "hidden";
    textElement.style.opacity = "0";
    textElement.style.visibility = "hidden";
    mainSvgElement.insertBefore(rectElement, textElement);
    return { text: textElement, rect: rectElement };
  }

  function onEnterAnimationFrame2(e) {
    slider2.value = e.currentTime / (animInstance2.totalFrames - 1);
  }

  function onAnimConfigReady2(e) {
    console.log("Lottie config_ready for slider 2");
    slider2.setAttribute("max", animInstance2.totalFrames - 1);
    slider2.addEventListener("mousedown", onSliderDown2);
  }

  function onAnimDataReady2(e) {
    console.log("Lottie data_ready for slider 2");
  }

  function onAnimDomLoaded2(e) {
    console.log(
      "Lottie elements for slider 2 have been added to the DOM. Attaching SVG tooltip listeners."
    );
    const mainSvgElement = animationContainer2.querySelector("svg");
    if (!mainSvgElement) {
      console.warn(
        "Main SVG element not found in animationContainer2. Cannot attach SVG tooltips."
      );
      return;
    }
    mainSvgElement.style.pointerEvents = "auto";
    svgTooltipsConfig2.forEach((config) => {
      const targetSvgElement = document.getElementById(config.id);
      if (targetSvgElement) {
        console.log(`Found SVG element for tooltip: ${config.id}`);
        targetSvgElement.style.pointerEvents = "auto";
        targetSvgElement.addEventListener("mouseenter", () => {
          if (
            currentTooltipElements2.text &&
            currentTooltipElements2.text.parentNode
          ) {
            currentTooltipElements2.text.parentNode.removeChild(
              currentTooltipElements2.text
            );
            if (
              currentTooltipElements2.rect &&
              currentTooltipElements2.rect.parentNode
            ) {
              currentTooltipElements2.rect.parentNode.removeChild(
                currentTooltipElements2.rect
              );
            }
            currentTooltipElements2 = { text: null, rect: null };
          }
          const bbox = targetSvgElement.getBBox();
          const ctm = targetSvgElement.getScreenCTM();
          const svgPoint = mainSvgElement.createSVGPoint();
          svgPoint.x = bbox.x + bbox.width / 2;
          svgPoint.y = bbox.y;
          const screenPoint = svgPoint.matrixTransform(ctm);
          const inverseMainSvgCtm = mainSvgElement.getScreenCTM().inverse();
          const svgGlobalPoint = screenPoint.matrixTransform(inverseMainSvgCtm);

          currentTooltipElements2 = createSvgTextWithBackground2(
            mainSvgElement,
            config.text,
            svgGlobalPoint.x
          );
          const paddingY = 15;
          const clearanceFromElement = 20;
          const rectBBoxAfterCreation = currentTooltipElements2.rect.getBBox();
          const tooltipHeight = rectBBoxAfterCreation.height;
          const finalRectY =
            svgGlobalPoint.y - tooltipHeight - clearanceFromElement;
          const translateY = finalRectY - rectBBoxAfterCreation.y;

          currentTooltipElements2.rect.setAttribute(
            "transform",
            `translate(0, ${translateY})`
          );
          currentTooltipElements2.text.setAttribute(
            "transform",
            `translate(0, ${translateY})`
          );

          setTimeout(() => {
            if (currentTooltipElements2.text) {
              currentTooltipElements2.text.style.opacity = "1";
              currentTooltipElements2.text.style.visibility = "visible";
            }
            if (currentTooltipElements2.rect) {
              currentTooltipElements2.rect.style.opacity = "1";
              currentTooltipElements2.rect.style.visibility = "visible";
            }
          }, 10);
        });

        targetSvgElement.addEventListener("mouseleave", () => {
          if (currentTooltipElements2.text && currentTooltipElements2.rect) {
            const textToFade = currentTooltipElements2.text;
            const rectToFade = currentTooltipElements2.rect;

            textToFade.style.opacity = "0";
            textToFade.style.visibility = "hidden";
            rectToFade.style.opacity = "0";
            rectToFade.style.visibility = "hidden";

            currentTooltipElements2 = { text: null, rect: null };

            textToFade.addEventListener("transitionend", function handler() {
              if (textToFade.parentNode) {
                textToFade.parentNode.removeChild(textToFade);
              }
              if (rectToFade.parentNode) {
                rectToFade.parentNode.removeChild(rectToFade);
              }
              textToFade.removeEventListener("transitionend", handler);
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

  function onSliderDown2(e) {
    animInstance2.pause();
    animInstance2.removeEventListener("enterFrame", onEnterAnimationFrame2);
    slider2.addEventListener("input", onSliderChange2);
    window.addEventListener("mouseup", onSliderUp2);
  }

  function onSliderUp2(e) {
    animInstance2.addEventListener("enterFrame", onEnterAnimationFrame2);
    slider2.removeEventListener("input", onSliderChange2);
    window.removeEventListener("mouseup", onSliderUp2);
  }

  function onSliderChange2(e) {
    let rawValue = parseFloat(slider2.value);
    let snappedValue = rawValue;

    for (let i = 0; i < keyPoints2.length; i++) {
      if (Math.abs(rawValue - keyPoints2[i]) <= snapThreshold2) {
        snappedValue = keyPoints2[i];
        break;
      }
    }

    // Change numerical value here to adjust animation length to slider
    slider2.value = snappedValue;
    animInstance2.goToAndStop(snappedValue * 30.0, false);
  }

  // Overlay toggle buttons for slider 2
  if (toggleSkinOverlayBtn2) {
    toggleSkinOverlayBtn2.addEventListener("click", function () {
      this.classList.toggle("active");
      skinOverlay2.style.display =
        skinOverlay2.style.display === "block" ? "none" : "block";
    });
  }
  if (toggleBoneOverlayBtn2) {
    toggleBoneOverlayBtn2.addEventListener("click", function () {
      this.classList.toggle("active");
      boneBehind2.style.display =
        boneBehind2.style.display === "block" ? "none" : "block";
      boneFront2.style.display =
        boneFront2.style.display === "block" ? "none" : "block";
    });
  }

  animInstance2.addEventListener("enterFrame", onEnterAnimationFrame2);
  animInstance2.addEventListener("data_ready", onAnimDataReady2);
  animInstance2.addEventListener("config_ready", onAnimConfigReady2);
  animInstance2.addEventListener("DOMLoaded", onAnimDomLoaded2);

  // Tick marks for slider 2
  const sliderWidth2 = slider2.offsetWidth;
  const thumbWidth2 = 25;
  const thumbOffset2 = thumbWidth2 / 2;

  keyPoints2.forEach((point, index) => {
    const tick = document.createElement("div");
    tick.classList.add("tick");
    let tickPosition = point * sliderWidth2;
    if (index === 0) {
      tickPosition = thumbOffset2;
    } else if (index === keyPoints2.length - 1) {
      tickPosition = sliderWidth2 - thumbOffset2;
    }
    tick.style.left = `${tickPosition}px`;
    tickmarks2.appendChild(tick);
  });
});
