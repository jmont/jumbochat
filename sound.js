(function($) {
$.sound = {
	tracks: {},
	enabled: true,
	template: function(src) { return '<embed style="height:0" loop="false" src="' + src + '" autostart="true" hidden="true"/>'; },
	play: function(url, options){
		if (!this.enabled)
			return;
			
		var settings = $.extend({
			url: url,
			timeout: 2000
		}, options);
		
		if(settings.track){
			if (this.tracks[settings.track]) {
				var current = this.tracks[settings.track];
				current[0].Stop && current[0].Stop();	
				current.remove();
			}
		}
		
		var element = $.browser.msie
		  	? $('<bgsound/>').attr({
		        src: settings.url,
				loop: 1,
				autostart: true
		      })
		  	: $(this.template(settings.url));
		  	
		element.appendTo("body");
		
		if (settings.track) {
			this.tracks[settings.track] = element;
		}
		
		setTimeout(function() {
			element.remove();
		}, options.timeout)
		
		return element;
	}
};
})(jQuery);
