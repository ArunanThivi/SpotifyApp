const APIController = (function() {
    var client_id = "affcf25d1aaf4340b011b9bb809cb495";
    var client_secret = "***REMOVED***";
    var redirecturl = 'https://arunanthivi.com';
    // var scopes = 'user-top-read'; STAGE 2
    var token = 'BQBAES711GLaMf0vEZrclRgo_5Vdwwt_pxm5KByB8Cm-0KGNFlkg3gOCGbK90nyOIpYihR0TMiWv0jab5bHoGF1KGFKzg2UDynV5vZmVBX5AVbYqB0YKlXejzVdzoUpq4MDLiX6HVYSsVYGLYCDI26WI0iR-l6KB4Rg';
    const _getToken = async()  => { /*async returns a prompt.*/
        let url = 'https://accounts.spotify.com/authorize';
        url += '?response_type=token';
        url += '&client_id=' + encodeURIComponent(client_id);
        //url += '&scope=' + encodeURIComponent(scope);
        url += '&redirect_uri=' + encodeURIComponent(redirecturl);
        /*window.location = url;        
        console.log(window.location.hash);
        console.log(window.location.href);
        console.log(window.location.toString());
        var params = new URLSearchParams(window.location);
        console.log(params);*/
        const result = fetch('https://cors-anywhere.herokuapp.com/'+url);
        const data = (await result).json();
        console.log(data);
        return data.access_token;
    }
    const _searchTrack = async(/*token, */name) => {
        var trackName = name.replace(' /g', '%20');
        const result = await fetch(`https://api.spotify.com/v1/search?q=${trackName}&type=track&limit=1`, {
            method: 'GET',
            headers: { 'Authorization': 'Bearer ' + token },
        });

        const data = await result.json();
        return data;
    }
    const _getFeatures = async(/*token, */id) => {
        const result = await fetch(`https://api.spotify.com/v1/audio-features/${id}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer' + token
            }
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getFeatures(/*token, */trackId) {
            return _getFeatures(/*token, */trackId);
        },
        searchTrack(/*token, */name) {
            return _searchTrack(/*token, */name);
        }
    }

})();

const APPControler = (function(APICtrl) {

    const getTracks = async() => {
        const token = await APICtrl.getToken();
        
    }
})(APIController);

