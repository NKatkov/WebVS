
module.exports = {
	dateToStr : function (d,f) {

		return 'formate date';
	},
	remoteIP: function(req) {
		var headers = req.headers;
		var proxy_ip = headers['x-real-ip'] || headers['x-forwarded-for']
		if (proxy_ip)
			return proxy_ip;
		if (req.connection) {
			if (req.connection.remoteAddress)
				return req.connection.remoteAddress.replace('::ffff:', '');
		}
		
		if (req.ip)
			return req.ip;
	},
	trim : function (str, charlist) {
		charlist = !charlist ? ' \\s\xA0' : charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '\$1');
		var re = new RegExp('^[' + charlist + ']+|[' + charlist + ']+$', 'g');
		return str.replace(re, '');
	},
	getRandomInt : function (min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	},
	toTranslit : function (text) {
		return trim(text).replace(/[/.,!?;]*/g, '').replace(/([à-ÿ¸])/gi, function (all, char) {
			var code = char.charCodeAt(0),
				index = code == 1025 || code == 1105 ? 0 : code > 1071 ? code - 1071 : code - 1039,
				t = ['yo', 'a', 'b', 'v', 'g', 'd', 'e', 'zh', 'z', 'i', 'y', 'k', 'l', 'm', 'n', 'o', 'p',
					'r', 's', 't', 'u', 'f', 'h', 'c', 'ch', 'sh', 'shch', '', 'y', '', 'e', 'yu', 'ya'];
			
			return char.toLowerCase() === char ? t[ index ].toLowerCase() : t[ index ];
		}).replace('?', '').replace(/ /g, '-');
	},
	
	getPercentRAM : function (ram, free) {
		
		var ramCap = ram-free;
		var pr = ramCap/ram*100;	
		
		return pr.toFixed(2);
	},

}