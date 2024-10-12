console.log("JavaScript");

let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`/${folder}/`);
  let res = await a.text();
  // console.log(res)
  let div = document.createElement("div");
  div.innerHTML = res;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }
  // show all the songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li>
        
                <img class="invert" src="/img/music.svg" alt="" />
                <div class="info">
                  <div>${song
                    .replaceAll("%20", " ")
                    .replaceAll("%2C", ",")} </div>
                  <div>Song Artist</div>
                </div>
                <div class="playnow">
                  <span>Play now</span>
                  <img class="invert" src="img/play.svg" alt="">
                </div>

        </li>`;
  }

  // attach an event listener to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });
}

const playMusic = (track, pause = false) => {
  // let audio = new Audio("/songs/" + track)
  // audio.play();
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "/img/pause.svg";
  }
  document.querySelector(".songsInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
};

async function displayAlbums() {
  let a = await fetch(`/songs`);
  let res = await a.text();
  let div = document.createElement("div");
  div.innerHTML = res;
  let anchor = div.getElementsByTagName("a");
  // console.log(anchor);
  let cardContainer = document.querySelector(".cardContainer");
  let array = Array.from(anchor);
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs/")) {
      console.log(e.href.split("/").slice(-1)[0]);
      let folder = e.href.split("/").slice(-1)[0];

      // get the meta data of each folder
      let a = await fetch(`/songs/${folder}/info.json`);
      let res = await a.json();
      // console.log(res)
      cardContainer.innerHTML =
        cardContainer.innerHTML +
        `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 20V4L19 12L5 20Z"
                    stroke="#141834"
                    stroke-width="1.5"
                    fill="#000"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>
              <img
                src="/songs/${folder}/cover.jpg"
                alt=""
              />
              <h2>${res.title}</h2>
              <p>${res.description}</p>
            </div>`;
    }
  }
  // Load the playlist whenever card is clicked
  Array.from(document.getElementsByClassName("card")).forEach((e) => {
    e.addEventListener("click", async (item) => {
      songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
    });
  });
}

(async function main() {
  //get lists of songs
  await getSongs(`songs/fuji_kaze`);
  playMusic(songs[0], true);

  // Display all albums
  displayAlbums();

  // attach an event listener to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/img/play.svg";
    }
  });
  // Add an event listener to play previous & next song
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("prev clicked");
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });
  next.addEventListener("click", () => {
    console.log("next clicked");
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 <= songs.length - 1) {
      playMusic(songs[index + 1]);
    }
  });

  // Listen for timeupdate event
  currentSong.addEventListener("timeupdate", () => {
    // console.log(currentSong.currentTime , currentSong.duration)
    document.querySelector(".songTime").innerHTML =
      `${secondsToMinutesSeconds(currentSong.currentTime)}` +
      " / " +
      `${secondsToMinutesSeconds(currentSong.duration)}`;

    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listener to the seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listener for opening hamburger menu
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = 0;
  });
  // Add an event listener for closing hamburger menu
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Adding an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting Volume to :", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

    // Adding an event to mute song
    document.querySelector(".volume>img").addEventListener("click",(e)=> { 
      if(e.target.src.includes("img/volume.svg")){
        e.target.src = "img/mute.svg";
        currentSong.volume = 0;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0
      }
      else{
        e.target.src = "img/volume.svg";
        currentSong.volume = 0.1;
        document.querySelector(".range").getElementsByTagName("input")[0].value = 10
      }
    })
})();
