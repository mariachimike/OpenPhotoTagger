# OpenPhotoTagger

OpenPhotoTagger is a jQuery UI plugin for general photo tagging (similar to Facebook photo tagging). It allows an application to pass in auto-complete items and a save callback.

- jQuery UI support: 1.8+

### Requirements

jQuery 1.4.2+ and jQuery UI 1.8+ must be included for this plugin to work.

### Usage Examples

$('.taggable').openPhotoTagger({
				photoId: '1',
				cbAutoComplete : function(str, list) {
					
					$.ajax({
						url: '/autocomplete',
						type: 'GET',
						data: { string: str },
						error: function(jqXHR, textStatus, errorThrown) {
							return;
						},
						success: function(data, textStatus, jqXHR) {
						
							if (data.status !== undefined && data.status === 'success') {
							
								var d = data.data,
									len = d.length,
									items = '',
									x;
								
								// append items to the list
								for (x = 0; x < len; x++) {
									items += '<li data-oid="' + d[x].id + '" data-otype="' + d[x].type + '">' + d[x].item + '</li>';
								}
								
								list.empty().append(items);							
							}
						
						}
					
					});
					
				},
				cbSaveTags : function(tags) {
					
					$.ajax({
						url: '/save',
						type: 'GET',
						data: tags,
						error: function(jqXHR, textStatus, errorThrown) {
							return;
						},
						success: function(data, textStatus, jqXHR) {
						
							if (data.status !== undefined && data.status === 'success') {							
								// do something					
							}
						
						}
					
					});
					
				},
				tags: [
					{
						x_pos: 24,
						y_pos: 25,
						width: 130,
						height: 130,
						note: 'Cargo pants',
						photo_id: 100,
						other: {
							oid: '24',
							otype: 'person'
						}
					},
					{
						x_pos: 224,
						y_pos: 75,
						width: 130,
						height: 130,
						note: 'Dog',
						photo_id: 80,
						other: {
							oid: '28',
							otype: 'animal'
						}
					},
					{
						x_pos: 178,
						y_pos: 135,
						width: 130,
						height: 130,
						note: 'Underwear',
						photo_id: 90,
						other: {
							oid: '25',
							otype: 'clothes'
						}
					},
				]
			});


### Release Notes

	Rev 0.1 	This release supports fixed dimension tags