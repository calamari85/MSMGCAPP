//GA
if(config.gaCode){
    var _gaq = _gaq || [];
    _gaq.push(['_setAccount', config.gaCode]);
    _gaq.push(['_trackPageview']);
    (function() {
        var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
        ga.src = 'https://ssl.google-analytics.com/ga.js';
        var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
    })();
}

function trackButton(button_id){
    if(config.gaCode){
        _gaq.push(['_trackEvent', button_id, 'clicked']);
    }
};