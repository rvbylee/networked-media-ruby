const scenes = {
  morning: document.getElementById("morning"),
  noon: document.getElementById("noon"),
  sunset: document.getElementById("sunset"),
  night: document.getElementById("night")
};

const musicTracks = {
  morning: new Audio("assets/morning.mp3"),
  noon: new Audio("assets/noon.mp3"),
  sunset: new Audio("assets/sunset.mp3"),
  night: new Audio("assets/night.mp3")
};

let currentMusic = null;
let isMuted = false;
let currentSceneIndex = 0;
const sceneOrder = ["morning", "noon", "sunset", "night"];

function updateRoom(scene) {
  for (const key in scenes) {
    scenes[key].classList.remove("active");
  }
  scenes[scene].classList.add("active");
  setMusic(scene);
}

function setMusic(scene) {
  if (isMuted) return;
  if (currentMusic) {
    currentMusic.pause();
    currentMusic.currentTime = 0;
  }
  currentMusic = musicTracks[scene];
  currentMusic.loop = true;
  currentMusic.volume = 0.4;
  currentMusic.play().catch(() => {
    console.log("waiting for click");
  });
}

const muteButton = document.getElementById("muteButton");
muteButton.addEventListener("click", () => {
  isMuted = !isMuted;
  if (isMuted) {
    if (currentMusic) currentMusic.pause();
    muteButton.src = "assets/unmute.png";
  } else {
    setMusic(sceneOrder[currentSceneIndex]);
    muteButton.src = "assets/mute.png";
  }
});


function cycleScenes() {
  const scene = sceneOrder[currentSceneIndex];
  updateRoom(scene);
  currentSceneIndex = (currentSceneIndex + 1) % sceneOrder.length;
}


document.body.addEventListener(
  "click",
  () => {
    cycleScenes(); 
    setInterval(cycleScenes, 8000); // Change every 8 seconds
  },
  { once: true }
);








