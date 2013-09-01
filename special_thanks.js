var bgPage, actualAcId, actualAcName;

// OBECNE FCE
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

function socialStart(){
    var shareUrl = 'http://www.wips.com/showcase';
    document.getElementById('share-facebook-obal').innerHTML = '<iframe src="http://www.facebook.com/plugins/like.php?href=' + encodeURIComponent('https://www.facebook.com/Wipscom') + '&amp;send=false&amp;layout=button_count&amp;show_faces=false&amp;action=like&amp;colorscheme=light&amp;font&amp;width=450&amp;height=35&amp;appId=381158701936486" scrolling="no" frameborder="0" style="border:none; overflow:hidden; width:450px; height:21px;" allowTransparency="true" id="share-facebook"></iframe>';
    document.getElementById('share-twitter-obal').innerHTML = '<a id="share-twitter" href="https://twitter.com/share" class="twitter-share-button" data-url="' + shareUrl + '" data-text="">Tweet</a>';
    document.getElementById('share-google-obal').innerHTML = '<div class="g-plusone" id="share-gplus" data-size="medium" data-href="https://plus.google.com/100520130082816551481/posts"></div>';
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="https://platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
    (function(){
        var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
        po.src = 'https://apis.google.com/js/plusone.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
    })();
}

function setNewChannel(id,name){
    if(confirm('Do you really want to set it to this channel?'+"\n\n"+name)){
        setPref('project_id',id);
        bgPage.wipsSpecial.getData();
        bgPage.wipsSpecial.registerExtSpecial();
        window.close();
    }
}

// INIT
$(document).ready(function(){
    
    Cufon.replace('.akko',{hover:true });
    
    bgPage = chrome.extension.getBackgroundPage();
    
    // ALL TRANSLATE
    /*$('.i18n').each(function(){
        var id = $(this).attr('i18n');
        var text = chrome.i18n.getMessage(id);
        $(this).val(text);
        $(this).html(text);
    });*/
    
    // TOP CHANNELS
    var topElm = $('#select_channel_5top');
    $.get('http://plugins.wips.com/youtube/search/top',function(out){
        var data = JSON.parse(out);
        for(var i in data){
            var block = $('<span class="block" rel="'+data[i][3]+'"></span>');
            block.css('background','#F4FCFF url(http://www.wips.com/'+data[i][1]+') no-repeat 5px 5px');
            block.css('background-size','48px 48px');
            block.click(function(){
                setNewChannel($(this).attr('rel'),$(this).children('strong').text());
            });
            block.append('<strong>'+data[i][2]+'</strong><span>'+data[i][0]+'</span>');
            topElm.append(block);
        }
        topElm.append('<span class="clear"></span>');
    });
    
    // AC
    var ac_input = $("#select_channel_ac input.ac");
    ac_input.click(function(){
        if($(this).hasClass('help_text')){
            $(this).removeClass('help_text').val('');
        }
    });
    ac_input.autocomplete('http://plugins.wips.com/youtube/search/channel',{
        minChars: 2,
        max:10,
        mustMatch: true,
        formatItem: function(data,i,max,value,term){
            return data[1] + ' (' + decodeURIComponent(data[0]).replace(/\+/gi,' ') + ')';
        }
    });
    ac_input.result(function(event,data,formatted){
        if(data){
            actualAcId = data[2];
            actualAcName = data[1];
            $(this).val(data[1] + ' (' + decodeURIComponent(data[0]).replace(/\+/gi,' ') + ')');
        }
    });
    $("#select_channel_ac input.ok").click(function(){
        if(actualAcId){
            setNewChannel(actualAcId,actualAcName);
        }
    });
    
    $("#select_channel_ac .default").click(function(){
        if(confirm('Are you sure you don\'t want to choose from the channels?')){
            window.close();
        }
    });
    
    // SHARE
    setTimeout(function(){
        socialStart();
    },10);
    
});