function updateRoom() {
    const now = new Date();
    const hour = now.getHours();
    const scenes = {
        morning: document.getElementById("morning"),
        noon: document.getElementById("noon"),
        sunset: document.getElementById("sunset"),
        night: document.getElementById("night"),
    };

    for (const key in scenes) {
        scenes[key].classList.remove("active");
    }

    if (hour >= 6 && hour < 10) {
        scenes.morning.classList.add("active");
    } else if (hour >= 10 && hour < 16) {
        scenes.noon.classList.add("active");
    } else if (hour >= 16 && hour < 20) {
        scenes.sunset.classList.add("active");
    } else {
        scenes.night.classList.add("active");
    }
}

updateRoom();
setInterval(updateRoom, 50000);

const musicTracks = {
    morning: new Audio("assets/morning.mp3"),
    noon: new Audio("assets/noon.mp3"),
    sunset: new Audio("assets/sunset.mp3"),
    night: new Audio("assets/night.mp3"),
};

let currentMusic = null;
let isMuted = false;

function setMusic(scene) {
    if (isMuted) return;

    if (currentMusic && !currentMusic.paused) {
        currentMusic.pause();
        currentMusic.currentTime = 0;
    }

    currentMusic = musicTracks[scene];
    currentMusic.loop = true;
    currentMusic.volume = 0.4;
    currentMusic.play().catch(() => {
        console.log("start music");
    });
}

const muteButton = document.getElementById("muteButton");

muteButton.addEventListener("click", () => {
    isMuted = !isMuted;

    if (isMuted) {
        if (currentMusic) currentMusic.pause();
        muteButton.src = "assets/unmute.png";
    } else {
        const now = new Date();
    const hour = now.getHours();
    if (hour >= 6 && hour < 10) setMusic("morning");
    else if (hour >= 10 && hour < 16) setMusic("noon");
    else if (hour >= 16 && hour < 20) setMusic("sunset");
    else setMusic("night");
    muteButton.src = "assets/mute.png";
    }
});



document.body.addEventListener("click", () => {
    const now = new Date();
    const hour = now.getHours();

    if (isMuted) return;

    if (hour >= 6 && hour < 10) setMusic("morning");
    else if (hour >= 10 && hour < 16) setMusic("noon");
    else if (hour >= 16 && hour < 20) setMusic("sunset");
    else setMusic("night");
}, { once: true });









