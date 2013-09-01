/*var content_eclipse_f51nsh8s1n78j1k831fsh15fg = {
    status: false,
    type: undefined,
    prefs: {},
    actualPlayStopStatus: 3,
    init: function(){
        var _this = this;
        var body = $('body');
        if(body.length > 0){
            shaddow = $('<div></div>');
            shaddow.attr('id','shaddowid_turnlights_shaddow_82645186148');
            shaddow.attr('style','display:none; position:fixed; width:100%; height:100%; left:0px; top:0px; background-color:'+this.prefs.color+'; opacity:'+this.prefs.opacity+'; z-index:100000; background-position:initial initial; background-repeat:initial initial;');
            shaddow.click(function(){
                _this.setStatus(false);
            });
            body.append(shaddow);
        }
        this.initListeners();
        if(this.type == 'youtube'){
            try{
                this.detectPlayStop();
            }catch(e){}
        }
    },
    changeStatus: function(){
        //bg
        if(this.status){
            this.setStatus(false);
        }else{
            this.setStatus(true);
        }
        //elms
        if(this.type == 'vimeo'){
            $('object').css('z-index','200000');
        }
    },
    setStatus: function(set){
        this.modifyPage(set);
        var shaddow = $('#shaddowid_turnlights_shaddow_82645186148');
        if(shaddow.length > 0){
            //bg
            if(set){
                this.status = true;
                $('#shaddowid_turnlights_shaddow_82645186148').css('background-color',this.prefs.color).css('opacity',this.prefs.opacity);
                if(this.prefs.fade_in_out){
                    shaddow.fadeIn(500);
                }else{
                    shaddow.show(0);
                }
            }else{
                this.status = false;
                if(this.prefs.fade_in_out){
                    shaddow.fadeOut(500);
                }else{
                    shaddow.hide(0);
                }
            }
        }
    },
    modifyPage: function(set){
        if(this.type == 'youtube'){
            var textColor = '#000';
            var textColorLight = '#222';
            if(parseFloat(this.prefs.opacity) > 0.5){
                var inverse = "#";
                var pieces = this.prefs.color.match(/\w{2}/g);
                for(var i in pieces){
                    inverse += ("0" + (255 - parseInt(pieces[i], 16)).toString(16)).slice(-2);
                }
                textColor = inverse;
                textColorLight = inverse;
            }
            if(!set){
                textColor = '#000';
                textColorLight = '#666';
            }
            $('embed').css('z-index','200000').css('position','relative').css('visibility','visible');
            $('#watch7-container,#player,#player-api,#watch7-video,#watch7-main,#watch7-content').css('z-index','auto');
            if(this.prefs.info_bar){
                $('#watch7-secondary-actions').css('position','relative').css('z-index','200000').css('background-color','#fff');
                $('#watch7-action-panels').css('z-index','200000').css('background-color','#fff');
            }else{
                $('#watch7-secondary-actions,#watch7-action-panels').css('z-index','10000');
            }
            if(this.prefs.like_dislike){
                $('#watch-like,#watch-dislike').css('z-index','200000').css('position','relative').css('background-color','#fff');
            }else{
                $('#watch-like,#watch-dislike').css('z-index','10000');
            }
            if(this.prefs.video_title){
                $('#watch-headline-title').css('z-index','200000').css('position','relative');
                $('#eow-title').css('z-index','200000').css('position','relative').css('color',textColor);
            }else{
                $('#watch-headline-title,#eow-title').css('z-index','10000');
                $('#eow-title').css('color','#000');
            }
            if(this.prefs.channel_bar){
                $('#watch7-user-header .yt-user-photo, #watch7-user-header .yt-subscription-button').css('z-index','200000').css('position','relative');
                $('#watch7-user-header .yt-user-name, #watch7-user-header .yt-user-videos').css('z-index','200000').css('position','relative').css('color',textColor);
            }else{
                $('#watch7-user-header .yt-user-photo, #watch7-user-header .yt-subscription-button').css('z-index','10000');
                $('#watch7-user-header .yt-user-name, #watch7-user-header .yt-user-videos').css('z-index','10000').css('color','#000');
            }
            if(this.prefs.suggestions){
                $('#watch7-sidebar').css('position','relative').css('z-index','200000');
                $('#watch7-sidebar .watch-sidebar-section, #watch7-sidebar .watch-sidebar-section').css('position','relative').css('z-index','200000').css('background-color','#fff');
            }else{
                $('#watch7-sidebar, #watch7-sidebar .watch-sidebar-section, #watch7-sidebar .watch-sidebar-section').css('z-index','10000');
            }
            if(this.prefs.number_views){
                $('#watch7-views-info .watch-view-count').css('z-index','200000').css('position','relative').css('color',textColor);
            }else{
                $('#watch7-views-info .watch-view-count').css('z-index','10000').css('color','#000');
            }
            if(this.prefs.like_bar){
                $('#watch7-views-info .video-extras-sparkbars').css('position','relative').css('z-index','200000');
                $('#watch7-views-info .video-extras-likes-dislikes').css('z-index','200000').css('position','relative').css('color',textColorLight);
            }else{
                $('#watch7-views-info .video-extras-sparkbars').css('z-index','10000');
                $('#watch7-views-info .video-extras-likes-dislikes').css('z-index','10000').css('color','#666');
            }
        }else if(this.type == 'vimeo'){
            $('object').css('z-index','200000');
        }else if(this.type == 'facebook'){
            $('embed').css('z-index','200000').css('position','relative').css('visibility','visible');
        }else if(this.type == 'dailymotion'){
            $('#top_content_box').css('z-index','auto');
            $('#player_main').css('z-index','200000').css('position','relative').css('height','352px');
            $('object').css('z-index','200000').css('position','relative').css('visibility','visible');
        }else if(this.type == 'youku'){
            $('#playBox, #playerBox .playArea, #player, #movie_player').css('z-index','200000').css('position','relative').css('visibility','visible');
        }else{
            $('object').css('z-index','200000').css('visibility','visible');
            $('embed').css('z-index','200000').css('visibility','visible');
            $('video').css('z-index','200000').css('position','relative').css('visibility','visible');
        }
    },
    initListeners: function(){
        var _this = this;
        $(document).bind('keypress',function(e){
            if(_this.prefs.shortcut_key){
                if(e.shiftKey && e.ctrlKey && e.keyCode == 12){
                    _this.changeStatus();
                }
            }
        });
    },
    detectPlayStop: function(){
        var _this = this;
        var js = $('script');
        js.attr('type','text/javascript').attr('src',chrome.extension.getURL('youtube_play.js'));
        $('head').append(js);
        setInterval(function(){
            if(_this.prefs.autoplay){
                var status = $('#play_status_turnlights_82645186148');
                if(status && status.length > 0){
                    var s = parseInt(status.html());
                    if(s != _this.actualPlayStopStatus){
                        _this.actualPlayStopStatus = s;
                        if(s == 1){
                            _this.setStatus(true);
                        }else if(s == 2){
                            _this.setStatus(false);
                        }
                    }
                }
            }
        },500);
    }
}*/