var params, tempFeed = [];

$(document).ready(function(){
    init();
});

function init(){
    params = JSON.parse(decodeURIComponent(document.location.href.split('?params=')[1]));
    if(!params.default_locale || params.default_locale == ''){
        params.default_locale = 'en';
    }
    $('#link_style').attr('href','css/style' + params.widget_variant + '.css');
    $('.foot .share').html(translate('share_this_widget'));
    $('.search .submit').val(translate('search'));
    if(params.external_search.toString() == '0'){
        $('.search .back').css('display','block');
        $('.search .text').addClass('small');
    }
    setCss();
    getApi();
};

function setCss(){
    $('a').css('color',params.link_color);
    $('.hlavni').css('border-color',params.border_color);
    $('.hlavni .top, .hlavni .foot').css('background-color',params.panel_color);
    $('.hlavni .top, .hlavni .foot').css('border-color',params.border_color);
    $('#yt .search').css('background-color',params.panel_color);
    $('#yt .search input.text, #yt .search .select').css('background-color',params.input_color)
                               .css('border-color',params.input_border_color).css('color',params.input_text_color);
    $('#yt .search input.submit').css('background-color',params.button_color);
    $('#video-list').css('background-color',params.background_color)
                    .css('background-image','url('+params.background_image+')')
                    .css('border-color',params.border_color);
    $('#video-list li a').css('color',params.link_color);
    $('#video-list li a.link-title').css('color',params.title_color);
    $('#video-list li .link-desc').css('color',params.description_color);
    $('#video-list li .views, #video-list li .author, #video-list li .age').css('color',params.info_color);
    $('.foot .share, .foot .back, .foot .filter').css('color',params.share_color);
    if(!params.channel1){
        $('.foot .filter').css('display','none');
    }
}

function getApi(){
    var query;
    if(params.channel && params.channel != ''){
        query = 'users/' + params.channel + '/uploads?alt=json';
    }else{
        query = 'standardfeeds/most_viewed?time=today&alt=json';
    }
    var url = 'https://gdata.youtube.com/feeds/api/' + query + '&orderby=published&max-results=5';
    var r = new XMLHttpRequest();
    r.open("GET", url, true);
    r.onreadystatechange = function (){
        if(r.readyState == 4){
            if(r.status == 200){
                var data = JSON.parse(r.responseText);
                if(data.feed && data.feed.entry){
                    var feed = data.feed.entry;
                    if(feed.length > 0){
                        renderFeed(feed);
                    }
                }else{
                    setCss();
                }
            }
        }
    };
    r.send(null);
}

function sortFeed(){
    var swapped;
    do{
        swapped = false;
        for(var i=0; i < tempFeed.length-1; i++){
            if((new Date(tempFeed[i].published.$t)).getTime() < (new Date(tempFeed[i+1].published.$t)).getTime()){
                var temp = tempFeed[i];
                tempFeed[i] = tempFeed[i+1];
                tempFeed[i+1] = temp;
                swapped = true;
            }
        }
    }while(swapped);
    renderFeed(tempFeed);
}

function renderFeed(data){
    var obsah = $('#snippet--videos');
    for(var i=0; i<data.length; i++){
        var item = data[i];
        var blok = $('<li></li>');
        if(i == 0){
            blok.addClass('first');
        }
        obsah.append(blok);
        var link = item.link[0].href;
        var left = $('<a target="_blank" href="' + link + '" class="preview"></a>');
        blok.append(left);
        left.append('<img src="' + item.media$group.media$thumbnail[0].url + '" alt="">');
        left.append('<span>' + separateTime(item.media$group.yt$duration.seconds) + '</span>');
        var obal_div = $('<div></div>');
        blok.append(obal_div);
        obal_div.append('<a target="_blank" href="' + link + '" class="link-title">' + item.title.$t + '</a>');
        var desc = item.content.$t;
        if(desc && desc != ''){
            if(desc.length > 100)
                desc = desc.substr(0,100) + '...';
            obal_div.append('<span class="link-desc">' + desc + '</span>');
        }
        if(item.yt$statistics){
            obal_div.append('<span class="views">' + coolNumber(item.yt$statistics.viewCount) + ' ' + translate('views') + '</span>');
        }
        var author = item.author[0].name.$t;
        obal_div.append('<span class="author">' + translate('uploaded_by') + ' <a target="_blank" href="http://www.youtube.com/user/' + author + '">' + author + '</a></span>');
        blok.append('<span class="age">' + coolTime(item.published.$t) +'<br /><br />'
        + '<a href="#"><img src="images/popup_twt.png" alt="" /></a> &nbsp;'
        + '<a href="#"><img src="images/popup_fb.png" alt="" /></a></span>');        
    }
    setCss();
}

function coolTime(old_time){
    var date = new Date(old_time);
    var new_time = timeFbFormat.getTimeString(Math.round(date.getTime()/1000));
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

function translate(str){
    return translateStrings[params.default_locale][str].message;
}

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