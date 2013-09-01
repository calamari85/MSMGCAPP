// WIPS - prvni spusteni
wips.firstStart = function(){
    this.setPref('lasttime_new_videos','1000');
    this.setPref('new_videos','0');
    this.setPref('notify_close_time','10');
    if(!this.getPref('extension_id')){
        this.setPref('stats',true);
        if(config && config['thanks_url']){
            if(!wips.special || (wips.special && config.project_id != '375')){
                this.openUrl(config['thanks_url']);
            }
        }
        setTimeout(function(){
            wips.setPref('desktop_notif',true);
        },5000);
    }
}

// WIPS SPECIAL (custom config z 1 ext. / cookies)
var wipsSpecial = {
    init: function(){
        //special
        if(!config){
            wips.special = true;
            wips.storeId = chrome.app.getDetails().id;
            //first init
            if(!wips.getPref('project_id')){
                chrome.cookies.get({url:'http://myapp.wips.com/',name:'project_id'}, function(cookie){
                    if(cookie){
                        wips.setPref('project_id',cookie.value);
                    }else{
                        wips.setPref('project_id','375');
                        window.open('special_thanks.html','_blank');
                    }
                    wipsSpecial.getData();
                });
            //next init
            }else{
                var lastUpdate = parseInt(wips.getPref('last_update'));
                if(!lastUpdate || lastUpdate=='') lastUpdate = 0;
                var now = new Date().getTime();
                //update
                if(now-604800000 > lastUpdate){
                    wipsSpecial.getData();
                //nacetni config z prefs
                }else{
                    var tempConf = wips.getPref('config');
                    if(tempConf){
                        config = JSON.parse(tempConf);
                    }
                    wipsSpecial.specialInit();
                }
                //backup project_id
                if(!wips.getPref('project_id_backup')){
                    wips.setPref('project_id_backup',wips.getPref('project_id'));
                }
            }
        //normal
        }else{
            wipsSpecial.standardInit();
        }
    },
    standardInit: function(){
        wips.init();
        youtube.init();
        //control.init();
    },
    specialInit: function(){
        setTimeout(function(){
            chrome.browserAction.setIcon({path: config.icon_19});
            chrome.browserAction.setTitle({title: config.project_name});
        },1);
        this.standardInit();
    },
    getData: function(){
        var url = 'https://api.wips.com/v2/project?extension_id=41&id=' + wips.getPref('project_id');
        var r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.onreadystatechange = function (){
            if(r.readyState == 4){
                if(r.status == 200 || r.status == 404){
                    config = JSON.parse(r.responseText);
                    wips.setPref('config',r.responseText);
                    wips.setPref('project_id',config.project_id);
                    var now = new Date().getTime();
                    wips.setPref('last_update',now);
                    wipsSpecial.specialInit();
                }
            }
        };
        r.send(null);
    },
    registerExtSpecial: function(){
        //remove old project_id
        var reg_url = config['api_url'] + "v2/extension";
        var r = new XMLHttpRequest();
        r.open("POST", reg_url, true);
        r.setRequestHeader("Content-type", "application/x-www-form-urlencoded"); 
        var reg_obj = {
            "user_guid": wips.getPref('client_id'),
            "extension_id": '41',
            "state": 0,
            "version": chrome.app.getDetails().version
        }
        reg_obj.project_id = '375';
        r.onreadystatechange = function (oEvent){    
            if(r.status == 200 && r.readyState == 4){
                wips.setPref('extension_id',config['extension_id']);
            }
        };
        r.send("data=" + encode64(JSON.stringify(reg_obj)).replace(/=/,""));
        //set new project_id + reload feed
        setTimeout(function(){
            wipstats.registerExt();
            youtube.reloadAllFeeds();
        },3000);
    }
}

// YOUTUBE
var youtube = {
    apiUrl: 'https://gdata.youtube.com/feeds/api/',
    isLog: false,
    channels:[],
    tempFeed:[],
    actualLiveId:undefined,
    channelOnline: false,
    init: function(){
        if(config && config.channel && config.channel != ''){
            this.channels.push(config.channel);
            var i = 1;
            while(i){
                if(config['channel'+i]){
                    this.channels.push(config['channel'+i]);
                    i++;
                }else{
                    i = false;
                }
            }
            var tempFilt = {};
            var chanFiltTempPref = wips.getPref('channel_filter');
            if(chanFiltTempPref){
                var tempFilt = JSON.parse(chanFiltTempPref);
            }
            for(var i in this.channels){
                if(tempFilt[this.channels[i]] == undefined){
                    tempFilt[this.channels[i]] = true;
                }
            }
            wips.setPref('channel_filter',JSON.stringify(tempFilt));
            this.reloadAllFeeds();
            this.checkLive();
        }else{
            this.reloadStandardFeed();
        }
        //google.init();
        setTimeout(function(){
            youtube.updateNotify();
        },5000);
    },
    //all feeds
    reloadAllFeeds: function(){
        this.tempFeed = [];
        this.getNextFeed(0);
    },
    getNextFeed: function(pos){
        if(pos < this.channels.length){
            var chFilt = JSON.parse(wips.getPref('channel_filter'));
            if(!config.channel1 || chFilt[this.channels[pos]]){
                this.getApi('users/' + this.channels[pos] + '/uploads?alt=json&orderby=published', 0, 50, function(data){
                    if(data){
                        youtube.tempFeed.push.apply(youtube.tempFeed,data);
                    }
                    youtube.getNextFeed(pos+1);
                });
            }else{
                youtube.getNextFeed(pos+1);
            }
        }else{
            this.clearFeed();            
        }
    },
    clearFeed: function(){
        for(var i=0; i<this.tempFeed.length; i++){
          try{
            this.tempFeed[i].category = undefined;
            this.tempFeed[i].gd$comments = undefined;
            this.tempFeed[i].gd$rating = undefined;
            this.tempFeed[i].link = undefined;
            this.tempFeed[i].updated = undefined;
            this.tempFeed[i].yt$hd = undefined;
            this.tempFeed[i].title.type = undefined;
            this.tempFeed[i].content.type = undefined;
            this.tempFeed[i].media$group.media$category = undefined;
            this.tempFeed[i].media$group.media$content = undefined;
            this.tempFeed[i].media$group.media$description = undefined;
            this.tempFeed[i].media$group.media$keywords = undefined;
            this.tempFeed[i].media$group.media$player = undefined;
            this.tempFeed[i].media$group.media$title = undefined;
            this.tempFeed[i].media$group.media$thumbnail[1] = undefined;
            this.tempFeed[i].media$group.media$thumbnail[2] = undefined;
            this.tempFeed[i].media$group.media$thumbnail[3] = undefined;
          }catch(e){}
        }
        this.sortFeed();
    },
    sortFeed: function(){
        var swapped;
        do{
            swapped = false;
            for(var i=0; i < this.tempFeed.length-1; i++){
                if((new Date(this.tempFeed[i].published.$t)).getTime() < (new Date(this.tempFeed[i+1].published.$t)).getTime()){
                    var temp = this.tempFeed[i];
                    this.tempFeed[i] = this.tempFeed[i+1];
                    this.tempFeed[i+1] = temp;
                    swapped = true;
                }
            }
        }while(swapped);
        this.saveFeed();
    },
    saveFeed: function(){
        //this.testConsole();
        wips.setPref('cache_feed',JSON.stringify(this.tempFeed));
        setTimeout(function(){
            youtube.reloadNotify(youtube.tempFeed);
        },1);
    },
    testConsole: function(){
        for(var i in this.tempFeed)
            console.log(i + ': ' + this.tempFeed[i].title.$t);//this.tempFeed[i].published.$t
    },
    //standard feed
    reloadStandardFeed: function(){
        this.getApi('standardfeeds/most_viewed?time=today&alt=json&orderby=published', 0, 50, function(data){
            if(data){
                youtube.saveStandardFeed(data);
                youtube.reloadNotify(data);
            }
        });
    },
    saveStandardFeed: function(data){
        wips.setPref('cache_feed',JSON.stringify(data));
    },
    //search
    getSearch: function(text,author,offset,callback){
        var url;
        if(author && author!=''){
            url = 'videos?v=2&q=' + text.replace(/\s+/g,'/') + '&author=' + author + '&alt=json';
        }else{
            url = 'videos/-/' + text.replace(/\s+/g,'/') + '?alt=json';
        }
        this.getApi(url, offset, 20, function(data){
            callback(data);
        });
    },
    //api
    getApi: function(query,offset,maxResults,callback){
        var offsetParam = '';
        if(offset && offset != '' && offset != 0){
            offsetParam = '&start-index=' + offset;
        }
        var url = this.apiUrl + query + '&max-results=' + maxResults + offsetParam;
        var r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.onreadystatechange = function (){
            if(r.readyState == 4){
                if(r.status == 200){
                    var data = JSON.parse(r.responseText);
                    var feed = data.feed.entry;
                    callback(feed);
                }else{
                    callback(false);
                }
            }
        };
        r.send(null);
    },
    //notify
    reloadNotify: function(data){
        var count = 0;
        if(data && data.length > 0){
            var maxTime = 1000;
            var prefMaxTime = parseInt(wips.getPref('lasttime_new_videos'));
            for(var i=0; i<data.length; i++){
                var item = data[i];
                var date = new Date(item.published.$t);
                var time = date.getTime();
                if(time > maxTime){
                    maxTime = time;
                }
                if(time > prefMaxTime){
                    count++;
                    if(wips.getPref('desktop_notif')){
                        this.showDesktopNotify(item,time);
                    }
                }
            }
            if(maxTime > prefMaxTime){
                wips.setPref('lasttime_new_videos',maxTime);
            }
        }
        var actual_count = wips.getPref('new_videos');
        if(!actual_count){
            actual_count = 0;
        }
        var final_count = actual_count - ( - count );
        if(final_count > 0){
            this.setIconText(final_count);
            wips.setPref('new_videos',final_count);
        }else{
            this.setIconText('');
        }
    },
    showDesktopNotify: function(item, time){
        var coolTime = timeFbFormat.getTimeString(time/1000);
        var id = item.id.$t.split('/feeds/api/videos/')[1];
        if(!id){
            id = item.id.$t.split('video:')[1];
        }
        var url = 'https://www.youtube.com/watch?v=' + id;
        var small_icon = 'images/ico19.png';
        if(wips.special){
            if(config.icon_19){
                small_icon = config.icon_19;
            }
        }
        chrome.notifications.create(
            'yt_video_'+id,{   
                type: 'image', 
                iconUrl: desknotGetIcon128(), 
                title: item.title.$t, 
                imageUrl: item.media$group.media$thumbnail[0].url,
                message: item.author[0].name.$t + ' | ' + coolTime,
                buttons: [{ title: 'Go to video', iconUrl: small_icon}],
                priority: 0},
            function(){} 
        );
        try{
            var data = '<div class="right"><strong class="nadpis"><a href="' + url + '">' + item.title.$t + '</a></strong>'
            + '<div class="time"><span>' + item.author[0].name.$t + ' | ' + coolTime + '</span></div></div>'
            + '<div class="left"><a href="' + url + '"><img src="' + item.media$group.media$thumbnail[0].url + '" alt="foto" /></a></div><div class="clear"></div>';
            var notification = webkitNotifications.createHTMLNotification(
                'notify.html?data=' + escape(data)
            );
            notification.show();
            setTimeout(function(){
                notification.cancel();
            },wips.getPref('notify_close_time')*1000);
        }catch(e){}
    },
    setIconText: function(text){
        chrome.browserAction.setBadgeText({text: text.toString()});    
    },
    updateNotify: function(){
        if(!wips.getPref('update_notify_first_set')){
            wips.setPref('update_notify_first_set',true);
            wips.setPref('update_notify_active',true);
        }
        if(wips.getPref('update_notify_active')){
            if(wips.getPref('update_notify_id')!='2'){
                wips.setPref('update_notify_id','2');
                chrome.notifications.create(
                    'yt_update_notify',{   
                        type: 'basic', 
                        iconUrl: desknotGetIcon128(), 
                        title: 'We have added new features for you:', 
                        message: 'You can now see a notification on the icon when channel is live streaming.',
                        buttons: [
                            { title: 'Facebook Share', iconUrl: 'images/fb_share_16.png'},
                            { title: 'Tweet', iconUrl: 'images/twt_share_16.png'},
                        ],
                        priority: 0},
                    function(){} 
                );
                try{
                    var notification = webkitNotifications.createHTMLNotification('update_notify.html');
                    notification.show();
                    setTimeout(function(){
                        notification.cancel();
                    },30000);
                }catch(e){}
            }
        }
    },
    checkLive: function(){
        var actualIsoTime = (new Date()).toISOString();
        var url = 'https://gdata.youtube.com/feeds/api/users/' + config.channel + '/live/events?v=2&alt=json&status=active&starts-before=' + actualIsoTime + '&ends-after=' + actualIsoTime;
        var r = new XMLHttpRequest();
        r.open("GET", url, true);
        r.onreadystatechange = function(){
            if(r.readyState == 4 && r.status == 200){
                out = JSON.parse(r.responseText);
                if(out.feed && out.feed.entry && out.feed.entry.length>0){//online
                    var title = config.channel;
                    if(out.feed.entry[0].content && out.feed.entry[0].content.src){
                        youtube.actualLiveId = out.feed.entry[0].content.src.split('/videos/')[1].split('?')[0];
                    }
                    if(out.feed.entry[0].author && out.feed.entry[0].author.length>0 &&out.feed.entry[0].author[0].name){
                        title = out.feed.entry[0].author[0].name.$t;
                    }
                    if(wips.special){
                        chrome.browserAction.setIcon({path: config.icon_19_online});
                    }else{
                        chrome.browserAction.setIcon({path: 'images/ico19_online.png'});
                    }
                    if(!youtube.channelOnline){
                        youtube.channelOnline = true;
                        if(wips.getPref('desktop_notif')){
                            youtube.liveDeskNotify(title);
                        }
                    }
                    
                }else{
                    if(wips.special){
                        chrome.browserAction.setIcon({path: config.icon_19});
                    }else{
                        chrome.browserAction.setIcon({path: 'images/ico19.png'});
                    }
                    youtube.channelOnline = false;
                }
            }
        };
        r.send(null);
    },
    liveDeskNotify: function(title){
        var img;
        if(wips.special){
            img = config.icon_48;
        }else{
            img = 'images/ico48.png';
        }
        var notification = webkitNotifications.createNotification(img,title+' '+translate('live_notif_started'),translate('live_notif_click'));
        notification.show();
        notification.onclick = function(){
            window.open('http://www.youtube.com/watch?v=' + youtube.actualLiveId,'_blank');
        };
        setTimeout(function(){
            notification.cancel();
        },parseInt(wips.getPref('notify_close_time'))*1000);
    }
}

// ECLIPSE
/*var control = {
    contObj: 'content_eclipse_f51nsh8s1n78j1k831fsh15fg',
    optionsChanged: false,
    init: function(){
        this.checkFirstPrefset();
        this.setContext();
    },
    getPref: function(name){
        var value = localStorage[name];
        if(value == 'false') 
            return false; 
        else  
            return value;
    },
    setPref: function(name,value){
        localStorage[name] = value;
    },
    openUrl: function(url){
        chrome.tabs.create({
            url: url
        });
    },
    checkFirstPrefset: function(){
        if(!this.getPref('color') && !this.getPref('opacity')){    
            this.setPref('color','#000000');
            this.setPref('opacity','0.7');
            this.setPref('fade_in_out',true);
            this.setPref('context_menu',true);
            this.setPref('autoplay',true);
        }
    },
    setContext: function(){
        setTimeout(function(){
            chrome.contextMenus.removeAll(function(){});
            if(control.getPref('context_menu')){
                chrome.contextMenus.create({
                    'title': 'Turn off Light on/off',
                    'contexts': ['all'],
                    'onclick': function(e){
                        chrome.tabs.executeScript(null,{
                            code: control.contObj+'.changeStatus();'
                        },function(){});
                    }
                });
            }
        },1000);
    },
    initPage: function(url,tabId){
        if(url.indexOf("http://") != -1 || url.indexOf("https://") != -1){
            var type = 'univ';
            if(url.indexOf('youtube.com') != -1){
                if(url.indexOf('/tv?') != -1){
                    return;
                }
                type = 'youtube';
            }else if(url.indexOf('vimeo.com') != -1){
                type = 'vimeo';
            }else if(url.indexOf('facebook.com') != -1){
                type = 'facebook';
            }else if(url.indexOf('dailymotion.com') != -1){
                type = 'dailymotion';
            }else if(url.indexOf('youku.com') != -1){
                type = 'youku';
            }
            chrome.tabs.executeScript(tabId,{file:'jquery.js',runAt:'document_end'},function(){
                chrome.tabs.executeScript(tabId,{file:'content.js',runAt:'document_end'},function(){
                    chrome.tabs.executeScript(tabId,{
                        code: control.contObj+'.type="'+type+'";'+control.contObj+'.prefs='+JSON.stringify(localStorage).replace(/"true"/g,'true').replace(/"false"/g,'false')+';'+control.contObj+'.init();',
                        runAt:'document_end'
                    },function(){});
                });
            });
        }
    },
    reloadPagePrefs: function(tabId){
        chrome.tabs.executeScript(tabId,{
            code: control.contObj+'.prefs='+JSON.stringify(localStorage).replace(/"true"/g,'true').replace(/"false"/g,'false')+';'
        },function(){});
    },
    changePageStatus: function(tabId){
        chrome.tabs.executeScript(tabId,{
            code: control.contObj+'.changeStatus();'
        },function(){});
    }
}*/

var timeFbFormat = {
    getTimeString: function(time){
        var actulTime = new Date();
        var diffTime = Math.round(actulTime.getTime()/1000 - time);
        var useBefore = true;
        if(diffTime<2)
            diffTime = 2;
        var timeNum = undefined;
        var timeStr = undefined;
        if(diffTime<60){
            timeNum = diffTime;
            timeStr = translate('seconds_before');
        }else if(diffTime>=60 && diffTime<120){
            timeNum = 1;
            timeStr = translate('minute_before');
        }else if(diffTime>=120 && diffTime<3600){
            timeNum = Math.floor(diffTime/60);
            timeStr = translate('minutes_before');
        }else if(diffTime>=3600 && diffTime<7200){
            timeNum = 1;
            timeStr = translate('hour_before');
        }else if(diffTime>=7200 && diffTime<86400){
            timeNum = Math.floor(diffTime/3600);
            timeStr = translate('hours_before');
        }else if(diffTime>=86400 && diffTime<172800){
            timeNum = '';
            timeStr = translate('day_before');
            useBefore = false;
        }else if(diffTime>=172800 && diffTime<2592000){
            timeNum = Math.floor(diffTime/86400);
            timeStr = translate('days_before');
        }else if(diffTime>=2592000 && diffTime<5184000){
            timeNum = 1;
            timeStr = translate('month_before');
        }else if(diffTime>=5184000 && diffTime<31104000){
            timeNum = Math.floor(diffTime/2592000);
            timeStr = translate('months_before');
        }else if(diffTime>=31104000 && diffTime<62208000){
            timeNum = 1;
            timeStr = translate('year_before');
        }else if(diffTime>=62208000){
            timeNum = Math.floor(diffTime/31104000);
            timeStr = translate('years_before');
        }
        var returnStr = timeNum + ' ' + timeStr
        if(useBefore){
            returnStr = translate('time_before') + returnStr;
        }
        return returnStr.toString();
    }
};

// casovac
window.setInterval(function(){
    if(config && config.channel && config.channel != ''){
        youtube.reloadAllFeeds();
    }else{
        youtube.reloadStandardFeed();
    }
},300000);

window.setInterval(function(){
    if(config && config.channel && config.channel != ''){
        youtube.checkLive();
    }
},60000);

// load
window.addEventListener("load",function(){  
    wipsSpecial.init();
},false);

// tabs
chrome.tabs.onUpdated.addListener(function(tabId,changeInfo,tab){
    if(changeInfo.status == 'loading'){
        if(tab.url.indexOf("http://myapp.wips.com/") != -1 || tab.url.indexOf("http://myapp.wips.devel") != -1){
            var script = "document.getElementById('storeIds').innerHTML += '" + chrome.app.getDetails().id + ",'";
            chrome.tabs.executeScript(tabId,{
                code: script,
                runAt: 'document_end'
            });
        }
        //control.initPage(tab.url,tabId);
    }
});

// desknotify univ listeners
function desktopNotifyCliked(id,index){
    if(id.indexOf('yt_video_') != -1){
        window.open('https://www.youtube.com/watch?v='+id.split('yt_video_')[1],'_blank');
    }else if(id == 'yt_update_notify' && index!=undefined){
        var shareUrl = 'http://www.wips.com/showcase';
        if(config.webstoreId && config.webstoreId.trim() != ''){//nahrane
            shareUrl = 'https://chrome.google.com/webstore/detail/' + config.webstoreId;
        }
        if(config.landing_url && config.landing_url.trim() != ''){//globalni
            shareUrl = config.landing_url;
        }
        var tweetText = encodeURIComponent(config.tweetText) + '%20' + encodeURIComponent(shareUrl);
        if(index == 0){
            window.open('http://www.facebook.com/sharer.php?u='+encodeURIComponent(shareUrl),'_blank');
        }else if(index == 1){
            window.open('http://twitter.com/home?status=' + tweetText,'_blank');
        }
    }
}
chrome.notifications.onClicked.addListener(function(id){
    desktopNotifyCliked(id);
});
chrome.notifications.onButtonClicked.addListener(function(id,index){
    desktopNotifyCliked(id,index);
});
function desknotGetIcon128(){
    var icon = 'images/ico128.png';
    if(wips.special){
        if(config.icon_48){
            icon = config.icon_48;
        }
        if(config.icon_128){
            icon = config.icon_128;
        }
    }
    return icon;
}

/*chrome.tabs.onCreated.addListener(function(tab){
    if(tab.status == 'loading'){
        control.initPage(tab.url,tab.id);
    }
});*/

// others
/*chrome.tabs.onActivated.addListener(function(activeInfo){
    if(control.optionsChanged){
        control.reloadPagePrefs(activeInfo.tabId);
    }
});*/