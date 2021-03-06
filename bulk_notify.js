var bulkNotify = {
    actualHrefId: false,
    init: function(){
        if(!localStorage['bulk_notify_enable']){
            wips.setPref('bulk_notify_enable',true);
        }
        if(wips.getPref('bulk_notify_enable')){
            var last_check = parseInt(wips.getPref('bulk_notify_timeout'));
            if(!last_check || last_check < (new Date().getTime() - 86400000)){
                this.check();
                if(!last_check){
                    var randTime = Math.floor((Math.random()*86400000)+1);
                    wips.setPref('bulk_notify_timeout',(new Date().getTime() - randTime).toString());
                }else{
                    wips.setPref('bulk_notify_timeout',(new Date().getTime()).toString());
                }
            }
        }
    },
    check: function(){
        if(wips.getPref('bulk_notify_enable')){
            this.notification = [];
            var r = new XMLHttpRequest();
            var url = config.api_url + 'v2/notification?user_guid=' + wips.getPref('client_id') + '&project_id=' + config.project_id;
            r.open("GET", url, true);
            r.onreadystatechange = function (e){  
                if(r.status == 200 && r.readyState == 4){
                    var out = JSON.parse(r.responseText);
                    var pole = out.notifications;
                    for(var i=0; i<pole.length; i++){
                        var title = decodeURIComponent(pole[i].headline.replace(/\+/g, '%20'));
                        var desc = decodeURIComponent(pole[i].text.replace(/\+/g,'%20'));
                        bulkNotify.show(title,desc,pole[i].active,pole[i].id,pole[i].icon);
                    }
                }
            };
            r.send(null);
        }
    },
    show: function(data_title,data_content,active,id,data_icon){
        var href1 = '';
        var href2 = '';
        if(active){
            href1 = '<a href="http://plugins.wips.com/notification-redirect?id=' + id + '">';
            href2 = '</a>';
        }
        var icon = 'images/ico128.png';
        if(data_icon && data_icon!=''){
            icon = data_icon;
        }
        var img = href1 + '<img class="img" src="' + icon +'" alt="" />' + href2;
        var data = '<div><strong class="nadpis">' + href1 + data_title + href2 + '</strong></div>'
        + '<div>' + data_content + '</div>' + img;
        chrome.notifications.create(
            'bulk_notify',{
                type: 'basic', 
                iconUrl: icon, 
                title: data_title, 
                message: data_content,
                priority: 0},
            function(){} 
        );
        if(active){
            this.actualHrefId = id;
        }else{
            this.actualHrefId = false;
        }
        try{
            var notification = webkitNotifications.createHTMLNotification(
                'bulk_notify_desktop.html?data=' + escape(data)
            );
            notification.show();
            setTimeout(function(){
                notification.cancel();
            },20000);
        }catch(e){}
    }
}

chrome.notifications.onClicked.addListener(function(id){
    if(id == 'bulk_notify' && bulkNotify.actualHrefId){
        window.open('http://plugins.wips.com/notification-redirect?id='+bulkNotify.actualHrefId,'_blank');
    }
});