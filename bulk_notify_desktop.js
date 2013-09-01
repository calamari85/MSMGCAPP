function init(){
    var data = location.href.split('bulk_notify_desktop.html?data=')[1];
    document.getElementById('hlavni').innerHTML = unescape(data);
    var hrefs = document.getElementsByTagName('a');
    for(var i in hrefs){
        try{
            hrefs[i].setAttribute('target','_blank');
        }catch(e){};
    }
}
window.addEventListener("load",function(){  
    init();  
},false);