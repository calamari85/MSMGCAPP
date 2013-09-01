var bgPage, youtube, actualFeedOffset, searchText = false, searchAuthor, isLog = false, isDislike = false, google, numItems = 20, cache_feed;

// init
function initPopup(){
    bgPage = chrome.extension.getBackgroundPage();
    if(bgPage.wips.special){
        var tempConf = getPref('config');
        if(tempConf){
            config = JSON.parse(tempConf);
            setCss();
        }
    }
    if(navigator.onLine){
        youtube = bgPage.youtube;
        google = bgPage.google;
        setPref('new_videos','0');
        youtube.setIconText('');
        if(youtube.isLog){
            isLog = true;
        }
        if(config.dislike == '1'){
            isDislike = true;
        }
        setTimeout(function(){
            startRender();
        },100);
    }else{
        var hlavni = $('.hlavni');
        hlavni.html('<div id="offline"><span>' + translate('offline') + '</span></div>');
    }
}

// prepis stylu
function setCss(){
    $('a').attr('style','color:'+config.link_color+' !important');
    $('.hlavni').attr('style','border-color:'+config.border_color+' !important');
    $('.hlavni .foot').attr('style','background-color:'+config.panel_color+' !important; border-color:'+config.border_color+' !important');
    $('#yt .search').attr('style','background-color:'+config.panel_color+' !important');
    $('#yt .search input.text, #yt .search .select').attr('style','background-color:'+config.input_color+' !important; border-color:'+config.input_border_color+' !important; color:'+config.input_text_color+' !important;');
    $('#yt .search input.submit').attr('style','background-color:'+config.button_color+' !important');
    $('#video-list').attr('style','background-color:'+config.background_color+' !important; background-image:url('+config.background_image+') !important; border-color:'+config.border_color+' !important;');
    $('#video-list li a').attr('style','color:'+config.link_color+' !important');
    $('#video-list li a.link-title').attr('style','color:'+config.title_color+' !important');
    $('#video-list li .link-desc').attr('style','color:'+config.description_color+' !important');
    $('#video-list li .views, #video-list li .author, #video-list li .age').attr('style','color:'+config.info_color+' !important');
    $('.foot .share, .foot .filter').attr('style','color:'+config.share_color+' !important');
}
function reloadCss(){
    $('#video-list li a').attr('style','color:'+config.link_color+' !important');
    $('#video-list li a.link-title').attr('style','color:'+config.title_color+' !important');
    $('#video-list li .link-desc').attr('style','color:'+config.description_color+' !important');
    $('#video-list li .views, #video-list li .author, #video-list li .age').attr('style','color:'+config.info_color+' !important');
}

//start
function startRender(){
    loader(true);
    cache_feed = JSON.parse(getPref('cache_feed'));
    var shortFeed = cache_feed.slice(0,numItems);
    renderFeed(shortFeed,0);
    setTimeout(function(){
        socialStart();
    },1);
    if(bgPage.youtube.actualLiveId){
        $('.search.live').css('display','block');
        $('#video-list').css('height','443px');
        $('.search.live a').attr('href','http://www.youtube.com/watch?v='+bgPage.youtube.actualLiveId);
        $('.search.live a span').text(translate('live_popup_click'));
    }
}

// render + action fce
function renderFeed(data,offset){
    //bgPage.console.log(data);
    if(data.length > 0){
        actualFeedOffset = offset - ( - numItems );
    }else{
        actualFeedOffset = undefined;
        loader(false);
        return;
    }
    if(!offset || offset == 0 || offset == 1){
        clearObsah();
    }
    var obsah = $('#snippet--videos');
    for(var i=0; i<data.length; i++){
      try{
        var item = data[i];
        var id = item.id.$t.split('/feeds/api/videos/')[1];
        if(!id){
            id = item.id.$t.split('video:')[1];
        }
        var blok = $('<li rel="'+id+'"></li>');
        if(i == 0){
            blok.addClass('first');
        }
        obsah.append(blok);
        var link = 'https://www.youtube.com/watch?v=' + id;
        var left = $('<a target="_blank" href="' + link + '" class="preview ga" data-ga="Video Thumbnail - Click"></a>');
        blok.append(left);
        left.append('<img src="' + item.media$group.media$thumbnail[0].url + '" alt="">');
        left.append('<span>' + separateTime(item.media$group.yt$duration.seconds) + '</span>');
        var obal_div = $('<div></div>');
        blok.append(obal_div);
        obal_div.append('<a target="_blank" href="' + link + '" class="link-title ga" data-ga="Video Title - Click">' + item.title.$t + '</a>');
        if(item.content){
            var desc = item.content.$t;
            if(desc && desc != ''){
                if(desc.length > 100)
                    desc = desc.substr(0,100) + '...';
                obal_div.append('<span class="link-desc">' + desc + '</span>');
            }
        }
        if(item.yt$statistics && item.yt$statistics.viewCount){
            obal_div.append('<span class="views">' + coolNumber(item.yt$statistics.viewCount) + ' ' + translate('views') + '</span>');
        }
        var author_uri = item.author[0].uri.$t.split('/users/')[1];
        var author_name = item.author[0].name.$t;
        obal_div.append('<span class="author">' + translate('uploaded_by') + ' <a target="_blank" href="http://www.youtube.com/user/' + author_uri + '">' + author_name + '</a></span>');
        var shareUrl;
        if(bgPage.wips.special){
            shareUrl = config.thanks_url.replace('thanks','myapp');
        }else{
            if(config.webstoreId && config.webstoreId != ''){
                shareUrl = 'https://chrome.google.com/webstore/detail/' + config.webstoreId;
            }else{
                shareUrl = 'http://www.wips.com/showcase';
            }
        }
        var rel = 0;
        if(isLog){
            rel = 1;
        }
        var like_blok = '';
        /*var like_blok = '<img class="like" src="images/like_'+rel+'.png" alt="" />';
        if(isDislike){
            like_blok += ' &nbsp; <img class="dislike" src="images/dislike_'+rel+'.png" alt="" />';
        }*/
        blok.append('<span class="age">' + coolTime(item.published.$t) +'<br />'
        + '<a href="http://twitter.com/home?status=' + encodeURIComponent(item.title.$t) + '%20' + encodeURIComponent(link) + '%20via%20this%20%23extension%20' + encodeURIComponent(shareUrl) + '" target="_blank" class="twitter" ><img src="images/popup_twt.png" alt="" /></a> &nbsp;'
        + '<a href="http://www.facebook.com/sharer.php?u=' + link + '" target="_blank" class="facebook"><img src="images/popup_fb.png" alt="" /></a><br />' + like_blok + '</span>');
      }catch(e){}        
    }
    loader(false);
    offsetActive = true;
    if(bgPage.wips.special){
        reloadCss();
    }
    $("#video-list").getNiceScroll().resize().show();
}
function clearObsah(){
    $('#snippet--videos').html('').scrollTop();
}
function reloadFeed(offset){
    if(searchText && searchText != ''){
        loader(true);
        youtube.getSearch(searchText, searchAuthor, offset, function(data){
            loader(false);
            if(data){
                renderFeed(data,offset);
            }else{
                alertMess('No results');
            }
        });
    }else{
        var shortFeed = cache_feed.slice(offset,offset+numItems);
        renderFeed(shortFeed,offset);
    }
}
function search(text){
    if(text && text != ''){
        $('.search .text').val('').focus();
        var author = $('.search .select').val();
        if(config.external_search.toString() == '1'){
            if(author && author!=''){
                bgPage.wips.openUrl('http://www.youtube.com/user/'+author+'/videos?query='+text);
            }else{
                bgPage.wips.openUrl('http://www.youtube.com/results?search_query=' + text);
            }
            window.close();
        }else{
            $('.search .back').addClass('active');
            searchText = text;
            searchAuthor = author;
            reloadFeed(1);
        }
        trackButton('Main - Search');
    }
}

// other
function getPref(name){
    var value = localStorage[name];
    if(value == 'false') 
        return false; 
    else  
        return value;
}
function setPref(name,value){
    localStorage[name] = value;
}
function loader(show){
    var loader = $('.hlavni .loader');
    if(show){
        loader.removeClass('none');
    }else{
        loader.addClass('none');
    }
}
function coolTime(old_time){
    var date = new Date(old_time);
    var new_time = bgPage.timeFbFormat.getTimeString(Math.round(date.getTime()/1000));
    return new_time;
}
function separateTime(timeS){
    var hours = Math.floor(timeS/3600);
    timeS = timeS - hours*3600;
    var minutes = Math.floor(timeS/60);
    seconds = timeS - minutes*60;
    var out = '';
    if(hours > 0){
        out += hours + ':';
    }
    if(minutes < 10){
        minutes = '0' + minutes;
    }
    out += minutes + ':';
    if(seconds < 10){
        seconds = '0' + seconds;
    }
    out += seconds;
    return out;
}
function coolNumber(number){
    var num = number.toString();
    var cool_num = '';
    var x = 0;
    for(var i=num.length-1; i>=0; i--){
        var sep = '';
        if(x%3 == 0 && x != 0)
            sep = ',';
        cool_num = num[i].toString() + sep + cool_num;
        x++;
    }
    return cool_num;
}
function alertMess(text){
    var elm = $('.hlavni .alert');
    elm.children('span').html(text);
    elm.show(0).delay(1200).fadeOut(500);
}


// load + live fce + obecne fce
$(document).ready(function(){
    
    $('.search .submit').val(translate('search'));
    $('.foot .share').html(translate('share_this_widget'));
    
    initPopup();
    
    $("#video-list").niceScroll({
        cursorcolor: "#BFD5DA"
    });
    
    $('input[type=text]').live('click',function(){
      if($(this).hasClass('default')){
        $(this).css('color','#333333').val('').removeClass('default');
      }
    });
    $('.search .submit').click(function(){
        search($('.search .text').val());
    });
    $('.search .text').keypress(function(e){
        if(e.which == 13){
            e.preventDefault();
            search($(this).val());
        }
    });
    
    $('#video-list').scroll(function(){
        if(offsetActive && actualFeedOffset){
            var actualPos = $(this).scrollTop();
            var maxPos = $(this).prop('scrollHeight') - $(this).height();
            if(actualPos >= maxPos){
                offsetActive = false;
                reloadFeed(actualFeedOffset);
            }
        }
    });
    
    if(config.external_search.toString() == '0'){
        $('.search .back').css('display','block');
        $('.search .text').addClass('small');
    }
    $('.search .back').click(function(){
        if($(this).hasClass('active')){
            $(this).removeClass('active');
            searchText = false;
            reloadFeed(1);
        }
    });
    
    $('#social .do_you_like').html(translate('do_you_like'));
    $('#social .share_it').html(translate('share_it'));
    $('.foot .share').click(function(){
        $('#social').slideDown(300);
    });
    $('#share_hide').html(translate('close')).click(function(){
        $('#social').slideUp(300);
    });
    
    //channel filter
    if(config.channel1){
        
        $('.foot .filter').html(translate('channel_filter')).css('display','block').click(function(){
            $('#channel_filter').fadeIn(150);
        });
        
        $('#channel_filter .close').html(translate('close')).click(function(){
            $('#channel_filter').fadeOut(150);
            youtube.reloadAllFeeds();
            loader(true);
            setTimeout(function(){
                cache_feed = JSON.parse(getPref('cache_feed'));
                reloadFeed(1);
            },2000);
        });
        
        var tempFilt = JSON.parse(getPref('channel_filter'));
        var searchFilter = $('.search .select');
        for(var i in youtube.channels){
            ch = youtube.channels[i];
            var blok = $('<div class="blok"><input id="' + ch + '" type="checkbox" name=""' + (tempFilt[ch] ? ' checked="checked"' : '') + ' /><label for="' + ch + '">' + ch + '</label></div>');
            $('#channel_filter .in').append(blok);
            if(tempFilt[ch]){
                searchFilter.append('<option value="'+ch+'"'+(ch==config.default_srch_channel ? ' selected="selected"' : '')+'>'+ch+'</option>');
            }
        }
        
        $('#channel_filter .in .blok input').live('click',function(){
            var tempFilt = JSON.parse(getPref('channel_filter'));
            var ch = $(this).attr('id');
            if(tempFilt[ch]){
                tempFilt[ch] = false;
                $(this).removeAttr('checked');
            }else{
                tempFilt[ch] = true;
                $(this).attr('checked','checked');
            }
            setPref('channel_filter',JSON.stringify(tempFilt));
        });
        
    }else if(config.channel){
        $('.search .select').append('<option value="'+config.channel+'"'+(config.channel==config.default_srch_channel ? ' selected="selected"' : '')+'>'+config.channel+'</option>');
    }else{
        $('.search .select').css('display','none');
        $('.search .text.small').removeClass('small').css('width','388px');
        if(config.external_search == '1'){
            $('.search .text').css('width','420px');
        }
    }
    
    //ga
    $('.ga').live('click',function(){
        trackButton($(this).attr('data-ga'));
    });
    
    //likes akce
    /*if(isLog){
        $('.foot .logout').html(translate('logout')).removeClass('none').click(function(){
            google.logout();
            window.close();
        });
    }
    $('.age .like').live('click',function(){
        if(isLog){
            var id = $(this).parent('.age').parent('li').attr('rel');
            google.setRating(id,'like',function(){
                alertMess('like ok');
            });
        }else{
            google.login();
        }
        trackButton('Main - Click Like');
    });
    $('.age .dislike').live('click',function(){
        if(isLog){
            var id = $(this).parent('.age').parent('li').attr('rel');
            google.setRating(id,'dislike',function(){
                alertMess('dislike ok');
            });
        }else{
            google.login();
        }
        trackButton('Main - Click Dislike');
    });*/
    
});