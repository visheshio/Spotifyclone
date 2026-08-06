async function getsongs() {
    let a= await fetch("http://127.0.0.1:3000/songs/");
    let response=await a.text();
    let div =document.createElement("div")
    div.innerHTML=response;
    let as=div.getElementsByTagName("a")
    let songs=[]
    for (let index = 0; index < as.length; index++) {
        const Element =as[index]
        if (Element.href.endsWith(".mp3"))
        {
            songs.push(Element.href.split("songs")[1].replaceAll("%20"," ").replaceAll("%5C", "").replaceAll("%5c", "").replaceAll("/", ""));
        }
        
    }
    return songs;
}
getsongs()

async function main() {
    let songs= await getsongs();
    console.log(songs);

    let SongUl=document.querySelector(".songlist").getElementsByTagName("ul")[0]
    for (const song  of songs){
        SongUl.innerHTML=SongUl.innerHTML + `<li> ${song}</li>`;
    }
    var audio= new Audio(songs[0]);
    audio.play();

     audio.addEventListener("loadeddata", ()=>{
        console.log(audio.duration,audio.currentSrc,audio.currentTime);
    })

}
main()