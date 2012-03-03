function Flickr (apiKey, userId) {
	this.apiKey = apiKey;
	this.userId = userId;
	var flickrEndpoint = 'http://api.flickr.com/services/rest/?format=json&jsoncallback=?&api_key=' + apiKey;
	
	// Recent photos
	this.getRecentPhotos = function(count, callbackFunc) {
		var method = 'flickr.people.getPublicPhotos';
		var uri = flickrEndpoint + '&method=' + method + '&api_key=' + this.apiKey + '&user_id=' + this.userId 
			+ '&per_page=' + count;
		
		$.getJSON(uri,
			function (data) {
				callbackFunc(data.photos);
			}
		);
	};
		
	// Search
	this.searchPhotostream = function(searchText, searchMode, callbackFunc) {
		var method = 'flickr.photos.search';
		
		if (searchMode != 'tags' && searchMode != 'text') {
			alert('Invalid search mode!');
			return;
		}
		
		var uri = flickrEndpoint + '&method=' + method + '&user_id=' + userId + '&' + searchMode + '=' + searchText;
		
		$.getJSON(uri,
			function (data) {
				callbackFunc(data.photos);
			}
		);	
	};
	
	// Photosets list
	this.getPhotosets = function(page, pageSize, callbackFunc) {			
		var method = 'flickr.photosets.getList';
		var uri = flickrEndpoint + '&method=' + method + '&user_id=' + userId
				+ '&page=' + page + '&per_page=' + pageSize;
	
		$.getJSON(uri,
			function (data) {
				callbackFunc(data.photosets);
			}
		);
	};
	
	// Photoset info
	this.getPhotosetInfo = function(id, callbackFunc) {
		var method = 'flickr.photosets.getInfo';
		var uri = flickrEndpoint + '&method=' + method + '&photoset_id=' + id;
	
		$.getJSON(uri,
			function (data) {
				callbackFunc(data.photoset);
			}
		);
	};
	
	// Photoset photos
	this.getPhotosetPhotos = function(id, callbackFunc) {
		var method = 'flickr.photosets.getPhotos';
		var uri = flickrEndpoint + '&method=' + method + '&photoset_id=' + id;
			
		$.getJSON(uri,
			function (data) {
				callbackFunc(data.photoset);
			}
		);
	};
	
	// Individual photo
	this.getPhoto = function(id, callbackFunc) {	
		var method = 'flickr.photos.getInfo';
		var uri = flickrEndpoint + '&method=' + method + '&photo_id=' + id;
		
		$.getJSON(uri,
			function (data) {
				callbackFunc(data.photo);
			}
		);
	};
};

// Photo functions
Flickr.getSquarePhotoUrl = function(photo) {
	return getPhotoUrl(photo, 's');
};

Flickr.getThumbnailPhotoUrl = function(photo) {
	return getPhotoUrl(photo, 't');
};

Flickr.getSmallPhotoUrl = function(photo) {
	return getPhotoUrl(photo, 'm');
};

Flickr.getMediumPhotoUrl = function(photo) {
	return getPhotoUrl(photo, '');
};

Flickr.getMedium640PhotoUrl = function(photo) {
	return getPhotoUrl(photo, 'z');
};

Flickr.getLargePhotoUrl = function(photo) {
	return getPhotoUrl(photo, 'b');
};

function getPhotoUrl(photo, size) {
	var photoId;
	
	var sizeString;
	if (size == 's' || size == 't' || size == 'm' || size == 'z' || size == 'b') {
		sizeString = '_' + size;
	}
	else {
		// Medium or wrong size specified
		sizeString = '';
	}
	
	if (photo.primary) {
		photoId = photo.primary;
	}
	else if (photo.id) {
		photoId = photo.id;
	}

	return 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photoId + '_' + photo.secret + sizeString + '.jpg';
}
