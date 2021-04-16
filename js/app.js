const APIController = (function () {

    const _getProfile = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _getPlaylists = async (token) => {
        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await result.json();
        return data;
    }

    const _getPlaylistSongs = async (token, playlistId) => {
        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?market=US&fields=items(track)`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await result.json();
        return data;
    }

    const _topTracks = async (token, offset = 0) => {
        if (offset == 0) {
            let result = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            });

            let data = await result.json();
            return data.items;
        } else {
            let result = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50&offset=${offset}`, {
                method: 'GET',
                headers: { 'Authorization': 'Bearer ' + token },
            });

            let data = await result.json();
            return data.items;
        }
    }

    const _searchTrack = async (token, name) => {
        var trackName = name.replace(' /g', '%20');
        const result = await fetch(`https://api.spotify.com/v1/search?q=${trackName}&type=track&limit=1`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _multifeatures = async (token, ids) => {
        const result = await fetch(`https://api.spotify.com/v1/audio-features/?ids=${ids}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    };

    const _getFeatures = async (token, id) => {
        const result = await fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _getTracks = async (token, ids) => {
        const result = await fetch(`https://api.spotify.com/v1/tracks?ids=${ids}&market=US`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    /*const _color = async (url) {
        const result = await fetch(`http://apicloud-colortag.p.mashape.com/tag-url.json` , {
            method: 'GET',
            headers: {}
        })
    }*/

    return {
        getFeatures(token, trackId) {
            return _getFeatures(token, trackId);
        },
        searchTrack(token, name) {
            return _searchTrack(token, name);
        },
        multiFeatures(token, ids) {
            return _multifeatures(token, ids);
        },
        getProfile(token) {
            return _getProfile(token);
        },
        topTracks(token, offset) {
            return _topTracks(token, offset);
        },
        getPlaylists(token) {
            return _getPlaylists(token);
        },
        getPlaylistSongs(token, playlistId) {
            return _getPlaylistSongs(token, playlistId);
        },

        getTracks(token, ids) {
            return _getTracks(token, ids);

        }
    }

})();


function getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    while (e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }
    return hashParams;
}


function heuristic(songs) {
    //console.log(songs);
    var numItems = Object.keys(songs).length;
    //Calcuate the Average score for every feature across all songs
    avgFeatures = {
        acousticness: 0,
        danceability: 0,
        energy: 0,
        instrumentalness: 0,
        liveness: 0,
        speechiness: 0,
        valence: 0,
    };
    for (let name in songs) {
        let song = songs[name].audio_features;
        avgFeatures.acousticness += (song.acousticness > .2 ? .9 : 0);
        avgFeatures.danceability += song.danceability;
        avgFeatures.energy += song.energy;
        avgFeatures.liveness += (song.liveness > .8 ? 1 : 0);
        avgFeatures.speechiness += (song.speechiness > .33 ? song.speechiness > .66 ? 1 : .5 : 0);
        avgFeatures.valence += song.valence;
        avgFeatures.instrumentalness += (song.instrumentalness > .5 ? 1 : 0);
    }

    for (let item in avgFeatures) {
        avgFeatures[item] = parseFloat((avgFeatures[item] / numItems).toFixed(5));//Change this line
    }
    //Adjust the skews in the data set to get a normal standard distribution.
    avgFeatures.danceability -= .125;
    avgFeatures.energy -= .225;
    avgFeatures.valence += .05;

    //Find the attribute (within set1) that is most representative across all songs

    let max = Math.max(...Object.values(avgFeatures));
    var maxAttr = Object.keys(avgFeatures).filter(attr => avgFeatures[attr] == max);
    return { attr: maxAttr[0], val: max };
}

function displaySongs(songs, count = 50, start = 0) {
    for (let i = start; i < count; i++) {
        var cover = songs[i].album.images[1].url;
        var song = songs[i].preview_url
        var boxElement =
            `<div class='songInfo' onClick='createModal(${i})'>
        <img src=${cover} class='songTile' onmouseover="PlaySound('sound${i}')" onmouseout="StopSound('sound${i}')"><br>
        <audio id = 'sound${i}' src='${song}'>
        </div>`
        document.getElementById('songList').insertAdjacentHTML('beforeend', boxElement);

    }
}

function PlaySound(soundobj) {
    var thissound = document.getElementById(soundobj);
    thissound.play();
}

function StopSound(soundobj) {
    var thissound = document.getElementById(soundobj);
    thissound.pause();
    thissound.currentTime = 0;
}

function undergroundPick(songs) {
    var min = 100;
    var minIndex = -1;
    for (let i in songs) {
        if (songs[i].popularity < min) {
            min = songs[i].popularity;
            minIndex = i;
        }
    }
    return songs[minIndex];
}

function sortSongs(songs, attribute) {
    if (!Array.isArray(songs)) {
        songs = Object.values(songs);
    }
    songs.sort(function (a, b) {
        if (a.audio_features[attribute] < b.audio_features[attribute]) {
            return 1;
        }
        else if (a.audio_features[attribute] > b.audio_features[attribute]) {
            return -1;
        }
        return 0;
    });
    return songs;
}

function displayPlaylists(playlists, count = 20, start = 0) {
    for (let i = start; i < count; i++) {
        var id = playlists[i].id;
        var cover = (playlists[i].images.length > 1 ? playlists[i].images[1].url : playlists[i].images[0].url);
        var name = playlists[i].name;
        var owner = playlists[i].owner.display_name;
        var boxElement = `<div class='songInfo' id='playlist${i}'><img src=${cover} class='playlistTile link' onClick='getPlaylist("${id}")'><br>Name: ${name}<br>Owner: ${owner}<br></div>`
        document.getElementById('playlistList').insertAdjacentHTML('beforeend', boxElement);
    }

}
async function getPlaylist(id) {
    if (!localStorage["token"]) {
        var access_token = getHashParams().access_token;
        localStorage["token"] = access_token;
    } else {
        var access_token = localStorage["token"];
    }
    playlistSongs = await APIController.getPlaylistSongs(access_token, id);
    playlistSongs = playlistSongs.items;
    var ids = '';
    for (index in playlistSongs) {
        playlistSongs[index] = playlistSongs[index].track;
        ids += playlistSongs[index].id + ",";
    }
    var features = await APIController.multiFeatures(access_token, ids);
    features = features['audio_features'];
    for (index in playlistSongs) {
        playlistSongs[index]['audio_features'] = features[index];
    }
    localStorage["songs"] = JSON.stringify(playlistSongs);
    window.location.href = "Results.html"
}

var createModal = function (i) {
    
    document.getElementById('modal-text').innerHTML = `            
    <img src='${songs[i].album.images[1].url}' style="float: right"  onmouseover="PlaySound('sound${i}')" id='modalTile' onmouseout="StopSound('sound${i}')">
    <h1>${songs[i].name}</h1>
    <h2>${songs[i].artists[0].name}</h2>
    <h3>Album: ${songs[i].album.name}</h3>
    Popularity: ${songs[i].popularity}<br><br>
    Acousticness: ${Math.round(songs[i].audio_features.acousticness * 100)}/100<br><br>
    Danceability: ${Math.round(songs[i].audio_features.danceability * 100)}/100<br><br>
    Energy: ${Math.round(songs[i].audio_features.energy * 100)}/100<br><br>
    Valence: ${Math.round(songs[i].audio_features.valence * 100)}/100<br><br>
    Tempo: ${Math.round(songs[i].audio_features.tempo)} BPM<br><br>
    Instrumentalness: ${Math.round(songs[i].audio_features.instrumentalness * 100)}/100<br><br>
    Liveness: ${Math.round(songs[i].audio_features.liveness * 100)}/100<br><br>`;
    var img = $('#modalTile');
    console.log(modal);                
    img.imgcolr(function (img, color) {
        var modalBox = document.getElementById("modal-content");
        modalBox.style.backgroundColor = color;
        console.log(color);
        var tiny = tinycolor(color);
        console.log(tiny.getBrightness());
        if (!tiny.isValid()) {
            console.log("PROBLEM!!!!")
        }
        if (tiny.getBrightness() < 100) {
            modalBox.style['color'] = "white";
        } else {
            modalBox.style['color'] = "black";
        }
    });
    

    modal.style.display = "block";
}

function displaySorted(songs, attr) {
    clearSongs();
    var buttons = document.getElementsByClassName("btn")
    for (let button of buttons) {
        if (button.id == `btn-${attr}`) {
            button.style.backgroundColor = "#008CBA";
            button.style.color = "white";
        } else {
            button.style.color = "black";
            button.style.backgroundColor = "white";
        }
    }
    displaySongs(sortSongs(songs, attr), songs.length);
}

function originalSort(songs) {
    clearSongs();
    var buttons = document.getElementsByClassName("btn")
    for (let button of buttons) {
        if (button.id == `btn-original`) {
            button.style.backgroundColor = "#008CBA";
            button.style.color = "white";
        } else {
            button.style.color = "black";
            button.style.backgroundColor = "white";
        }
    }
    songs.sort(function (a, b) {
        if (a.original < b.original) {
            return -1;
        }
        else if (a.original > b.original) {
            return 1;
        }
        return 0;
    });
    displaySongs(songs, songs.length);
}

function sortedPopularity(songs) {
    clearSongs();
    var buttons = document.getElementsByClassName("btn")
    for (let button of buttons) {
        if (button.id == `btn-popular`) {
            button.style.backgroundColor = "#008CBA";
            button.style.color = "white";
        } else {
            button.style.color = "black";
            button.style.backgroundColor = "white";
        }
    }
    songs.sort(function (a, b) {
        if (a.popularity < b.popularity) {
            return 1;
        }
        else if (a.popularity > b.popularity) {
            return -1;
        }
        return 0;
    });
    displaySongs(songs, songs.length);
}

function clearSongs() {
    document.getElementById("songList").innerHTML = "";
}