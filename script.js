let currentsong = new Audio();
let songs;
let currFolder;
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
async function getsongs(folder) {
  currFolder=folder;
  let a = await fetch(`/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const Element = as[index];
    if (Element.href.endsWith(".mp3")) {
      let filename = Element.href.split("/").pop().split("%5C").pop();
      songs.push(decodeURIComponent(filename));
      // songs.push(
      //   Element.href
      //     .split(`/${folder}/`)[1]
      //     .replaceAll("%20", " ")
      //     .replaceAll("%5C", "")
      //     .replaceAll("%5c", "")
      //     .replaceAll("/", ""),
      // );
    }
  }
  return songs;
}
const playmusic = (track,pause=false) => {
  currentsong.src = `/${currFolder}/` + track;
  if(!pause){
      currentsong.play();
      play.src="/img/"+"pause.svg"
  }
   document.querySelector(".songinfo").innerHTML=track
   document.querySelector(".songtime").innerHTML="00:00/00:00"

};

async function main() {
  songs = await getsongs("songs/Alanwalker");
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
    document.querySelector(".songtime").innerHTML=`${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
    document.querySelector(".circle").style.left=100*(currentsong.currentTime/currentsong.duration)+"%"
  })
  document.querySelector(".seekbar").addEventListener("click",e=>{
    let percent=(e.offsetX/e.target.getBoundingClientRect().width)*100
    document.querySelector(".circle").style.left=percent+"%";
    currentsong.currentTime=((currentsong.duration)*percent)/100
  })
  document.querySelector(".hamburger").addEventListener("click",()=>{
    document.querySelector(".left").style.left="0";
  })
  document.querySelector(".closebar").addEventListener("click",()=>{
    document.querySelector(".left").style.left="-110%";
  })


  previous.addEventListener("click", () => {
  let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
  let index = songs.indexOf(currentFileName);
  console.log(index);
  if (index - 1 >= 0) {
    playmusic(songs[index - 1]);
  }
});

next.addEventListener("click", () => {
  let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
  let index = songs.indexOf(currentFileName);
  console.log(index);
  if (index + 1 < songs.length) {
    playmusic(songs[index + 1]);
  }
});
  // previous.addEventListener("click",()=>{
  //   let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0].replaceAll("%20"," "))
  //   console.log(index)
  //   if ((index-1) >=0){
  //     playmusic(songs[index-1])
  //   }
  // })
  // next.addEventListener("click",()=>{
  //   let index=songs.indexOf(currentsong.src.split("/").slice(-1)[0].replaceAll("%20"," "))
  //   console.log(index)
  //   if ((index+1) < songs.length){
  //     playmusic(songs[index+1])
  //   }
  // })
  // document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change",(e)=>{
  //   currentsong.volume=parseInt(e.target.value)/100;
  // })

  


}
main();
