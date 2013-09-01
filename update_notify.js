var bgPage = chrome.extension.getBackgroundPage();

function showFbShare(url){
    var shareUrl= "https://www.facebook.com/sharer.php?u="+encodeURIComponent(url);
    chrome.windows.create({
        'url': shareUrl, 
        'type': 'popup',
        'width':700,
        'height':400,
        'left':200,
        'top':200
    },function(window){});
}

function getPref(name){
    var value = localStorage[name];
    if(value == 'false') 
        return false; 
    else  
        return value;
}

$(document).ready(function(){
    
    if(bgPage.wips.special){
        var tempConf = getPref('config');
        if(tempConf){
            config = JSON.parse(tempConf);
        }
    }
    
    var shareUrl = 'http://www.wips.com/showcase';
    if(config.webstoreId && config.webstoreId.trim() != ''){//nahrane
        shareUrl = 'https://chrome.google.com/webstore/detail/' + config.webstoreId;
    }
    if(config.landing_url && config.landing_url.trim() != ''){//globalni
        shareUrl = config.landing_url;
    }
    
    var tweetText = encodeURIComponent(config.tweetText) + '%20' + encodeURIComponent(shareUrl);
                            
    $('#hlavni .social .twt_obal .twt_share').attr('src','https://platform.twitter.com/widgets/tweet_button.html?text=' + tweetText);
    
    $('#hlavni .social .fb_obal .fb_share').click(function(){
        showFbShare(shareUrl);
        trackButton('Update Notify - FB Share');
    });
    
});