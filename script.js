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
let isOnBottom = false;
const frontPageImageHeight = document.getElementById("frontPageImage").clientHeight;


function scrollButtonDown() {
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        window.scrollTo({ top:frontPageImageHeight, behavior: "smooth" });
    }, 100);
}

function scrollButtonUp(){
    clearTimeout(window.scrollTimeout);
    window.scrollTimeout = setTimeout(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
}

function preventScroll(event) {
    event.preventDefault();
}

document.addEventListener("DOMContentLoaded", () => {
    window.addEventListener("wheel", preventScroll, { passive: false });
    window.addEventListener("touchmove", preventScroll, { passive: false });
});

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
const drinkText = document.getElementById("drinkText");
const drinkButton = document.getElementById("drinkButton");
const wineText = document.getElementById("wineText");
const wineSelection = document.getElementById("wineSelection");
const contentBody = document.getElementById("contentBody");
const pouringImage = document.getElementById("pouringImage");
let type;
const whiteWine = ["šumivé víno", "suché bílé víno", "sladké bílé víno", "bohaté bílé víno"];
const redWine = ["lehce červené víno", "středně červené víno", "dezertní víno"];
let drinkCount = 0;

function wineChosen(wineName){
    wineText.style.display = "none";
    wineSelection.style.display = "none";
    drinkText.style.display = "";
    drinkButton.style.display = "";
    contentBody.style.display = "flex";
    contentBody.style.justifyContent = "center";
    contentBody.style.alignItems = "center"
    contentBody.style.gap = "5vh";

    drinkText.innerHTML = "Vybrali jste si " + wineName + ".";

    if (whiteWine.includes(wineName)){
        type = "white";
    }
    else if (redWine.includes(wineName)){
        type = "red";
    }
}

function pouringAudioEnded(){
    drinkText.style.display = "";
    drinkButton.style.display = "";
    pouringImage.style.display = "none";
}

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
    drinkButton.style.display = "none";
    pouringImage.style.display = "";
    pouringSound.play();
    drinkCount += 1;
}