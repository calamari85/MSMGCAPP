var google = {
    apiUrl: 'https://gdata.youtube.com/',
    //gPlusKey: 'AIzaSyBO0NDKzKX26PWXvgwu94B-Z-McsXaQhhs',
    ytKey: 'AI39si48PWrjCV5s0HTwmUemX1WCNdPxtkioViFDhzA1wIbywa527cFZmdfeyi2mBOsM_OmVqEz58mW42klClCQR3A8B-UjlCw',
    clientId: '991685062150',
    clientSecret: 'GUc5Mck-AGTRq-mmDkk5s1yE',
    token: undefined,
    refresh_token: undefined,
    loginTabId: undefined,
    init: function(){
        this.token = wips.getPref('google_token');
        if(this.token && this.token!=''){
            this.checkTokenActive();
        }else{
            youtube.isLog = false;
        }
    },
    login: function(){
        var url = 'https://accounts.google.com/o/oauth2/auth?client_id=' + this.clientId + '&scope=https%3A%2F%2Fgdata.youtube.com%2Fauth%2Fplus.me&origin=http%3A%2F%2Fwww.wips.com&redirect_uri=http%3A%2F%2Fscripts.wips.com%2Fgoogle_auth_redirect.html&response_type=code&access_type=offline';
        chrome.tabs.getSelected(null,function(tab){
            chrome.tabs.create({
                url: url
            },function(tab){
                google.loginTabId = tab.id;
                setTimeout(function(){
                    google.checkCodeUrl();
                },1000);
            });
        });
    },
    checkCodeUrl: function(){
        chrome.tabs.get(this.loginTabId, function(tab){
          if(tab){
            try{
                if(tab.url.indexOf('scripts.wips.com') != -1 && tab.url.indexOf('code=') != -1){
                    var code = tab.url.split('code=')[1];
                    google.getToken(code);
                    chrome.tabs.remove(tab.id, function(){});
                }else{
                    setTimeout(function(){
                        google.checkCodeUrl();
                    },1000);
                }
            }catch(e){
                setTimeout(function(){
                    google.checkCodeUrl();
                },1000);
            };
          }
        });
    },
    getToken: function(code){
        var url = 'https://accounts.google.com/o/oauth2/token';
        var r = new XMLHttpRequest();
        r.open("POST", url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        r.onreadystatechange = function (){
            if(r.readyState == 4 && r.status == 200){
                var data = JSON.parse(r.responseText);
                wips.setPref('google_token',data.access_token);
                google.token = data.access_token;
                google.refresh_token = data.refresh_token;
                youtube.isLog = true;
            }
        };
        var data = 'code=' + code + '&client_id=' + this.clientId + '&client_secret=' + this.clientSecret + '&redirect_uri=http%3A%2F%2Fscripts.wips.com%2Fgoogle_auth_redirect.html&grant_type=authorization_code';
        r.send(data);
    },
    logout: function(){
        this.token = undefined;
        wips.setPref('google_token','');
        youtube.isLog = false;
    },
    getApi: function(query,callback){
        var url = this.apiUrl + query + '&alt=json&key=' + this.ytKey + '&access_token=' + this.token;
        var r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.onreadystatechange = function (){
            if(r.status == 200 && r.readyState == 4){
                callback(JSON.parse(r.responseText));
            }
        };
        r.send(null);
    },
    checkTokenActive: function(){
        var url = this.apiUrl + 'feeds/api/users/default?v=2&alt=json&?key=' + this.ytKey + '&access_token=' + this.token;
        var r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.onreadystatechange = function (){
            if(r.readyState == 4){
                // token ok
                if(r.status == 200){
                    youtube.isLog = true;
                // neplatny token
                }else if(r.status == 401){
                    google.login();
                // ostatni chyby
                }else{
                    google.logout();
                }
            }
        };
        r.send(null);
    },
    setRating: function(id,like,callback){
        var url = this.apiUrl + 'feeds/api/videos/' + id + '/ratings?alt=json&key=' + this.ytKey + '&access_token=' + this.token;
        var r = new XMLHttpRequest();
        r.open("POST", url, true);
        r.setRequestHeader("Content-type", "application/atom+xml"); 
        r.setRequestHeader("GData-Version", "2");
        r.onreadystatechange = function (){
            if(r.readyState == 4 && r.status == 201){
                callback();
            }
        };
        var data = '<?xml version="1.0" encoding="UTF-8"?><entry xmlns="http://www.w3.org/2005/Atom" xmlns:yt="http://gdata.youtube.com/schemas/2007"><yt:rating value="' + like + '"/></entry>';
        r.send(data);
    }
    /*,
    refreshToken: function(){
        var url = 'https://accounts.google.com/o/oauth2/token';
        var r = new XMLHttpRequest();
        r.open("POST", url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        r.onreadystatechange = function (){
            if(r.readyState == 4){
                if(r.status == 200){
                    //var data = JSON.parse(r.responseText);
                    //google.token = data.access_token;
                    //wips.setPref('google_token',google.token);
                    //youtube.isLog = true;
                    console.log('refresh');
                }else{
                    //google.login();
                    console.log('relogin');
                    console.log(r.responseText);
                }
            }
        };
        var data = 'client_id=' + this.clientId + '&client_secret=' + this.clientSecret + '&refresh_token=' + this.refresh_token + '&grant_type=refresh_token';
        r.send(data);
    }*/
}