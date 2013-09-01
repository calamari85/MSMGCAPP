var opacityTemp = 0, showSaveActive = false;
var bgPage;

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
function changeStats(){
    if(getPref('stats')){
        setPref('stats',false);
    }else{
        setPref('stats',true);
    }
    renderStats();
    showSaved();
}
function renderStats(){
    if(getPref('stats')){
        $('#stats_check').attr('checked','checked');
    }else{
        $('#stats_check').removeAttr('checked');
    }
}
function showSaved(){
    bgPage.control.optionsChanged = true;
    if(!showSaveActive){
        showSaveActive = true;
        setTimeout(function(){
            showSaveActive = false;
        },2600);
        $('#leftpanel .saved').fadeIn(300).delay(2000).fadeOut(300);
    }
}
function showError(text){
    var error = $('#leftpanel .error');
    error.html(translate(text));
    error.fadeIn(300).delay(1500).fadeOut(300);
}
function initCheck(id){
    if(getPref(id)){
        $('#'+id).attr('checked','checked');
    }
}
function changeCheck(id){
    if(getPref(id)){
        setPref(id,false);
        $('#'+id).removeAttr('checked');
    }else{
        setPref(id,true);
        $('#'+id).attr('checked','checked');
    }
    showSaved();
}

// YT FCE
function changeDesknot(){
    if(getPref('desktop_notif')){
        setPref('desktop_notif',false);
    }else{
        setPref('desktop_notif',true);
    }
    renderDesknot();
    showSaved();
}
function renderDesknot(){
    if(getPref('desktop_notif')){
        $('#desknot_check').attr('checked','checked');
    }else{
        $('#desknot_check').removeAttr('checked');
    }
}
function changeDesknotBg(){
    if(getPref('desktop_notif_bg')){
        chrome.permissions.remove({permissions:['background']});
        setPref('desktop_notif_bg',false);
    }else{
        chrome.permissions.request({permissions:['background']});
        setPref('desktop_notif_bg',true);
    }
    renderDesknotBg();
    showSaved();
}
function renderDesknotBg(){
    if(getPref('desktop_notif_bg')){
        $('#desknot_bg_check').attr('checked','checked');
    }else{
        $('#desknot_bg_check').removeAttr('checked');
    }
}
var closeTime = [5,10,15,20,30,40,50,60];
function renderNotifyClose(){
    var selectElm = $('#notify_close_time');
    for(var i = 0; i < closeTime.length; i++){
    		var elm = $('<option></option>');
    		elm.html(closeTime[i]);
    		elm.attr('value',closeTime[i]);
        if(closeTime[i] == getPref('notify_close_time')){
            elm.attr('selected','selected');
        }
    		selectElm.append(elm);
    }
}
function changeNotifyClose(newTime){
    setPref('notify_close_time',newTime);
    $('#notify_close_time').html('');
    renderNotifyClose();
    showSaved();
}
//bulknot check
function setBulkNotify(){
  if(getPref('bulk_notify_enable')){
      setPref('bulk_notify_enable',false);
      document.getElementById('bulk_notify_check').removeAttribute('checked');
  }else{
      setPref('bulk_notify_enable',true);
      document.getElementById('bulk_notify_check').setAttribute('checked');
  }
  renderBulkNotify();
}
function renderBulkNotify(){
  if(getPref('bulk_notify_enable')){
    document.getElementById('bulk_notify_check').setAttribute('checked','checked');
  }
}

// ECLIPSE FCE
/*function opacityInit(){
    var val = getPref('opacity');
    $('#opacity').simpleSlider('setValue',val*100);
    $('#opacity_show').html(val*100 + '%');
}
function opacityChange(val){
    $('#opacity_show').html(val + '%');
    opacityTemp = val/100;
    setTimeout(function(){
        checkOpacityTemp(val/100);
    },1000);
}
function checkOpacityTemp(opacity){
    if(opacityTemp == opacity){
        opacitySave();
    }
}
function opacitySave(){
    setPref('opacity',opacityTemp);
    showSaved();
}
function prwInit(){
    $('#preview .bg').css('background-color',getPref('color')).css('opacity',getPref('opacity'));
}
function prwChangeColor(val){
    $('#preview .bg').css('background-color',val);
}
function prwChangeOpacity(val){
    $('#preview .bg').css('opacity',val);
}*/

// INIT
$(document).ready(function(){
    
    bgPage = chrome.extension.getBackgroundPage();
    
    $('#h1').html(chrome.app.getDetails().name);
    
    if(bgPage.wips.special){
        var tempConf = getPref('config');
        if(tempConf){
            config = JSON.parse(tempConf);
            $('#h1').html(config.project_name);
            $('#left_h2 img').attr('src',config.icon_48).attr('width','32').attr('height','32');
        }
    }
    
    // ALL TRANSLATE
    $('.i18n').each(function(){
        var id = $(this).attr('i18n');
        var text = chrome.i18n.getMessage(id);
        $(this).val(text);
        $(this).html(text);
    });
    
    // OBECNE FCE
    $('#leftpanel ul li').click(function(){
        var rel = $(this).attr('rel');
        $('#leftpanel ul li').removeClass('active');
        $(this).addClass('active');
        $('.change_blok').addClass('none');
        $('#' + rel).removeClass('none');
    });
    $('#close').click(function(){
        window.close();
    });
    
    //UNIV CHECK (id=pref)
    $('input[type=checkbox]').each(function(){
        if($(this).hasClass('univ_check')){
            initCheck($(this).attr('id'));
        }
    });
    $('input[type=checkbox]').change(function(){
        if($(this).hasClass('univ_check')){
            changeCheck($(this).attr('id'));
        }
    });
    
    // STATS
    renderStats();
    $('#stats_check').change(function(){
        changeStats();
    });
    
    // YT
    renderDesknot();
    $('#desknot_check').change(function(){
        changeDesknot();
    });
    renderNotifyClose();
    $('#notify_close_time').change(function(e){
        changeNotifyClose(e.target.value);
    });
    renderDesknotBg();
    $('#desknot_bg_check').change(function(){
        changeDesknotBg();
    });
    
    renderBulkNotify();
    $('#bulk_notify_check').change(function(){  
        setBulkNotify();  
    });
    
    // ECLIPSE
    
    /*opacityInit();
    $('#opacity').bind("slider:changed",function(e,data){
        opacityChange(data.value);
        prwChangeOpacity(data.value/100);
    });
    
    $('#minicolors').val(getPref('color')).minicolors({
        hide: function(){
            setPref('color',$(this).val());
            showSaved();
        },
        change: function(hex,opacity){
            prwChangeColor(hex);
        }
    });
    
    prwInit();
    
    $('#context_menu').click(function(){
        bgPage.control.setContext();
    });*/
    
    // SHARE
    setTimeout(function(){
        socialStart();
    },1);
    
    // href from desknotify
    if(window.location.href.indexOf('#turn_off') != -1){
        $('#leftpanel ul li').removeClass('active');
        $('#leftpanel ul li.href_from_notif').addClass('active');
        $('.change_blok').addClass('none');
        $('#blok_eclipse_general').removeClass('none');
    }
    
});