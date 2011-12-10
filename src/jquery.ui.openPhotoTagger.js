/**
 * @fileOverview OpenPhotoTagger Component
 * @author Michael Palmer
 * @requires jQuery, jQuery UI
 */
 
/**
 * @class
 * OpenPhotoTagger is a simple photo tagging jQuery UI plugin
 * @param options.interactionMode   string   Whether or not to allow tagging. 
 *     Accepted values: 'edit' or 'view'
 * @param options.sizeMode          string   Tag size 'fixed' or 'free' mode
 * @param options.fixedDimensions   array    Dimensions of tag size in 'fixed'
 *     mode. [width, height]
 * @param options.tagSwitch         object   Optional DOM element if user wants
 *     to provide own tag mode switch
 * @param options.classPrefix       string   CSS prefix for namespacing
 * @param options.classTaggingEnabled string Classname for tagging enabled mode
 * @param options.eventNamespace    string   Event namespacing 
 * @param options.photoId           string   Photo ID (for tag association)
 * @param options.strings           object   Strings for UI
 * @param options.cbSaveTags        function Callback to be called when mode 
 *     changes from Tagging Enabled to Tagging Disabled
 * @param options.cbAutoComplete    function Optional callback which if provided
 *     is called when the user types more than two letters into the input
 * @param options.tags              array    Array of pre-set tags
 */
var OpenPhotoTagger = {
	options : {
		interactionMode: 'edit', // 'edit', 'view'
		sizeMode: 'fixed', // 'fixed', TODO: 'free' mode
		fixedDimensions: [130, 130],
		tagSwitch: undefined,
		classPrefix: 'opt',
		classTaggingEnabled: 'tagging_enabled',
		eventNamespace: '.openPhotoTagger',
		photoId: '',
		strings : {
			strStartTagging : 'Tag this photo',
			strFinishTagging : 'Save and finish tags',
			strRemove : 'Remove tag'
		},
		cbSaveTags: undefined, // required, callback to save tag data
		cbAutoComplete: undefined, // callback, to see if you want to send results as user types
		tags: [] // array
	},
	/**
	 * @private
	 * Indicates whether or not tagging is enabled
	 */
	_isTaggingEnabled: false,
	/**
	 * @private
	 * DOM element reference to the container created around the image
	 */
	_container: undefined,
	/**
	 * @private
	 * DOM element reference to the tag mode toggle
	 */
	_tagSwitch: undefined,
	/**
	 * @private
	 * Object to keep track of tags
	 */
	_tags: {},
	/**
	 * @private
	 * @function
	 * Build the DOM, do initial set up processes
	 * @return void
	 */
	_create: function() {
	
		var that = this,
			o = this.options,
			prefix = o.classPrefix,
			obj;
		
		// create container div
		this._container = $('<div class="' + prefix + '_container" />').insertAfter(this.element).css({
				width : this.element.css('width'),
				height : this.element.css('height')
			});		
		
		// move img into container					
		this._container.append(this.element);
		
		if (o.interactionMode === 'edit') {
		
			if (o.tagSwitch !== undefined) {							
				this._tagSwitch = $(o.tagSwitch).addClass(prefix + '_tag_link');
				
			} else {
				this._tagSwitch = $('<a />', {
					href: '',
					className: prefix + '_tag_link',
					html: o.strings.strStartTagging
				});
				
				this._container.append(this._tagSwitch);
			}
			
			this._tagSwitch.bind('click' + o.eventNamespace, function(e) {
				e.preventDefault();
				e.stopPropagation();
				
				if (that._isTaggingEnabled === false) {
					that.enableTagging();
				} else {
					that.disableTagging();
				}			
				
			});
			
		}
		
	},
	/**
	 * @private
	 * @function
	 * Resets initial state, generates tags
	 * @return void
	 */
	_init: function() {
	
		var tags = this.options.tags,
			len = tags.length,
			k;
		
		// insert tags
		if (len > 0) {
		
			for (k = 0; k < len; k++) {
				this._createTag(tags[k]);
			}
		
		}
		
	},
	/**
	 * @private
	 * @function
	 * Create tag
	 * @param tag object 
	 * @return void
	 */
	_createTag: function(tag) {
	
		// create index
		var that = this,
			o = this.options, 
			tag_index = 'tag' + Math.floor(Math.random()*10000+1),
			prefix = o.classPrefix,
			container = this._container,
			ctb,
			ctbrb;
		
		// add to tags added bit
		this._tags[tag_index] = tag;
		
		ctb = $('<div />', {
			className: prefix + '_completed_tag_box',
			css : {
				left: tag.x_pos + 'px',
				top: tag.y_pos + 'px',
				width: tag.width,
				height: tag.height
			},
			html: '<p>' + tag.note + '</p>'
		});
		
		ctb.attr('data-tagid', tag_index);
		
		ctbrb = $('<button />', {
			className: 'remove_button',
			html: o.strings.strRemove,
			click: function(e) {
				e.stopPropagation();
				e.preventDefault();
				
				var d = $(this).parent().data();

				// remove tag from DOM
				$(this).parent().remove();
				
				// delete tag from tags object
				delete that._tags[d.tagid];
			}
		});
		
		ctb.append(ctbrb);
		
		// create completed tag box
		$(container).append(ctb);
	
	},
	/**
	 * @public
	 * @function
	 * Set event handlers to create tagging box on click on container or moves
	 * if tagging box is already created
	 * @return void
	 */
	enableTagging: function() {
	
		var that = this,
			o = this.options,
			input;
			
		this._isTaggingEnabled = true;
		
		if (o.interactionMode === 'edit') {
		
			if (this._tagSwitch.html() === o.strings.strStartTagging) {
				this._tagSwitch.html(o.strings.strFinishTagging);
			}
			
			this._container.addClass(o.classTaggingEnabled);
			
			this._container.bind('click' + o.eventNamespace, function(e) {
				
				if (e.target.tagName !== 'INPUT'
					&& e.target.tagName !== 'UL'
					&& e.target.tagName !== 'LI') {
				
					// get coords first
					var xclick = e.pageX - this.offsetLeft,
						yclick = e.pageY - this.offsetTop,
						x = xclick - (o.fixedDimensions[0] / 2),
						y = yclick - (o.fixedDimensions[1] / 2),
						xinput = x + o.fixedDimensions[0] + 10,
						xaclist = xinput + 3,
						prefix = o.classPrefix,
						container = this,
						input,
						aclist,
						yaclistbuffer = 25,
						yaclist;
					
					// tag box exists
					if ($(this).find('.' + prefix + '_tag_box').length > 0) {
					
						// move tag box
						$($(this).find('.' + prefix + '_tag_box')[0]).css({
							left: x + 'px',
							top: y + 'px'
						});
						// move tag input
						$($(this).find('.' + prefix + '_tag_input')[0]).css({
							left: xinput + 'px',
							top: y + 'px'
						});
						
						input = $($(this).find('.' + prefix + '_tag_input')[0]);
						
						if ($(this).find('.' + prefix + '_autocomplete_list')) {
						
							yaclist = y + input.height() + yaclistbuffer;
						
							$(this).find('.' + prefix + '_autocomplete_list').css({
								left: xaclist + 'px',
								top: yaclist + 'px'							
							});
						
						}
						
					// no tag box, create one
					} else {
					
						// create tag box
						$(this).append($('<div />', {
							className: prefix + '_tag_box',
							css : {
								left: x + 'px',
								top: y + 'px',
								width: o.fixedDimensions[0],
								height: o.fixedDimensions[1]
							}
						}));
						
						// create text input
						input = $('<input />', {
							type : 'text',
							className: o.classPrefix + '_tag_input',
							name : '',
							value : '',
							css: {
								position: 'absolute',
								left: xinput + 'px',
								top: y + 'px'								
							}
						});
						
						// auto complete if passed in
						if (o.cbAutoComplete !== undefined) {
						
							yaclist = y + input.height() + yaclistbuffer;
						
							aclist = $('<ul />', {
								className: prefix + '_autocomplete_list',
								css : {
									left: xaclist + 'px',
									top: yaclist + 'px'	
								}
							});
							
							that._container.append(aclist);
							
							// mouse support
							aclist.bind('click' + o.eventNamespace, function(e) {
								
								e.stopPropagation();
								e.preventDefault();
								
								if (e.target.tagName === 'LI') {
								
									var x = $(container).find('.' + prefix + '_tag_box')[0].offsetLeft,
										y = $(container).find('.' + prefix + '_tag_box')[0].offsetTop,
										tag = {
											x_pos: x,
											y_pos: y,
											width: o.fixedDimensions[0],
											height: o.fixedDimensions[1],
											note: $(this).val(),
											photo_id: o.photoId
										};
																
									$(this).find('.active').removeClass('active');
									$(e.target).addClass('active');
									
									input.val($(e.target).text());
									tag.note = input.val();
									tag.extra = $(e.target).data();
									
									// create tag
									that._createTag(tag);
									
									// remove tag box, tag input, autocomplete
									$(container).find('.' + prefix + '_tag_input').remove();
									$(container).find('.' + prefix + '_tag_box').remove();
									$(container).find('.' + prefix + '_autocomplete_list').remove();
								
								}
								
							});
							
							
						}						
						
						// keyboard support
						input.bind('keyup' + o.eventNamespace, function(e){
						
							// get coords again
							var x = $(container).find('.' + prefix + '_tag_box')[0].offsetLeft,
								y = $(container).find('.' + prefix + '_tag_box')[0].offsetTop,
								tag = {
									x_pos: x,
									y_pos: y,
									width: o.fixedDimensions[0],
									height: o.fixedDimensions[1],
									note: $(this).val(),
									photo_id: o.photoId
								},
								comp_box_css = {
									left: x + 'px',
									top: y + 'px',
									width: o.fixedDimensions[0],
									height: o.fixedDimensions[1]
								},
								tag_index,
								ctb,
								ctbrb,
								active;
								
							// user presses enter
							if (e.which === 13) {
							
								// check to see if an autocomplete item is selected
								if (aclist !== undefined) {
								
									if (aclist.find('.active').length > 0) {
									
										$(this).val($(aclist.find('.active')[0]).text());
										tag.note = $(this).val();
										tag.extra = $(aclist.find('.active')[0]).data();
									
									}
								
								}
								
								// create tag
								that._createTag(tag);
								
								// remove tag box, tag input, autocomplete
								$(container).find('.' + prefix + '_tag_input').remove();
								$(container).find('.' + prefix + '_tag_box').remove();
								$(container).find('.' + prefix + '_autocomplete_list').remove();
								
							
							// down arrow or page down or tab
							} else if (e.which === 40 || e.which === 34 || e.which === 9) {
								
								if (aclist !== undefined) {
								
									if (aclist.find('.active').length > 0) {
									
										var n = $(aclist.find('.active')[0]);
										
										n.removeClass('active');
										
										if (n.next().length === 0) {										
											input.focus();										
										} else {
											active = n.next().addClass('active');										
											input.val(active.text());
										}
										
									} else {
										active = aclist.find('li:first-child').addClass('active');
										input.val(active.text());
									}
								
								}								
							
							// up arrow or page up
							} else if (e.which === 38 || e.which === 33) {
								
								if (aclist !== undefined) {
								
									if (aclist.find('.active').length > 0) {
									
										var n = $(aclist.find('.active')[0]);
										
										n.removeClass('active');
										
										if (n.prev().length === 0) {										
											input.focus();										
										} else {
											active = n.prev().addClass('active');
											input.val(active.text());											
										}
										
									} else {
										active = aclist.find('li:last-child').addClass('active');
										input.val(active.text());
									}
								
								}	
								
							
							} else {								
								
								if (o.cbAutoComplete !== undefined) {
								
									if ($(this).val().length > 2) {
									
										// pass aclist to cbAutoComplete
										o.cbAutoComplete($(this).val(), aclist);
									
									}
								
								}
								
							}
							
						});

						that._container.append(input);
						
					}
					
					input.focus();
				
				}
				
			});
			
			
		}
		
	},
	/**
	 * @public
	 * @function
	 * Disable tagging by removing the click handler on the container, will
	 * call the cbSaveTags callback function to save tag information
	 * @return void
	 */
	disableTagging: function() {
	
		var that = this,
			o = this.options;
			
		this._isTaggingEnabled = false;
		
		// change string
		if (this._tagSwitch.html() === o.strings.strFinishTagging) {
			this._tagSwitch.html(o.strings.strStartTagging);
		}
		
		// remove the click handler from the container
		this._container.unbind('click' + this.options.eventNamespace).removeClass(o.classTaggingEnabled);
		
		// hide remove buttons
		//this._container.find()
		
		// save the tags
		if (typeof o.cbSaveTags === 'function') {
			o.cbSaveTags(this._tags);
		}		
		
	},
	/**
	 * @private
	 * @function
	 * Move the original image element back outside of the container, remove
	 * the container
	 * @return void
	 */
	_destroy: function() {
		
		this.element.insertBefore(this._container);
		this._container.remove();
		
	}
};

$.widget('ui.openPhotoTagger', OpenPhotoTagger);