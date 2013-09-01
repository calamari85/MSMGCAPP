var bgPage = chrome.extension.getBackgroundPage();

function init(){
        var data = location.href.split('notify.html?data=')[1];
        document.getElementById('hlavni').innerHTML = unescape(data);
        var hrefs = document.getElementsByTagName('a');
        for(var i in hrefs){
            try{
                hrefs[i].setAttribute('target','_blank');
                var href = hrefs[i].getAttribute('href');
            }catch(e){};
        }
}

$(document).ready(function(){
    
    init();
    
});