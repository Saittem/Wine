//Age verification date prefill
const today = new Date();
document.getElementById("ageDate").valueAsDate = today;

function checkAge(){
    const userDate = new Date(document.getElementById("ageDate").value);
    
    if (userDate.getFullYear() < (today.getFullYear() - 18)){
        OldEnough();
    }
    else if(userDate.getFullYear() == (today.getFullYear() - 18)){
        if (userDate.getMonth() <= today.getMonth()){
            if (userDate.getDate() <= today.getDate()){
                OldEnough();
            }
            else{
                notOldEnough();
            }
        }
        else{
            notOldEnough();
        }
    }
    else{
        notOldEnough();
    }
}
const normalMode = document.getElementById("normalMode");

function notOldEnough(){
    const babyMode = document.getElementById("babyMode");

    normalMode.style.display = "none";
    babyMode.style.display = "";
}

function OldEnough(){
    const loadingMode = document.getElementById("loadingMode");
    const transition = document.getElementById("transitionAnimation");
    const winePour = document.getElementById("wine-pour");
    const wineFill = document.getElementById("wine-fill");
    const ageVerificationSection = document.getElementById("ageVerificationSection");
    const mainPageSection = document.getElementById("mainPageSection");

    normalMode.style.display = "none";
    loadingMode.style.display = "";
    transition.style.display = "";

    setTimeout(() => {
        winePour.style.animation = "pour 1s linear forwards";
        wineFill.style.animation = "fill 1.5s linear forwards 1s";
    }, 1500);

    setTimeout(() => {
        transition.style.display = "none";
        winePour.style.animation = "none";
        wineFill.style.animation = "none";
        ageVerificationSection.style.display = "none";
        mainPageSection.style.display = "";
    }, 5000);
}


//Baby mode
function babyHappy(){
    const babyImg = document.getElementById("babyImg");
    const babySound = new Audio("Assets/baby-laughing.mp3");

    babySound.play();
    babyImg.src = "Assets/baby-happy.png";
    babyImg.style.animation = "babyAnimation 500ms infinite ease-in-out";

    setTimeout(() => {
        babyImg.src = "Assets/baby-idle.png";
        babyImg.style.animation = "none";
        babySound.pause;
    }, 2000);
}


//scroll button
let frontPageHeight;
const mobileCheck = navigator.userAgentData.mobile;
const drinkingCount = document.getElementById("drinkingCount");
const frenchMusicButton = document.getElementById("frenchMusic");
const musicButtonMobile = document.getElementById("musicButtonMobile");
const drinkText = document.getElementById("drinkText");

if (mobileCheck){
    let scrollArrow = document.getElementById("scrollArrow");

    scrollArrow.style.display = "none";
    drinkingCount.style.display = "none";
    frenchMusicButton.style.display = "none";
    musicButtonMobile.style.display = "";
    drinkText.style.marginTop = "3vh";
    drinkText.style.fontSize = "4vh";
}
else{
    function preventScroll(event) {
        event.preventDefault();
    }
}


/*function scrollButtonDown() {
    frontPageHeight = document.getElementById("frontPage").clientHeight;
    console.log(frontPageHeight);
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        window.scrollTo({ top: frontPageHeight, behavior: "smooth" });
    }, 100);
}

function scrollButtonUp(){
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
}

document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
});*/


//card effect
let cards = document.querySelectorAll(".card");

function rotate(cursorPosition, centerPosition, threshold = 20) {
  if (cursorPosition - centerPosition >= 0) {
    return (cursorPosition - centerPosition) >= threshold ? threshold : (cursorPosition - centerPosition);
  } else {
    return (cursorPosition - centerPosition) <= -threshold ? -threshold : (cursorPosition - centerPosition);
  }
}

cards.forEach(card => {
  card.addEventListener("mousemove", function (event) {
    let rect = card.getBoundingClientRect();
    let centerX = rect.left + rect.width / 2;
    let centerY = rect.top + rect.height / 2;

    card.style.transform = `perspective(1000px)
      rotateY(${rotate(event.x, centerX)}deg)
      rotateX(${-rotate(event.y, centerY)}deg)`;
    card.style.transition = "scale 500ms";
    card.style.scale = "1.3";
  });

  card.addEventListener("mouseleave", function (event) {
    card.style.transform = `perspective(500px)`;
    card.style.width = "20vh";
    card.style.height = "30vh";
    card.style.scale = "1";
  });
});


//drinking function
const drinkText2 = document.getElementById("drinkText2");
const drinkButton = document.getElementById("drinkButton");
const wineText = document.getElementById("wineText");
const wineSelection = document.getElementById("wineSelection");
const contentBody = document.getElementById("contentBody");
const pouringImage = document.getElementById("pouringImage");
const bodyBackButton = document.getElementById("bodyBackButton");
const buyButton = document.getElementById("buyButton");
let type;
const whiteWine = ["šumivé víno", "suché bílé víno", "sladké bílé víno", "bohaté bílé víno"];
const redWine = ["lehce červené víno", "středně červené víno", "dezertní víno"];
let drinkCount = 0;
let chosenWineName;

function wineChosen(wineName){
    chosenWineName = wineName;
    wineText.style.display = "none";
    wineSelection.style.display = "none";
    drinkText.style.display = "";
    buyButton.style.display = "";
    
    if (!mobileCheck){
        drinkText2.style.display = "";
        contentBody.style.display = "flex";
        contentBody.style.justifyContent = "center";
        contentBody.style.alignItems = "center"
    }
    else{
        contentBody.style.textAlign = "center";
    }

    drinkButton.style.display = "";
    bodyBackButton.style.display = "";
    contentBody.style.gap = "5vh";

    drinkText.innerHTML = "Vybrali jste si " + wineName + ".";

    if (whiteWine.includes(wineName)){
        type = "white";
    }
    else if (redWine.includes(wineName)){
        type = "red";
    }
}

const frenchMusicRange = document.getElementById("audioVolume");
const frenchMusic = new Audio("Assets/french-music.mp3");
let isPlaying = false;
let musicVolume = 0;

function drink(){
    const pouringSound = new Audio("Assets/pouring-wine.mp3");
    pouringSound.addEventListener("ended", pouringAudioEnded);

    if (type == "red"){
        pouringImage.src = "Assets/pouring-wine-red.svg";
    }
    else if (type == "white"){
        pouringImage.src = "Assets/pouring-wine-white.svg";
    }

    drinkText.style.display = "none";
    drinkText2.style.display = "none";
    drinkButton.style.display = "none";
    bodyBackButton.style.display = "none";
    pouringImage.style.display = "";
    buyButton.style.display = "none";
    buyButton.style.display = "none";

    if (isPlaying){
        musicVolume = frenchMusic.volume;
        frenchMusic.volume = 0.1;
        pouringSound.play();
    }
    else{
        pouringSound.play();
    }

    changeDrinkCount();
}

function pouringAudioEnded(){
    frenchMusic.volume = musicVolume;
    drinkText.style.display = "";
    
    if(!mobileCheck){
        drinkText2.style.display = "";
    }

    drinkButton.style.display = "";
    bodyBackButton.style.display = "";
    pouringImage.style.display = "none";
    buyButton.style.display = "";
}

function bodyBack(){
    wineText.style.display = "";
    wineSelection.style.display = "";
    drinkText.style.display = "none";
    drinkText2.style.display = "none";
    drinkButton.style.display = "none";
    bodyBackButton.style.display = "none";
    contentBody.style.alignItems = "";
    contentBody.style.gap = "";
    buyButton.style.display = "none";
}

let playButton = document.getElementById("playButton");

function changeDrinkCount(){
    const drinkCounter = document.getElementById("drinkCount");
    drinkCount += 1;

    drinkCounter.innerHTML = "Počet vypití: " + drinkCount;

    if(drinkCount >= 5 && !mobileCheck){
        playButton.style.display = "";
        playButton.style.animation = "playButtonOpacity 250ms ease-in";
    }
}

//french music
frenchMusic.loop = true;

frenchMusicRange.oninput = function(){
    frenchMusic.volume = this.value / 100;
}

function playFrench(){
    if (!isPlaying){
        frenchMusic.play();
    }
    else{
        frenchMusic.pause();
    }

    isPlaying = !isPlaying;
}

document.getElementById("playButton").addEventListener("click", function(){
    frenchMusic.play();
});


//buy wine
const buyBackButton = document.getElementById("buyBackButton");

function buyWine(){
    drinkText.innerHTML = "Pokud is chcete koupit " + chosenWineName + ", kontaktujte nás na:<br>+420 123 456 798.";
    buyBackButton.style.display = "";
    
    if(!mobileCheck){
        drinkText2.style.display = "none";
    }

    drinkButton.style.display = "none";
    bodyBackButton.style.display = "none";
    buyButton.style.display = "none";
}

function buyBack(){
    drinkText.innerHTML = "Vybrali jste si " + chosenWineName + ".";
    buyBackButton.style.display = "none";
    
    if(!mobileCheck){
        drinkText2.style.display = "";
    }

    drinkButton.style.display = "";
    bodyBackButton.style.display = "";
    buyButton.style.display = "";
}