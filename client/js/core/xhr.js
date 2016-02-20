/**
 * Created by Chris on 10/25/2015.
 */


var xhr = {
    request: function(type, url, data, responseCallback){
        responseCallback = responseCallback || function(){};
        var req = new XMLHttpRequest();
        req.onreadystatechange = function(){
            if(XMLHttpRequest.DONE != req.readyState || 200!= req.status){
                return;
            }
            responseCallback(req.responseText);
        };
        req.open(type, url);
        if(data){
            req.send(data);
        }
        else{
            req.send();
        }
    },
    get: function(url, responseCallback){
        xhr.request('GET', url, null, responseCallback);
    },
    listen: function(url, responseCallback){
        xhr.get(url, function(){
            // forward the callback
            responseCallback.apply(null, Array.prototype.slice.apply(arguments, [0]));
            // then setup a new listener
            setTimeout(function() {
                xhr.listen(url, responseCallback);
            }, 0);
            // setTimeout to avoid an eventual stack overflow,
            // everything is async already anyway so it doesn't matter
        });
    },
    post: function(url, data){
        xhr.request('POST', url, data);
    }
};