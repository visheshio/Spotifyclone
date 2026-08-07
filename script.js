let currentsong = new Audio();
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
async function getsongs() {
  let a = await fetch("http://127.0.0.1:3000/songs/");
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  let songs = [];
  for (let index = 0; index < as.length; index++) {
    const Element = as[index];
    if (Element.href.endsWith(".mp3")) {
      songs.push(
        Element.href
          .split("songs")[1]
          .replaceAll("%20", " ")
          .replaceAll("%5C", "")
          .replaceAll("%5c", "")
          .replaceAll("/", ""),
      );
    }
  }
  return songs;
}
const playmusic = (track,pause=false) => {
  currentsong.src = "/songs/" + track;
  if(!pause){
      currentsong.play();
      play.src="/img/"+"pause.svg"
  }
   document.querySelector(".songinfo").innerHTML=track
   document.querySelector(".songtime").innerHTML="00:00/00:00"

};

async function main() {
  let songs = await getsongs();
  playmusic(songs[0],true)
  console.log(songs);
  let SongUl = document
    .querySelector(".songlist")
    .getElementsByTagName("ul")[0];
  for (const song of songs) {
    SongUl.innerHTML =
      SongUl.innerHTML +
      `<li>
        <img src="img/music.svg" alt="">
        <div class="info">
        <div>${song}</div>
        <div>Alan Walker</div>
        </div>
                    <div class="playnow">
                    <span>Play Now</span>
                        <img src="img/playsong.svg" alt="">
                    </div>
                    </li>`;
  }
  Array.from(
    document.querySelector(".songlist").getElementsByTagName("li"),
  ).forEach((e) => {
    e.addEventListener("click", (Element) => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playmusic(e.querySelector(".info").firstElementChild.innerHTML);
    });
  });

  play.addEventListener("click",()=>{
    if(currentsong.paused){
        currentsong.play()
        play.src="/img/"+"pause.svg"
    }
    else{
        currentsong.pause()
        play.src="/img/"+"playsong.svg"
    }
  })
  currentsong.addEventListener("timeupdate",()=>{
    console.log(currentsong.currentTime,currentsong.duration);
    document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left=100*(currentsong.currentTime/currentsong.duration)+"%"
  })
  document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
    document.querySelector(".circle").style.left=percent+"%";
    currentsong.currentTime=((currentsong.duration)*percent)/100
  })

}

main();
