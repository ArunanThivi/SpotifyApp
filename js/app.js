const APIController = (function() {

    const _getProfile = async(token) => {
        const result = await fetch(`https://api.spotify.com/v1/me`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

    const _getPlaylists = async(token) => {
        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await result.json();
        return data;
    }

    const _getPlaylistSongs = async(token, playlistId) => {
        const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?fields=items(track)&limit=50`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });
        const data = await result.json();
        return data;
    }

    const _topTracks = async(token) => {
        const result = await fetch(`https://api.spotify.com/v1/me/top/tracks?limit=50`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }
 
    const _searchTrack = async(token, name) => {
        var trackName = name.replace(' /g', '%20');
        const result = await fetch(`https://api.spotify.com/v1/search?q=${trackName}&type=track&limit=1`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }
    
    const _multifeatures = async(token, ids) => {
        const result = await fetch(`https://api.spotify.com/v1/audio-features/?ids=${ids}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    };

    const _getFeatures = async(token, id) => {
        const result = await fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }

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
        topTracks(token) {
            return _topTracks(token);
        },
        getPlaylists(token) {
            return _getPlaylists(token);
        },
        getPlaylistSongs(token, playlistId) {
            return _getPlaylistSongs(token, playlistId);
        }
    }

})();


function getHashParams() {
var hashParams = {};
var e, r = /([^&;=]+)=?([^&;]*)/g,
    q = window.location.hash.substring(1);
while ( e = r.exec(q)) {
    hashParams[e[1]] = decodeURIComponent(e[2]);
}
return hashParams;
}


function combineStats(songs) {
    var numItems = Object.keys(songs).length;
    features = {
        acousticness: 0,
        danceability: 0,
        energy: 0,
        instrumentalness: 0,
        liveness: 0,
        loudness: 0,
        speechiness: 0,
        valence: 0,
        tempo: 0,
        mode: 0
    };
    for (let name in songs) {
        let song = songs[name].audio_features;
        features.acousticness += song.acousticness;
        features.danceability += song.danceability
        features.energy += song.energy;
        features.liveness += song.liveness;
        features.loudness += song.loudness;
        features.mode += song.mode;
        features.speechiness += song.speechiness;
        features.tempo += song.tempo;
        features.valence += song.valence;
        features.instrumentalness += song.instrumentalness;
    }
    for (let item in features) {
        features[item] = Math.abs(.5 - parseFloat((features[item] / numItems).toFixed(5)));
    }
    console.log(features);
    return features;
}

function heuristic(features) {
    var set1 = {
        "acousticness" : features.acousticness,
        "danceability": features.danceability,
        "energy": features.energy,
        "instrumentalness": features.instrumentalness,
        "liveness": features.liveness,
        "speechiness": features.speechiness,
        "valence": features.valence
    }
    let max = Math.max(...Object.values(set1));    
    var maxAttr =  Object.keys(set1).filter(attr =>   set1[attr] == max);
    return {attr: maxAttr[0], val: features[maxAttr]};
}

function displaySongs(songs, count=50, start = 0) {
    console.log(songs);
    for (let i = start; i < count; i++) {
        var album = (songs[i].album.name.length < 35 ? songs[i].album.name : songs[i].album.name.substring(0, 35)+"...");;
        var cover = songs[i].album.images[1].url;
        var artist = (songs[i].artists[0].name.length < 35 ? songs[i].artists[0].name : songs[i].artists[0].name.substring(0, 35)+"...");;
        var track = (songs[i].name.length < 35 ? songs[i].name : songs[i].name.substring(0, 35)+"...");
        var boxElement = `<div class='songInfo'><img src=${cover} class='songTile'><br>Track: ${track}<br>Artist: ${artist}<br>Album: ${album}<br></div>` 
        document.getElementById('songList').insertAdjacentHTML('beforeend', boxElement);
        
    }
}

function undergroundPick(songs) {
    var min = 100;
    var  minIndex = -1;
    for (let i in songs) {
        if (songs[i].popularity < min) {
            min = songs[i].popularity;
            minIndex = i;
        }
    }
    return songs[minIndex];
}

function sortSongs(songs, attribute) {
    console.log(songs);
    if (!Array.isArray(songs)) {
        let list = [];
        for (song in songs) {
            console.log(song);
            list.push(songs[song]);
        }
        songs = list;
    }
    songs.sort(function(a, b) {
        if  (a.audio_features[attribute] < b.audio_features[attribute]) {
            return 1;
        }
        else if (a.audio_features[attribute] > b.audio_features[attribute]) {
            return -1;
        }
        return 0;
    });
    console.log(songs);
    return songs;
}

function displayPlaylists(playlists, count=20, start = 0) {
    console.log(playlists);
    for (let i = start; i < count; i++) {
        var id = playlists[i].id;
        var cover = (playlists[i].images.length > 1 ? playlists[i].images[1].url : playlists[i].images[0].url);
        var name = playlists[i].name;
        var owner = playlists[i].owner.display_name;
        var boxElement = `<div class='songInfo' id='playlist${i}'><img src=${cover} class='playlistTile' onClick='getPlaylist("${id}")'><br>Name: ${name}<br>Owner: ${owner}<br></div>` 
        document.getElementById('playlistList').insertAdjacentHTML('beforeend', boxElement);
    }

}
async function getPlaylist(id) {
    if (!sessionStorage["token"]) {
        var access_token = getHashParams().access_token;
        sessionStorage["token"] = access_token;                 
    } else {
        var access_token = sessionStorage["token"];
    }
    console.log(id);
    playlistSongs = await APIController.getPlaylistSongs(access_token, id);
    playlistSongs = playlistSongs.items;
    var ids = '';
    for (index in playlistSongs) {
        playlistSongs[index] = playlistSongs[index].track;
        console.log(playlistSongs[index]);
        ids += playlistSongs[index].id+",";
    }
    var features = await APIController.multiFeatures(access_token, ids);
    features = features['audio_features'];
    console.log(features);
    for (index in playlistSongs) {
        playlistSongs[index]['audio_features'] = features[index];
    }
    console.log(playlistSongs);
    sessionStorage["songs"] = JSON.stringify(playlistSongs);
    window.location.href="Results.html"
}