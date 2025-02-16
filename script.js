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