let currentSong = new Audio();
let songs;
let currFolder;

// seconds to (minute:seconds) format
function secondsToMinutesSeconds(seconds){
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60)

    const formattedMinutes = String(minutes).padStart(2, '0')
    const formattedSeconds = String(remainingSeconds).padStart(2, '0')

    return `${formattedMinutes}:${formattedSeconds}`
}

// making a song library using api (server side method)
async function getSongs(folder){
    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    
    // show all songs in the playlist using template literals
    let songsUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songsUL.innerHTML = ""
    for (const song of songs) {
        songsUL.innerHTML = songsUL.innerHTML + `<li><img class="invert" src="img/music.svg" alt="">
                                                            <div class="info">
                                                                <div>${song.replaceAll("%20", " ")} </div>
                                                                
                                                            </div>
                                                        <div class="playnow">
                                                            <span>Play Now</span>
                                                            <img class="invert" src="img/play.svg" alt="">
                                                        </div></li>`
    }

    // attach event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e=>{
        e.addEventListener("click", element=>{
            playMusic(e.querySelector(".info").firstElementChild.innerHTML);
        })
    })

    return songs

}


const playMusic = (track, pause = false)=>{
    // on playing, only one song will play at a time
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displayAlbums() {
    let a = await fetch(`/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs")   ) {
            let folder = e.href.split("/").slice(-2)[0]
            console.log(folder)
            // Get the metadata of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json(); 
            cardContainer.innerHTML = cardContainer.innerHTML + ` <div data-folder="${folder}" 
            class="card">
            <div class="play">
                            <div style="background-color: #1ed760; border-radius: 50%; display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; position: absolute; top: 161px; right: 20px;  transition: all 1s ease-out">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="black">
                                    <path d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z" 
                                        stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
                                </svg>
                            </div>   
                        </div>
            <img height="200px" width="200px" src="/songs/${folder}/cover.jpg" alt="">
            <h2>${response.title}</h2>
            <p>${response.description}</p>
        </div> `
        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)  
            // playMusic(songs[0])

        })
    })
}

async function main(){

    // list of all songs
    await getSongs("songs/karanaujla")
    playMusic(songs[0], true)
    


    // display all albums on the page
    await displayAlbums()
    

    // attach event listener to play, previous, forward
    play.addEventListener("click", ()=>{
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else{
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })


    // event listener for time update (in playbar)
    currentSong.addEventListener("timeupdate", ()=>{
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })

    // add event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", (e)=>{
        let percent = e.offsetX/e.target.getBoundingClientRect().width*100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent)/100
    })

    // add event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "0"

    })

    // add event listener for hamburger close button
    document.querySelector(".close").addEventListener("click", ()=>{
        document.querySelector(".left").style.left = "-110%"
    })

    // add event listener to previous
    previous.addEventListener("click", ()=>{
        console.log("previous clicked"); 
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]) // to find index of the song
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    
    // add event listener to forward
    forward.addEventListener("click", ()=>{
        console.log("forward clicked"); 
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]) // to find index of the song
        if ((index + 1) <= songs.length - 1) {
            playMusic(songs[index + 1])
        }
        else{
            playMusic(songs[0])
        }
    })

// 1 2 3 4 5 6 7 8 9 10 11 12 13 14
// songs.length = 14
// 0 1 2 3 4 5 6 7 8  9 10 11 12 13
    
    // add event listener to volume // controlling volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e)=>{
        console.log("Song volume :", e.target.value); // e.value = (0 - 100) volume range
        currentSong.volume = e.target.value/100
    })
    
    // add event listener to mute the audio
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        if (e.target.src.includes("img/volume.svg")) {
            e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg")
            currentSong.volume = 0
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
        }
        else{
            e.target.src = e.target.src.replace("img/mute.svg" ,"img/volume.svg")
            currentSong.volume = 0.1
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })
    

}     
main()
