const APIController = (function() {
 
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
        }
    }

})();

const APPControler = (function(APICtrl) {

    const getTracks = async() => {
        const token = await APICtrl.getToken();
        
    }
})(APIController);


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
    }
    for (let item in features) {
        features[item] /= numItems;
    }    
    console.log(features);
}