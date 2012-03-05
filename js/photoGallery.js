var flickrApi = '[YOUR API KEY HERE]';
var flickrUserId = '53353745@N00';
var flickrUserName = 'jdhunt';
var LIGHTBOX_MODE = 'l';

// Arrow key event handlers
$(document).keydown(function(e){	
	if (e.keyCode == 37) { 
		prevPhotoset();
		prevPhoto();
		return false;
	}
	else if (e.keyCode == 39) {
		nextPhotoset();
		nextPhoto();
		return false;
	}
});

$(window).resize(function() {
    setupPhotosetView();
});

// global functions
var populateThumbnailsWithColorbox = function(photos) {
	var photosListHtml = '';
		
	$.each(photos.photo, function (i, photo) {
		var element = '<a rel="group-thumbnails" href="' 
						+ Flickr.getMedium640PhotoUrl(photo) + '" title="' + photo.title + '"><img src="' 
						+ Flickr.getSquarePhotoUrl(photo) + '" alt="" /></a>\n';
		photosListHtml += element;
	});
		
	$('#thumbnails').append(photosListHtml);
	$('#thumbnails a').colorbox();
}

// Recent photos
function loadRecentPhotos(count) {
	var flickr = new Flickr(flickrApi, flickrUserId);
	flickr.getRecentPhotos(count, populateThumbnailsWithColorbox);
}

// Search
function searchPhotos(searchText) {
	var flickr = new Flickr(flickrApi, flickrUserId);
	flickr.searchPhotostream(searchText, 'text', populateThumbnailsWithColorbox);
	
	$('#searchText').append(searchText);
}

// Get Tag
function searchTaggedPhotos(tag) {
	var flickr = new Flickr(flickrApi, flickrUserId);
	flickr.searchPhotostream(tag, 'tags', populateThumbnailsWithColorbox);
	
	$('#searchText').append(tag);
}

// Photosets list
function loadPhotosets(page) {
	var pageSize = getPhotosetPageSize();
	
	// Hide photosets and show loader
	$('#photosetsGrid').hide();
	$('#loading').show();
						
	var populatePhotosets = function(photosets) {
		var photosetDisplayTemplate = '<li><a title="_DESCRIPTION_" href="set.html?id=_ID_"><img src="_IMGSRC_" alt="_TITLE_" /></a>'
										+ '<div class="photoset-info"><a title="_TITLE_" href="set.html?id=_ID_">_TITLE_</a><br />'
										+ '_COUNT_ photos</div></li>';
		var photosetElement = '';
				
		$.each(photosets.photoset, function (i, set) {
			var description = set.description._content;
			if (description == '') {
				description = set.title._content;
			}
			
			// replace any HTML in the description:
			var regex = /(<([^>]+)>)/ig;
			description = description.replace(regex, '');

			var element = photosetDisplayTemplate.replace(/_ID_/gi, set.id);
			element = element.replace(/_DESCRIPTION_/gi, description);
			element = element.replace('_IMGSRC_', Flickr.getSmallPhotoUrl(set));
			element = element.replace(/_TITLE_/gi, set.title._content);
			element = element.replace('_COUNT_', set.photos);
					
			photosetElement += element;
		});
		
		$('#photosetsGrid').empty().html(photosetElement);

		populatePager(photosets.page, photosets.pages);
	}
		
	var flickr = new Flickr(flickrApi, flickrUserId);
	flickr.getPhotosets(page, pageSize, populatePhotosets);
	
	// Show photosets and hide loader
	$('#loading').hide();
	$('#photosetsGrid').show();
}

function getPhotosetPageSize() {
	var TWO_SETS_WIDTH = 690;
	var WIDTH_DIFF = 210;
	var TWO_ROWS_HEIGHT = 750;
	var PHOTOSETS_VIEW_MINHEIGHT = 390;
	
	// Set photosets grid properties
	var windowHeight = $(window).height();
	var windowWidth = $(window).width();
	
	var setsPerRow;
	if (windowWidth < TWO_SETS_WIDTH) {
		setsPerRow = 2;
	}
	else if (windowWidth < TWO_SETS_WIDTH + WIDTH_DIFF) {
		setsPerRow = 3;
	}
	else if (windowWidth < TWO_SETS_WIDTH + 2 * WIDTH_DIFF) {
		setsPerRow = 4;
	}
	else {
		setsPerRow = 5;
	}
	
	var minHeight;
	var rows;
	if (windowHeight < TWO_ROWS_HEIGHT) {
		minHeight = PHOTOSETS_VIEW_MINHEIGHT;
		rows = 2;
	}
	else {
		minHeight = PHOTOSETS_VIEW_MINHEIGHT + 195;
		rows = 3;
	}
	
	var selector = '#photosetsGrid li:nth-child(' + setsPerRow + 'n)';
	$(selector).css('margin-right', 0);	
	$('#photosetsGrid').css('height', minHeight + 'px');
	$('#loading').css('height', parseInt(minHeight) + 'px');
	
	return rows * setsPerRow;
}

function populatePager(currentPage, numberOfPages) {
	var photosetsLink = '<a href="#_PAGENUM_" onclick="loadPhotosets(_PAGENUM_)">_PAGEDESC_</a>';
	var pagerElement = '';
	if (numberOfPages > 1) {
		// "Previous" link
		var pageElement = '';
		if (currentPage == 1) {
			pageElement = '<li><span><em>Prev</em></span></li>';
		}
		else {
			var prevPage = parseInt(currentPage) - 1;
			pageElement = '<li>' + photosetsLink.replace(/_PAGENUM_/gi, prevPage).replace('_PAGEDESC_', 'Prev') + '</li>'
		}
		pagerElement += pageElement;
		
		for (i = 1; i < numberOfPages+1; i++) {
			if (i == currentPage) {
				pageElement = '<li><span class="active"><em>' + currentPage + '</em></span></li>';
			}
			else {
				pageElement = '<li>' + photosetsLink.replace(/_PAGENUM_/gi, i).replace('_PAGEDESC_', i) + '</li>'
			}
			pagerElement += pageElement;
		}
		
		// "Next" link
		if (currentPage == numberOfPages) {
			pageElement = '<li><span><em>Next</em></span></li>';
		}
		else {
			var nextPage = parseInt(currentPage) + 1;
			pageElement = '<li>' + photosetsLink.replace(/_PAGENUM_/gi, nextPage).replace('_PAGEDESC_', 'Next') + '</li>'
		}
		pagerElement += pageElement;
		pagerElement += '<div class="clear"></div>';
	}

	$('#photosetsPager').empty().html(pagerElement);
}

function prevPhotoset() {
	var page = window.location.hash.replace('#', '');
	if (page == '') {
		page = 1;
	}
	if (page > 1) {
		var newPage = parseInt(page) - 1;
		location.hash = newPage;
		loadPhotosets(newPage);
	}
}

function nextPhotoset() {
	var ul = $('#photosetsPager > li');
	var el = ul.eq(ul.length-2);
	var lastPage = parseInt(el.text());
	
	var page = window.location.hash.replace('#', '');
	if (page == '') {
		page = 1;
	}
	if (page < lastPage) {
		var newPage = parseInt(page) + 1;
		location.hash = newPage;
		loadPhotosets(newPage);
	}
}

// Individual photoset
function loadPhotoset(id, mode) {
	var populatePhotosetInfo = function(photoset) {
		if (photoset != null) {
			$('#photosetTitle').html(photoset.title._content);
			$('#setDescription').html(photoset.description._content);
		
			photosCount = photoset.count_photos;
			$('#photosCount').text(photosCount);
		
			var slideshowUrl = "http://www.flickr.com/photos/" + flickrUserName + '/sets/' + photoset.id + '/show/';
			$('#slideshowLink').attr('href', slideshowUrl);
		}
	}
	
	var populatePhotosetPhotos = function(photos) {
		var photosListHtml = '';
	
		$.each(photos.photo, function (i, photo) {
			var itemClass = (i == 0) ? 'selected' : 'notSelected';
			var element = '<img id="' + photo.id + '" class="' + itemClass + '" src="' + Flickr.getSquarePhotoUrl(photo) 
						+ '" alt="" onclick="loadPhoto(\'' + photo.id + '\')" />\n';
			photosListHtml += element;
		});

		$('#thumbnails').append(photosListHtml);
		
		// Load first photo
		if (photos.photo.length > 0) {
			loadPhoto(photos.photo[0].id);
		}
	}
	
	var callbackFunc;
	if (mode == LIGHTBOX_MODE) {
		callbackFunc = populateThumbnailsWithColorbox;
		$('#photosetMain').hide();
	}
	else {
		callbackFunc = populatePhotosetPhotos;
		setupPhotosetView();
	}
	
	var flickr = new Flickr(flickrApi, flickrUserId);
	flickr.getPhotosetInfo(id, populatePhotosetInfo);
	flickr.getPhotosetPhotos(id, callbackFunc);
}

function setupPhotosetView() {
	$('#loading').css('min-height', '424px');
	$('#loading').css('width', '640px');
		
	$("#prevButton").bind("click", prevPhoto);
	$("#nextButton").bind("click", nextPhoto);
	
	// Set thumbnails properties
	var THUMBS_PADDING = 20;
	var UNIT_WIDTH = 85;
	var BASE_VIEWPORT_WIDTH = 830;
	
	var windowHeight = $(window).height();
	var windowWidth = $(window).width();
	
	var thumbsPerRow;
	if (windowWidth < BASE_VIEWPORT_WIDTH) {
		// Thumbs on top
		$('#thumbnails').removeClass('thumbsSide');
		$('#thumbnails').addClass('thumbsTop');
		$('#photosetMain').removeClass('photoRight');
		
		$('#thumbnails').width('100%');
	}
	else {
		// Thumbs on side
		$('#thumbnails').removeClass('thumbsTop');
		$('#thumbnails').addClass('thumbsSide');
		$('#photosetMain').addClass('photoRight');
		
		if (windowWidth < BASE_VIEWPORT_WIDTH + UNIT_WIDTH) {
			thumbsPerRow = 1;
		}
		else if (windowWidth < BASE_VIEWPORT_WIDTH + UNIT_WIDTH * 2) {
			thumbsPerRow = 2;
		}
		else if (windowWidth < BASE_VIEWPORT_WIDTH + UNIT_WIDTH * 3) {
			thumbsPerRow = 3;
		}
		else {
			thumbsPerRow = 4;
		}	
		
		$('.thumbsSide').css('width', parseInt(UNIT_WIDTH * thumbsPerRow + THUMBS_PADDING) + 'px');
	}
}

function loadPhoto(id) {
	var populatePhoto = function(photo) {		
		$('#thumbnails img').attr('class', 'notSelected');
		$('#' + photo.id).attr('class', 'selected');

		var selectedIndex = $('#' + photo.id).index() + 1;
		$('#photoNumber').text(selectedIndex);
			
		if (photo != null) {
			var photoTitle = photo.title._content;
			$('#photoTitle').text(photoTitle);
			$('#selectedPhoto').attr("src", Flickr.getMedium640PhotoUrl(photo));
			$('#selectedPhoto').attr("alt", photoTitle);
			$('#selectedPhoto').attr("title", photoTitle);
			$('#photoDescription').html(photo.description._content);
			
			var dateTaken = $.format.date(photo.dates.taken, "ddd MMMM dd, yyyy");
			$('#dateTaken').text("Taken on " + dateTaken);
			
			$('#tags').text('Tags: ');
			$.each(photo.tags.tag, function (i, tag) {
				if (i > 0) {
					$('#tags').append(', ');
				}
				
				var link = '<a href="tags.html?tag=' + tag._content + '" title="' + tag.raw + '">' + tag.raw + '</a>';
				$('#tags').append(link);
			});
		}
	}
	
	// Hide the photo and show loader
	$('#photoContainer').hide();
    $('#loading').show();
	
	var flickr = new Flickr(flickrApi, flickrUserId);
	flickr.getPhoto(id, populatePhoto);
	
	// Show photo and hide loader
	$('#selectedPhoto').load(function() {
		$('#loading').hide();
		$('#photoContainer').show();
	})
}

function prevPhoto() {
	var prevId = $('#thumbnails .selected').prev().attr('id');
	if (prevId != undefined) {
		loadPhoto(prevId);
	}
}

function nextPhoto() {
	var nextId = $('#thumbnails .selected').next().attr('id');
	if (nextId != undefined) {
		loadPhoto(nextId);
	}
}

// Utility functions
function getParameterByName(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if(results == null) {
		return "";
	}
	else {
		return decodeURIComponent(results[1].replace(/\+/g, " "));
	}
}