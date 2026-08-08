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
    currFolder = folder;
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
        }
    }

    // Update the sidebar song list with the loaded songs
    let SongUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    SongUl.innerHTML = "";
    for (const song of songs) {
        // Extract a clean display name from the filename
        let displayName = song.replace(".mp3", "");
        SongUl.innerHTML += `<li>
            <img src="img/music.svg" alt="">
            <div class="info">
                <div>${displayName}</div>
                <div>Artist</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="img/playsong.svg" alt="">
            </div>
        </li>`;
    }

    // Attach click listeners to each song in the list
    Array.from(
        document.querySelector(".songlist").getElementsByTagName("li")
    ).forEach((e) => {
        e.addEventListener("click", () => {
            // Match the song by its display name back to the filename
            let displayName = e.querySelector(".info").firstElementChild.innerHTML;
            let matchedSong = songs.find(s => s.replace(".mp3", "") === displayName);
            if (matchedSong) {
                playmusic(matchedSong);
            }
        });
    });

    return songs;
}

const playmusic = (track, pause = false) => {
    currentsong.src = `/${currFolder}/` + encodeURIComponent(track);
    if (!pause) {
        currentsong.play();
        play.src = "/img/pause.svg";
    }
    // Show clean song name (strip .mp3 extension)
    let displayName = track.replace(".mp3", "");
    document.querySelector(".songinfo").innerHTML = displayName;
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

/**
 * Scans the /songs/ directory on the server, discovers album folders,
 * and dynamically creates playlist cards for each album found.
 */
async function displayAlbums() {
    console.log("Scanning for albums...");
    try {
        let response = await fetch(`/songs/`);
        let html = await response.text();
        let div = document.createElement("div");
        div.innerHTML = html;
        let anchors = div.getElementsByTagName("a");
        let cardContainer = document.querySelector(".cardContainer");

        for (let index = 0; index < anchors.length; index++) {
            const anchor = anchors[index];
            // Look for links that point to subdirectories inside /songs/
            if (anchor.href.includes("/songs/") && !anchor.href.includes(".htaccess") && !anchor.href.endsWith(".mp3")) {
                let folder = anchor.href.split("/").filter(Boolean).pop();

                // Skip if not a real folder name or is the parent directory link
                if (!folder || folder === "songs") continue;

                // Try to load info.json for metadata; fall back to folder name
                let title = folder;
                let description = "Click to play";
                let coverSrc = "";
                try {
                    let infoResponse = await fetch(`/songs/${folder}/info.json`);
                    if (infoResponse.ok) {
                        let info = await infoResponse.json();
                        title = info.title || folder;
                        description = info.description || description;
                    }
                } catch (e) {
                    // info.json doesn't exist, use defaults
                }

                // Try to load cover image; fall back to a placeholder
                try {
                    let coverResponse = await fetch(`/songs/${folder}/cover.jpg`);
                    if (coverResponse.ok) {
                        coverSrc = `/songs/${folder}/cover.jpg`;
                    }
                } catch (e) {
                    coverSrc = "";
                }

                // Only add the card if it doesn't already exist in the HTML
                let existingCard = cardContainer.querySelector(`[data-folder="${folder}"]`);
                if (!existingCard) {
                    let coverImg = coverSrc
                        ? `<img src="${coverSrc}" alt="${title}">`
                        : `<div style="width:100%;height:120px;background:#333;border-radius:10px;display:flex;align-items:center;justify-content:center;color:#888;font-size:40px;">♫</div>`;

                    cardContainer.innerHTML += `
                        <div data-folder="${folder}" class="card">
                            <div class="play-btn">
                                <img src="./img/play.svg" alt="">
                            </div>
                            ${coverImg}
                            <h4>${title}</h4>
                            <p>${description}</p>
                        </div>`;
                }
            }
        }
    } catch (error) {
        console.log("Could not scan /songs/ directory:", error);
    }
}

async function main() {
    // Discover and display album cards dynamically
    await displayAlbums();

    // Load the first available album's songs (default to Alanwalker)
    songs = await getsongs("songs/Alanwalker");
    playmusic(songs[0], true);
    console.log("Loaded songs:", songs);

    // Attach click handlers to ALL album cards (both hardcoded and dynamic)
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            let folder = card.dataset.folder;
            if (folder) {
                console.log("Loading album:", folder);
                songs = await getsongs(`songs/${folder}`);
                if (songs.length > 0) {
                    playmusic(songs[0]);
                }
            }
        });
    });

    // Play/Pause toggle
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "/img/pause.svg";
        } else {
            currentsong.pause();
            play.src = "/img/playsong.svg";
        }
    });

    // Time update — update seek bar and time display
    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentsong.currentTime)} / ${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (100 * (currentsong.currentTime / currentsong.duration)) + "%";
    });

    // Click on seekbar to jump to position
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });

    // Hamburger menu (mobile sidebar toggle)
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".closebar").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-110%";
    });

    // Previous song
    previous.addEventListener("click", () => {
        let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentFileName);
        if (index - 1 >= 0) {
            playmusic(songs[index - 1]);
        }
    });

    // Next song
    next.addEventListener("click", () => {
        let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentFileName);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        }
    });

    // Volume control
    let volumeInput = document.querySelector(".range").getElementsByTagName("input")[0];
    if (volumeInput) {
        volumeInput.addEventListener("input", (e) => {
            currentsong.volume = parseInt(e.target.value) / 100;
        });
    }

    // Auto-play next song when current one ends
    currentsong.addEventListener("ended", () => {
        let currentFileName = decodeURIComponent(currentsong.src.split("/").pop());
        let index = songs.indexOf(currentFileName);
        if (index + 1 < songs.length) {
            playmusic(songs[index + 1]);
        } else {
            // Reached end of playlist — reset to beginning
            play.src = "/img/playsong.svg";
        }
    });
}

main();
