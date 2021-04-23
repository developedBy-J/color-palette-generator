const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustBtn = document.querySelectorAll(".adjust");
const lockBtn = document.querySelectorAll(".lock");
const closeAdjustBtn = document.querySelectorAll(".close-adjustment");
const sliderContainer = document.querySelectorAll(".sliders");
let initialColors;

generateBtn.addEventListener("click", randomColors);

sliders.forEach((slider) => {
  slider.addEventListener("input", hslcontrol);
});

colorDivs.forEach((div, index) => {
  div.addEventListener("change", () => {
    updateTextUi(index);
  });
});

currentHexes.forEach((hex) => {
  hex.addEventListener("click", () => {
    copyToClipboard(hex);
  });
});

popup.addEventListener("transitionend", () => {
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    openSlidersPanel(index);
  });
});

closeAdjustBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    closeSlidersPanel(index);
  });
});

lockBtn.forEach((button, index) => {
  button.addEventListener("click", () => {
    initiateLock(index);
  });
});

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
}

function randomColors() {
  initialColors = [];
  colorDivs.forEach((div, index) => {
    const hexText = div.children[0];
    const hexVal = generateHex();

    if (div.children[1].children[1].classList.contains("locked")) {
      initialColors.push(hexText.innerText);
      return;
    } else {
      initialColors.push(chroma(hexVal).hex());
    }

    div.style.background = hexVal;
    hexText.innerText = hexVal;
    // Check for text contrast
    checkTextConstrast(hexVal, hexText);

    //initialize sliders color
    const color = chroma(hexVal);
    const sliders = div.querySelectorAll(".sliders input");
    const hue = sliders[0];
    const brightness = sliders[1];
    const saturation = sliders[2];

    colorTheSliders(color, hue, brightness, saturation);
  });

  resetInput();

  adjustBtn.forEach((button, index) => {
    checkTextConstrast(initialColors[index], button);
    checkTextConstrast(initialColors[index], lockBtn[index]);
  });
}

function checkTextConstrast(color, text) {
  const luminance = chroma(color).luminance();
  if (luminance > 0.5) {
    text.style.color = "black";
  } else {
    text.style.color = "white";
  }
}

function colorTheSliders(color, hue, brightness, saturation) {
  const noSat = color.set("hsl.s", 0);
  const fullSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  const midBright = color.set("hsl.l", 0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
    0
  )}, ${scaleSat(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
    0
  )}, ${scaleBright(0.5)}, ${scaleBright(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75,204), rgb(204,75,204), rgb(204,75,75))`;
}

function hslcontrol(e) {
  const index =
    e.target.getAttribute("data-hue") ||
    e.target.getAttribute("data-bright") ||
    e.target.getAttribute("data-sat");

  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const saturation = sliders[2];

  let bgColor = initialColors[index];
  let color = chroma(bgColor)
    .set("hsl.s", saturation.value)
    .set("hsl.l", brightness.value)
    .set("hsl.h", hue.value);

  colorDivs[index].style.backgroundColor = color;

  colorTheSliders(color, hue, brightness, saturation);
}

function updateTextUi(index) {
  const activeDiv = colorDivs[index];
  let color = chroma(activeDiv.style.backgroundColor);
  const textArea = activeDiv.querySelector("h2");
  textArea.innerText = color.hex();
  checkTextConstrast(color, textArea);

  const icons = activeDiv.querySelectorAll(".controls button");
  for (icon of icons) {
    checkTextConstrast(color, icon);
  }
}

function resetInput() {
  sliders.forEach((slider) => {
    if (slider.name === "hue") {
      const hueColor = initialColors[slider.getAttribute("data-hue")];
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    }
    if (slider.name === "brightness") {
      const brightColor = initialColors[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue * 100) / 100;
    }
    if (slider.name === "saturation") {
      const satColor = initialColors[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue * 100) / 100;
    }
  });
}

function copyToClipboard(hex) {
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);

  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");
}

function openSlidersPanel(index) {
  sliderContainer[index].classList.toggle("active");
}

function closeSlidersPanel(index) {
  sliderContainer[index].classList.remove("active");
}

function initiateLock(index) {
  lockBtn[index].classList.toggle("locked");
  if (lockBtn[index].classList.contains("locked")) {
    lockBtn[index].innerHTML = '<i class="fas fa-lock"></i>';
  } else {
    lockBtn[index].innerHTML = '<i class="fas fa-lock-open"></i>';
  }
}

/*saving stuff */

const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".submit-save");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");
const libContainer = document.querySelector(".library-container");
const libBtn = document.querySelector(".library");
const closeLibBtn = document.querySelector(".close-library");
let savedPaletts = [];

saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalette);
libBtn.addEventListener("click", openLibrary);
closeLibBtn.addEventListener("click", closeLibrary);

function openPalette(e) {
  saveInput.value = "";
  const savePopup = saveContainer.children[0];
  saveContainer.classList.add("active");
  savePopup.classList.add("active");
}

function closePalette(e) {
  const savePopup = saveContainer.children[0];
  saveContainer.classList.remove("active");
  savePopup.classList.remove("active");
}

function savePalette(e) {
  const name = saveInput.value;
  if (name.length == 0) {
    return;
  }
  saveContainer.classList.remove("active");
  popup.classList.remove("active");

  const colors = [];
  currentHexes.forEach((hex) => {
    colors.push(hex.innerText);
  });

  let paletteSize = savedPaletts.length;
  const paletteObj = { name, colors, size: paletteSize };
  savedPaletts.push(paletteObj);

  /*saveToLocal(paletteObj);*/

  /*Library palettes*/
  const palette = document.createElement("div");
  palette.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = paletteObj.name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  paletteObj.colors.forEach((col) => {
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = col;
    preview.appendChild(smallDiv);
  });
  paletteBtn = document.createElement("button");
  paletteBtn.classList.add("pick-palette-btn");
  paletteBtn.classList.add(paletteObj.size);
  paletteBtn.innerText = "Select";

  paletteBtn.addEventListener("click", (e) => {
    closeLibrary();
    const btnIndex = e.target.classList[1];
    initialColors = [];
    savedPaletts[btnIndex].colors.forEach((color, index) => {
      initialColors.push(color);
      colorDivs[index].style.backgroundColor = color;
      colorDivs[index].children[0].innerText = chroma(color).hex();

      const sliders = colorDivs[index].querySelectorAll(".sliders input");
      const hue = sliders[0];
      const brightness = sliders[1];
      const saturation = sliders[2];

      colorTheSliders(chroma(color), hue, brightness, saturation);
    });
  });

  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libContainer.children[0].appendChild(palette);
}

function saveToLocal(paletteObj) {
  let localPalettes;
  if (localStorage.getItem("palettes") === null) {
    localPalettes = [];
  } else {
    localPalettes = JSON.parse(localStorage.getItem("palettes"));
  }

  localPalettes.push(paletteObj);
  localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

function openLibrary() {
  const libPopup = libContainer.children[0];
  libContainer.classList.add("active");
  libPopup.classList.add("active");
}

function closeLibrary() {
  const libPopup = libContainer.children[0];
  libContainer.classList.remove("active");
  libPopup.classList.remove("active");
}
randomColors();
