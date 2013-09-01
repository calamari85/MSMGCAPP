var content_turnlights_detect_82645186148 = {
    moviePlayer: undefined,
    init: function (){
    	this.moviePlayer = document.getElementById('movie_player');
      if(this.moviePlayer){
      		var i = setInterval(function(){
        			if(content_turnlights_detect_82645186148.moviePlayer.pauseVideo){
          				clearInterval(i);
                  content_turnlights_detect_82645186148.moviePlayer.addEventListener('onStateChange','content_turnlights_detect_82645186148.playStopEvent');
        			}
      		},100);
    	}
    },
    playStopEvent: function(id){
      	var statusElm = document.getElementById('play_status_turnlights_82645186148');
        if(!statusElm){
            var statusElm = document.createElement('div');
            statusElm.setAttribute('id','play_status_turnlights_82645186148');
            statusElm.setAttribute('style','display:none !important;');
            document.getElementsByTagName("body")[0].appendChild(statusElm);
        }
        statusElm.innerHTML = id;
    }
};

content_turnlights_detect_82645186148.init();