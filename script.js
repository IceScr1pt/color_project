//Global selections
const colorDivs = document.querySelectorAll('.color'),
  generateBtn = document.getElementById('generate'),
  /*select all inputs of type range */
  allSliders = document.querySelectorAll('input[type="range"]'),
  currentHexes = document.querySelectorAll('.color h2'),
  copyPopup = document.querySelector('.copy-container'),
  adjustColorBtns = document.querySelectorAll('.adjust'),
  lockBtns = document.querySelectorAll('.lock'),
  showSliderCloseBtns = document.querySelectorAll('.close-adjustment'),
  //Save selectors
  saveBtn = document.querySelector('.save'),
  submitSaveBtn = document.querySelector('.submit-save'),
  saveInputEl = document.querySelector('.save-name'),
  closeSaveBtn = document.querySelector('.close-save'),
  savePopupContainer = document.querySelector('.save-container'),
  //Library selectors
  libraryPopupContainer = document.querySelector('.library-container'),
  libraryPopup = document.querySelector('.library-popup'),
  closeLibraryBtn = document.querySelector('.close-library'),
  openLibraryBtn = document.querySelector('.library'),
  clearLibraryBtn = document.querySelector('.clear');

let initialColors = [];
console.log(savePopupContainer);
//Local storage variables
let savedPalette = [];

function generateHex() {
  const hexColor = chroma.random();
  return hexColor;
  /*Simple solution without using chroma*/
  //   return `#${Math.random().toString().slice(2, 8)}`;
}

function randomColors(e) {
  //evrey time the fucntion runs rest the array to get brand new colors
  initialColors = [];
  colorDivs.forEach((div) => {
    /*get each h2 in each div*/
    const hexText = div.children[0];
    const randColor = generateHex();
    //Add each starting color to the arr

    console.log(hexText.innerText);

    /*convert rgb value to hex value*/
    const formatToHex = chroma(randColor).hex();

    //if the div has locked which means the user click on the lock btn
    if (div.classList.contains('locked')) {
      //then we save the previos hex color because in this level we do have access to the previos one beacsue we werent changing it still
      initialColors.push(hexText.innerText);
      //continue the next iteration of the loop
      return;
    } else {
      initialColors.push(formatToHex);
    }

    /*set div color and color value*/
    div.style.backgroundColor = randColor;
    hexText.innerText = randColor;

    //check for contrast
    checkTextContrast(randColor, hexText);

    //Initalize colorize sliders
    const currColor = randColor;
    /*select all div inputs and style the background*/
    const divSliders = div.querySelectorAll('input[type="range"');
    const hueEl = divSliders[0];
    const brightnessEl = divSliders[1];
    const saturationEl = divSliders[2];

    colorizeSliders(currColor, hueEl, brightnessEl, saturationEl);
  });

  //match input value and  color to the correspending  div color when we refresh
  restInputs();

  //Adjust contrast of the lock and adjust btns based on the color
  adjustColorBtns.forEach((btn, idx) => {
    //get the color of each div based on the index of the button
    const divColor = initialColors[idx];
    checkTextContrast(divColor, btn);
    checkTextContrast(divColor, lockBtns[idx]);
  });

  //nice solution i made
  //   const iconsBtns = document.querySelectorAll('.controls i');
  //   iconsBtns.forEach((icon) => {
  //     const colorDiv =
  //       icon.parentElement.parentElement.parentElement.style.backgroundColor;
  //     checkTextContrast(colorDiv, icon);
  //   });
}

//Update the sliders to be in the exact value position after a refresh
function restInputs() {
  const allSliders = document.querySelectorAll('input[type="range"]');
  allSliders.forEach((slider) => {
    // console.log(slider.name);
    if (slider.name === 'hue') {
      const hueColor = initialColors[slider.getAttribute('data-hue')];
      //get the hue value from the current color with hsl() that return an array with the hue, brightness and sat values of a color
      const hueValue = chroma(hueColor).hsl()[0];
      slider.value = Math.floor(hueValue);
    } else if (slider.name === 'brightness') {
      const brightnessColor = initialColors[slider.getAttribute('data-bright')];
      const brightnessValue = chroma(brightnessColor).hsl()[2];
      slider.value = brightnessValue.toFixed(2);
    } else if (slider.name === 'saturation') {
      //get the data-set with different techinique
      const satColor = initialColors[slider.dataset.sat];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = satValue.toFixed(2);
    }
  });
}

/*colorize the hexadecimal value h tag to black or white based on the luminace*/
function checkTextContrast(color, text) {
  /*this method returns how bright the color is from 1(brightest) to 0(darkest)*/
  const luminance = chroma(color).luminance();
  console.log(luminance);
  if (luminance > 0.5) {
    text.style.color = 'black';
  } else {
    text.style.color = 'white';
  }
}

/*This fucntions dynamically colorize each slider to suit the level of bright and sat of the color*/
function colorizeSliders(color, hue, brightness, saturation) {
  /*Scale Saturation
  Get min and max saturation of each color and make scale image out of it*/
  const noSat = color.set('hsl.s', 0);
  const fullSat = color.set('hsl.s', 1);
  const scaleSat = chroma.scale([noSat, color, fullSat]);

  //Scale brightness -> hsl.l to get brightness
  //we know that black and white are the restritions
  const midBrightness = color.set('hsl.l', 0.5);
  const scaleBrightness = chroma.scale(['black', midBrightness, 'white']);

  //Update input colors
  saturation.style.backgroundImage = `linear-gradient(to right,${scaleSat(
    0
  )},${scaleSat(1)})`;

  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(
    0
  )}, ${scaleBrightness(0.5)}, ${scaleBrightness(1)})`;

  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204), rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;
}

function hslControls(e) {
  /*get idx of each slider*/
  const sliderIdx =
    e.target.getAttribute(`data-bright`) ||
    e.target.getAttribute('data-sat') ||
    e.target.getAttribute('data-hue');

  //get all the sliders in the specific div we change the range on
  let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');
  const hue = sliders[0];
  const brightness = sliders[1];
  const sat = sliders[2];

  //get initial color of the active div
  const bgHexColor = initialColors[sliderIdx];

  console.log('initial color', bgHexColor);
  //get the color to colorize the div uppon change in input range -> The color is always the original color
  let color = chroma(bgHexColor)
    .set('hsl.s', sat.value)
    .set('hsl.l', brightness.value)
    .set('hsl.h', hue.value);
  //   console.log('color', color);

  colorDivs[sliderIdx].style.backgroundColor = color;

  const activeDiv = colorDivs[sliderIdx];
  const h2TextEl = activeDiv.querySelector('h2');

  //colorize the brightness and the sat sliders gradient when the colors changed to the correct gradient
  colorizeSliders(color, hue, brightness, sat);

  //Live update of the hex value and color uppon change in the sliders
  updateTextUI(sliderIdx);
  checkTextContrast(color, h2TextEl);
  const icons = activeDiv.querySelectorAll('i');
  icons.forEach((icon) => {
    checkTextContrast(color, icon);
  });
}

//Update the h2 text with the current hex color
function updateTextUI(index) {
  const activeDiv = colorDivs[index];
  console.log('lol', activeDiv);
  const currentBgColor = activeDiv.style.backgroundColor;
  const color = chroma(currentBgColor).hex();
  const textHex = activeDiv.querySelector('h2');
  textHex.innerText = color;
}

//Copy to clipboard the hex color using a textArea
function copyToClipboard() {
  const textArea = document.createElement('textarea');
  const colorToCopy = this.innerText;
  textArea.value = colorToCopy;
  document.body.appendChild(textArea);
  //select all things in the text area
  textArea.select();
  //copy to clipboard command
  document.execCommand('copy');
  document.body.removeChild(textArea);
  console.log('copied!');

  //Popup UI -> could do copyPopup.style.display = 'flex';
  copyPopup.classList.add('active');
  setTimeout(() => {
    copyPopup.classList.remove('active');
  }, 2000);
}

//Show slider
function showAdjustmentPanel(e) {
  const activeDiv = e.target.parentElement.parentElement;
  const activeDivSlider = activeDiv.querySelector('.sliders');
  activeDivSlider.classList.toggle('active');
}

//Hide slider by clicking x
function closeAdjustmentPanel(e) {
  const activeDiv = e.target.parentElement.parentElement;
  const activeSlider = activeDiv.querySelector('.sliders');
  activeSlider.classList.remove('active');
}

//Add locked class and the UI for the lock palette button.
function controlLock(e, idx) {
  //get the actual i tag
  const lockSvg = e.target.children[0];
  const lockBtn = lockBtns[idx];
  console.log(lockSvg);
  //get active bg color and toggle if locked
  const activeBg = colorDivs[idx];
  activeBg.classList.toggle('locked');
  if (lockSvg.classList.contains('fa-lock-open')) {
    lockBtn.innerHTML = `<i class="fas fa-lock"></i>`;
  } else {
    lockBtn.innerHTML = `<i class="fas fa-lock-open"></i>`;
  }
}

//Dynamic functions to close and open the panels for adding pallette and library
function openPanel(containerNameEl) {
  containerNameEl.classList.add('active');
}

function closePanel(containerNameEl) {
  containerNameEl.classList.remove('active');
}

//Save the colors i want to a palette and construct a paletteObj
function savePalette(e) {
  //Rest the colors that we want save evreytime a user click to save a plette
  const colorsToSave = [];
  const paletteName = saveInputEl.value;
  if (paletteName === '' || paletteName === null) {
    alert('Please add a palette name');
    return;
  }
  //get the current hex colors
  currentHexes.forEach((hexColor) => {
    colorsToSave.push(hexColor.innerText);
  });

  let paletteNum;
  const palletesFromStorage = JSON.parse(localStorage.getItem('palettes'));
  if (palletesFromStorage) {
    console.log('len', palletesFromStorage.length);
    paletteNum = palletesFromStorage.length;
  } else {
    paletteNum = savedPalette.length;
  }
  //consturct a palette obj with the data i need
  const paletteObj = {
    name: paletteName,
    colors: colorsToSave,
    num: paletteNum,
  };

  savedPalette.push(paletteObj);
  //Save to localstorage
  saveToLocal(paletteObj);

  //Clear input and hide popup after submission
  saveInputEl.value = '';
  savePopupContainer.classList.remove('active');

  //Generate the palette for library
  const palette = document.createElement('div');
  palette.classList.add('custom-palette');
  const title = document.createElement('h4');
  title.innerText = paletteObj.name;
  //this div will hold a group of divs
  const preview = document.createElement('div');
  preview.classList.add('small-preview');
  //Create a div for each color and colorize it and append it to the preview
  paletteObj.colors.forEach((color) => {
    console.log('inside', color);
    const smallColorDiv = document.createElement('div');
    smallColorDiv.style.backgroundColor = color;
    preview.appendChild(smallColorDiv);
  });
  const paletteBtn = document.createElement('button');
  paletteBtn.classList.add('pick-palette-btn');
  /*Adding a num to the class of the button in order to know which btn i click -> genious approach!*/
  paletteBtn.classList.add(paletteObj.num);
  paletteBtn.innerText = 'Select';

  /*Ed's way*/
  paletteBtn.addEventListener('click', (e) => {
    closePanel(libraryPopupContainer);
    //get which btn i clicked on based on the idx on the classlist
    const paletteIdx = e.target.classList[1];
    //rest the arr each time
    initialColors = [];
    savedPalette[paletteIdx].colors.forEach((color, idx) => {
      initialColors.push(color);
      //style each div and check contrast when we select a new palette
      colorDivs[idx].style.backgroundColor = color;
      const h2HexTag = currentHexes[idx];
      checkTextContrast(color, h2HexTag);
      updateTextUI(idx);
    });
    restInputs();
  });

  //Append the  custom pallete to the library
  palette.appendChild(title);
  palette.appendChild(preview);
  palette.appendChild(paletteBtn);
  libraryPopup.appendChild(palette);
}

function saveToLocal(palette) {
  let palettes;
  //check if we have palettes in localStorage already
  if (localStorage.getItem('palettes') === null) {
    palettes = [];
  } else {
    //if we do parse the palettes back to JS array
    palettes = JSON.parse(localStorage.getItem('palettes'));
  }
  palettes.push(palette);
  //Save the updated palette arr to localStorage
  localStorage.setItem('palettes', JSON.stringify(palettes));
}

function getLocal() {
  let palletes;
  if (localStorage.getItem('palettes') === null) {
    palettes = [];
  } else {
    //if we do parse the palettes back to JS array
    palletes = JSON.parse(localStorage.getItem('palettes'));
    palletes.forEach((paletteObject) => {
      const palette = document.createElement('div');
      palette.classList.add('custom-palette');
      const title = document.createElement('h4');
      title.innerText = paletteObject.name;
      //this div will hold a group of divs
      const preview = document.createElement('div');
      preview.classList.add('small-preview');
      //Create a div for each color and colorize it and append it to the preview
      paletteObject.colors.forEach((color) => {
        console.log('inside', color);
        const smallColorDiv = document.createElement('div');
        smallColorDiv.style.backgroundColor = color;
        preview.appendChild(smallColorDiv);
      });
      const paletteBtn = document.createElement('button');
      paletteBtn.classList.add('pick-palette-btn');
      /*Adding a num to the class of the button in order to know which btn i click -> genious approach!*/
      paletteBtn.classList.add(paletteObject.num);
      console.log('kkkk', paletteObject.num);
      paletteBtn.innerText = 'Select';

      paletteBtn.addEventListener('click', (e) => {
        closePanel(libraryPopupContainer);
        //get which btn i clicked on based on the idx on the classlist
        const paletteIdx = e.target.classList[1];
        console.log(paletteIdx);
        //rest the arr each time
        initialColors = [];
        paletteObject.colors.forEach((color, idx) => {
          initialColors.push(color);
          //style each div and check contrast when we select a new palette
          colorDivs[idx].style.backgroundColor = color;
          const h2HexTag = currentHexes[idx];
          checkTextContrast(color, h2HexTag);
          updateTextUI(idx);
        });
        restInputs();
      });

      palette.appendChild(title);
      palette.appendChild(preview);
      palette.appendChild(paletteBtn);
      libraryPopup.appendChild(palette);
    });
  }
}

//clear all library from localStorage
function clearLibrary() {
  //check if palletes exists
  if (localStorage.getItem('palettes') !== null) {
    const allPalettes = libraryPopup.querySelectorAll('.custom-palette');
    console.log('all', allPalettes);
    allPalettes.forEach((div) => {
      div.classList.add('fade-palette');
      //only after the transition has ended i clear the local storage and remove the divs from the DOM.
      div.addEventListener('transitionend', () => {
        localStorage.clear();
        div.remove();
      });
    });
  } else {
    alert('The library is empty ;]');
  }
}

//Event listeners

allSliders.forEach((slider) => {
  slider.addEventListener('input', hslControls);
});

allSliders.forEach((slider) => {
  slider.addEventListener('change', updateTextUI);
});

currentHexes.forEach((hexText) => {
  hexText.addEventListener('click', copyToClipboard);
});

adjustColorBtns.forEach((btn) => {
  btn.addEventListener('click', showAdjustmentPanel);
});

showSliderCloseBtns.forEach((btn) => {
  btn.addEventListener('click', closeAdjustmentPanel);
});

lockBtns.forEach((btn, idx) => {
  btn.addEventListener('click', (e) => {
    controlLock(e, idx);
  });
});

/*Panel event listerners*/
generateBtn.addEventListener('click', randomColors);
saveBtn.addEventListener('click', () => {
  openPanel(savePopupContainer);
});
closeSaveBtn.addEventListener('click', (e) => {
  closePanel(savePopupContainer);
});

submitSaveBtn.addEventListener('click', savePalette);

openLibraryBtn.addEventListener('click', () => {
  openPanel(libraryPopupContainer);
});

closeLibraryBtn.addEventListener('click', () => {
  closePanel(libraryPopupContainer);
});

// window.addEventListener('DOMContentLoaded', getLocal);

getLocal();
randomColors();

//Alternative solution to show slider panel
// const sliderContainers = document.querySelectorAll('.sliders');
// adjustColorBtns.forEach((btn, idx) => {
//   btn.addEventListener('click', () => {
//     showAdjustAlternative(idx);
//   });
// });

// function showAdjustAlternative(idx) {
//     sliderContainers[idx].classList.toggle('active');
// }

// function closeAdjusmentAlternative(idx) {
//     slidersContainers[idx].classList.remove('active')
// }

// let isClicked = false;
// function controlLock(idx) {
//   isClicked = !isClicked;
//   //get the specifiec lock icon we clicked on
//   const lockIcon = lockBtns[idx];
//   //get active bg color and toggle if locked
//   const activeBg = colorDivs[idx];
//   activeBg.classList.toggle('locked');
//   if (isClicked) {
//     lockIcon.innerHTML = `<i class="fas fa-lock"></i>`;
//   } else {
//     lockIcon.innerHTML = `<i class="fas fa-lock-open"></i>`;
//   }
// }

//My way of changing colors
//add event listener to each select btn
// libraryPopup.querySelectorAll('.pick-palette-btn').forEach((btn) => {
//   btn.addEventListener('click', (e) => {
//     const divSmallPreview = e.target.parentElement.querySelector(
//       '.small-preview'
//     );
//     //get the colors of the smallPreview for each palette
//     const previewColors = divSmallPreview.querySelectorAll('div');
//     pickFromPalette(previewColors);
//     libraryPopupContainer.classList.remove('active');
//   });
// });

// function pickFromPalette(previewColors) {
//   const colors = [];
//   //get all the colors from each smallDiv
//   previewColors.forEach((colorDiv, idx) => {
//     const color = colorDiv.style.backgroundColor;
//     colors.push(color);
//   });
//   //colorize each div with the correspend smallpreview color;
//   colorDivs.forEach((div, idx) => {
//     div.style.backgroundColor = colors[idx];
//     //update hexColor after selection
//     const hexColorTag = currentHexes[idx];
//     const color = chroma(colors[idx]).hex();
//     hexColorTag.innerText = color;
//     checkTextContrast(color, hexColorTag);
//   });
// }
