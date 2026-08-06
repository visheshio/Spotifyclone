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
            songs.push(Element.href)
        }
        
    }
    return songs;
}
getsongs()

async function main() {
    let songs= await getsongs()
    console.log(songs)

    var audio= new audio(songs[0])
    audio.play()                
    
}