$(function() {

	//$('<i id="loading" class="fa fa-refresh fa-4 fa-spin">').append("#cy-eco");

	// DISPLAY A NODE'S PROPERTIES IN DETAILS AREA
	var displayNodeDetails = function(node) {
	
		// remove prior term info (if exists)
		$('p#node-info').remove();
		
		// make node data more assessible and ORGANIZE IT
		var nodeData = node.data();
		
		//console.log(nodeData); //FOR TESTING
		//console.log("nodeData['created_by'] = " + nodeData['created_by']); // prints correct val for 'created_by'

		// Title case property names
		function toTitleCase(str) {		//http://stackoverflow.com/a/196991/2900840
			return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
		
		// Display Node's properties to DETAILS AREA
		for (var property in nodeData ) {  //http://stackoverflow.com/a/16735184/2900840
			if (nodeData.hasOwnProperty(property)) {
				//console.log("property = " + property);
				//console.log("VAL = " + node.data(property));	
			
				if (property == 'id') {
					$('<p id="node-info"><strong>ID:</strong>  ' + node.data(property) + '</p>').appendTo('#node-id');		
				} else if (property == 'name') { 
					$('<p id="node-info"><strong>Name:</strong>  ' + node.data(property) + '</p>').appendTo('#node-name');
				} else if (property == 'def') {
					$('<p id="node-info"><strong>Definition:</strong>  ' + node.data(property) + '</p>').appendTo('#node-def');
				} else if (property == 'created_by') {
					$('<p id="node-info"><strong>Created By:</strong>  ' + node.data(property) + '</p>').appendTo('#node-created_by');					
				} else if (property == 'creation_date') {
					$('<p id="node-info"><strong>Creation Date:</strong>  ' + node.data(property) + '</p>').appendTo('#node-creation_date');					
				} else {
					var property_key = property.replace(/\_/g, ' '); 
					property_key = toTitleCase(property_key);
					$('<p id="node-info"><strong>' + property_key + ':</strong>  ' + node.data(property) + '</p>').appendTo('#node-details');
				}
				
			} // end if hasOwnProp
		} //end for prop in nodeData
	} // end displayNodeDetails
	
	// PLOT A NODE AND ITS NEIGHBORHOOD
	var plotNodeWithNeighbors = function(node, fromSearch) {		
		var xDistance = 75; // space between nodes (x-coors)
		
		var posY = node.position('y'); //get y-coord of selected node
		var posX = node.position('x'); //get x-coord of selected node
		
		// Get parent node OUT of neighbor so it doesnt remap
		var nodeParent = node.outgoers().target(); //gets the edges and targets coming out from node
		var neighborhood = node.neighborhood(); // includes parent! need to get children
		
		var parentCount = 0;
		
		// root nodes error without this:
		if (nodeParent) {
			console.log('nodeParent = ', nodeParent.data('id')); // FOR TESTING
			var nodeParentId = nodeParent.data('id');
			parentCount = nodeParent.length;
			
			nodeParent.removeClass('faded').addClass('active'); // MIGHT BE ABLE TO REMOVE THIS...SHOULD NOT BE HERE. PLOTTING ONLY
//			neighborhood.filter(function(i, node) {
//				if ( node.data('id') === nodeParent.data('id') || node.data('target') === nodeParent.data('id')) {
//					console.log('node.data(id) = ', node.data('id'));
//					//return node.data('id') != nodeParent.data('id');
//					return node;
//				} else {
//					return node;
//				}
//			});			
			
		}// else {return true;}
		
		// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
		//
		//  PROBLEM:  childCount > ?? number cause the viewport to zoom out REALLY far...TOO too far
		//
		//		IDEA to fix:  ~ 15-17 nodes across is good for viewing (HARDCODED, not dynamic though)
		//					 Every 15-17 nodes should start a NEW ROW and STAGGER between prior row
		//	The 'Cheese-Wine' demo might help: http://jsbin.com/gist/cde4db55e581d10405f5?output
		//
		//
		// TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
		
		var childCount = neighborhood.filter('node').length - parentCount; // number of child nodes
		console.log(childCount / 2);
		
		var xStartPoint = posX - (xDistance * childCount); //from the selected node x-coord, start at half of the total distance between all child nodes 
		
		neighborhood.positions(function(i, node) {
		
			// Parent nodes - plot them
				// keeps the parent node position the same. BUT causes 'hole' in rank where it would otherwise appear
				// just another reason that parent node needs removed from neighborhood
			if ( node.data('id') === nodeParentId ) {  
				// If parent node has NOT been plotted, plot it above selectedNode
				if ( node.position('x') === 0 && node.position('y') === 0 ) { 
					return {
						x: posX,
						y: posY - 100
					};
				}
				// If parent node HAS been plotted 							   
				else {
					// If from the Search Bar, move parent node to position above selected node
					if ( fromSearch == true) {
						return {
							x: posX,
							y: posY - 100
						};
					
					// If NOT from the Search Bar, keep x-y coors the same 
					} else {
						return {
							x: node.position('x'),
							y: node.position('y')
						};
					}
				}
			// Non-parent neighborhood nodes - plot them
			} else {
				// If a node is NOT already plotted give it x-y coors
				if (node.position('x') === 0 && node.position('y') === 0) {
					return {
						x: i * xDistance + xStartPoint,
						y: posY + 100
					};	
				}
				// If a node has already been plotted, return those x-y coors to keep its position the same
				else {
					return {
						x:node.position('x'),
						y:node.position('y')
					};
				}
			}
		}); // end neighborhood.positions
	} // end plotNodeWithNeighbors


	var cy = cytoscape({
		container: $('#cy-eco'),
		boxSelectionEnabled: false,
		autounselectify: true,
		textureOnViewport: true,	// set to 'true' = smoother animations
		motionBlur: false,
		
		//layout: {name: 'dagre'},
		style: cytoscape.stylesheet()
			.selector('node')
			  .css({
				'content': 'data(id)',
				'height': 60,
				'width': 60,
				'text-valign': 'center',
				'color': 'white',
				'text-outline-width': 2,
				'text-outline-color': '#888'
			  })
			.selector('edge')
			  .css({
			  	'width': 6,
			  	'line-style': 'solid',
			  	'line-color': '#ffaaaa',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': '#ffaaaa'
			  })
			.selector('.UsedInEdge')
			  .css({
			  	'width': 4,
			  	'line-style': 'dashed',
			  	'line-color': '#c1cac5',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': '#c1cac5'
			  })
			.selector('.selected')
			  .css({
			  	'height': 70,
			  	'width': 70,
			  	'font-size': '1.25em',
			  	'font-weight': 'bold',
				'background-color': 'black',
				'line-color': 'black',
				'target-arrow-color': 'black',
				'source-arrow-color': 'black',
				'text-outline-color': 'black'
			  })
			.selector('.active')
			  .css({
				'opacity': 1,
				'text-opacity': 1
			  })
			.selector('.faded')
			  .css({
				'opacity': 0.25,
				'text-opacity': 0
			  })
			.selector('.cleared')
			  .css({
				'opacity': 0,
				'text-opacity': 0
			  })
		  	.selector('.hidden')
		  	  .css({
		  	  	'opacity': 0,
		  	  	'text-opacity': 0
		  	  }),
		layout: {
			name: 'dagre',
			nodeSep: 30,
			edgeSep: 30,
			rankSep: 30,
			rankDir: 'TB',
			fit: true,
			padding: 30
		}
////		layout: {
////			name: 'breadthfirst',
////			directed: true,
////			padding: 10
////		}
//		layout: {
//			name: 'cose',
//			idealEdgeLength: 100,
//			nodeOverlap: 20,
//			padding: 10
//		}
	}); //end var cy
	
		
	var searchTerms = []; //for search bar, will hold searchable eco ids and names
	
	$.getJSON( "https://raw.githubusercontent.com/dolleyj/cytoscape/master/TEST_eco_from_obo.json", function( data ) {	
//	$.getJSON( "https://raw.githubusercontent.com/dolleyj/cytoscape/master/eco_from_obo.json", function( data ) {
		var newNodes = []; // for graph


		$.each( data, function( key, val ) {
			var node = [];

			if (/^ECO/.test(key)) {
				var properties = [];
					
				// create searchable list for jQuery search bar
				searchTerms.push({'category': 'Term Name', 'label': key + " " + val.name[0], 'value': key + " " + val.name[0], 'node': key});
				
				// loop through term's properties
				for ( property in val ) {
					//console.log(property, val[property]); // FOR TESTING
											
					var attr = property;
					var info = [];
					properties['id'] = [];
											
					info = val[property];
				
					properties[property] = info;
					properties['id'] = key;
				}
				//console.log("properties = ", properties);	//FOR TESTING
				//console.log("ECO ID = " + key); //FOR TESTING
				
				// create NODES for cy graph
				newNodes.push(
					{group: "nodes",
						data: properties,
						position: {
							x: 0,
							y: 0
							}
					}
				);

				if (!val.is_a) {
					console.log("IS_A IS UNDEFINED!!\n");
				}
				else {
					//console.log("IS_A = " + val.is_a);
					// clean is_a statements then create an edge for each
					for ( var element = 0; element < val.is_a.length; element++ ) {
						var clean_is_a = val.is_a[element].replace( /\s\{.*\}/g, "" ); 
				
						newNodes.push(
				  			{group: "edges", 
				  				data: {
				  					id: key + clean_is_a, 
				  					source: key, 
				  					target: clean_is_a
				  					}
		  					}
				  		);
					 } //end for
				} //end else
				
				// Create EDGES for nodes containing 'USED_IN' relationships
				if (val.relationship) { 
					//console.log("RELATIONSHIP = " + val.relationship); //FOR TESTING
					
					//http://stackoverflow.com/a/432503/2900840
					var ecoTermRegex = /\s(ECO:\d+)\s/;
					var match = ecoTermRegex.exec(val.relationship);				
					var usedInTarget = match[0].trim();
					//console.log("usedInTerm = " + usedInTarget);
					
					newNodes. push(
						{group: "edges",
							data: {
								id: key + usedInTarget,
								source: key,
								target: usedInTarget,
								used_in: true
								},
							classes: 'UsedInEdge'	//applies styling for used_in edges		
						}
					);
				}
				//console.log( "NEWNODES = ", newNodes );
				
			} else {return;} // skip terms that are NOT ECO terms		
			
		}); //end $.each 
		
		// loop thru newNodes to add CORRECT positions
		var nodeCounter = 0;
		$.each( newNodes, function( key, val ) {
			
			// Explicitly calls root terms and set START positions
			if (val.data.id === "ECO:0000000" | val.data.id === "ECO:0000217"){
				//console.log(val.data.id, "is a root");
				val.position.x = 0 + (nodeCounter*500); // offset node position so root nodes do not overlap
				val.position.y = -200;
				nodeCounter++;
			} else {
				
				// Set positions for direct children terms of roots
				if (val.data.target === "ECO:0000000" | val.data.target === "ECO:0000217" ) {   /// THIS IS READING 'EDGES'. ERRORS BECAUSE NODES DONT CONTAIN A 'TARGET'
					//val.position.x = 0 + (xLeftOrRight*nodeCounter*250);						/// NEED TO ADD A 'IS_A' TO THE NODE DATA (ABOVE)
					//val.position.y = 50;
				//	console.log(val.data.id, " CHILD");
				} else {
					//console.log("ELSE!");
				}
			} // end if-else
		}); // end .each
		
		// add all terms to graph
		cy.add(newNodes);
		
		//hide all terms EXCEPT root terms
		cy.filter(function(i, element) {
			if ( element.isNode() && element.data("id") === "ECO:0000000" || element.data("id") === "ECO:0000217") {
				element.removeClass('hidden').addClass('active');
				console.log("GOT to cy.filter!");
			} else {
				element.addClass('hidden');
			}
		});
		


//		var nodes = newNodes.id;
////		//var nodeName = cy.nodes.data('name');
//		console.log('nodes ' + nodes);
////		//console.log('nodeName ' + nodeName);
		
	}).then(function(){
		$('#loading').hide();
		
		// SET ECO TERM SEARCH BAR		
		$.widget( "custom.catcomplete", $.ui.autocomplete, {
			_create: function() {
			  this._super();
			  this.widget().menu( "option", "items", "> :not(.ui-autocomplete-category)" );
			},
			_renderMenu: function( ul, items ) {
			  var that = this,
				currentCategory = "";
			  $.each( items, function( index, item ) {
				var li;
				if ( item.category != currentCategory ) {
				  ul.append( "<li class='ui-autocomplete-category'><b><u>" + item.category + "</u></b></li>" );
				  currentCategory = item.category;
				}
				li = that._renderItemData( ul, item );
				if ( item.category ) {
				  li.attr( "aria-label", item.category + " : " + item.label );
				}
			  });
			  ul.css({'z-index': 99999}); //brings the search suggestions 'to the top', above the graph
			}
		});	
			
		// change input outline color to match site's theme
		$('input, textarea').focus(function() {
			$(this).css('outline-color', '#B1DDAB');	
		});

		$("#eco-search").catcomplete({
			source: searchTerms,			
			minLength: 2,

			// select drop-down item. Then press 'Enter' to go display Node, its information, and neighborhood
			select:function(e,ui) {
				$('#eco-search').keypress(function(e){
					if (e.which ==13) {

						console.log(ui.item.node);
						var selectedNodeId = ui.item.node;
						var selectedNode = cy.getElementById(selectedNodeId);
						var selectedNeighborhood = selectedNode.neighborhood();
						
						// hide ALL node and edges
						cy.elements().removeClass('faded active selected').addClass('hidden');
						
						// Plot selected node and its neighborhood
						var fromSearch = true;
						plotNodeWithNeighbors(selectedNode, fromSearch);
						
						// apply css styles to visualize node and neighborhood
						selectedNode.removeClass('hidden').addClass('selected');
						selectedNeighborhood.removeClass('hidden').addClass('active'); 						
						
						// display node's info
						displayNodeDetails(selectedNode);
						
						// redraw (realign mouse coords with graph coords)
						cy.resize(); 
		
						// recenter the graph based on new active nodes
						cy.animate({
							fit: {
								eles: selectedNeighborhood,
								padding: 40
								}
							}, {
							duration: 1000
						});

						
						selectedNodeId = null; // Reset selectedNodeId so user can search for a new term
					}
				});
			} // end select:function

		}); // end catcomplete	
			
			
	}); // end .getJSON
	
	
	// centers the graph in viewport
	cy.center();
	//cy.fit();
	
	//Displays ONLY root terms at graph load
	cy.filter(function(i, element) {
		if ( element.isNode() && element.data("id") === "ECO:0000000" || element.data("id") === "ECO:0000217") {
			element.hide();
			console.log("GOT to cy.filter! Only Roots displayed");
		} else {console.log("Nope");}
	});

//	var xDistance = 75; // space between nodes (x-coors)

	// Displays selected node's children
	cy.on('tap', 'node', function(e){
		var node = e.cyTarget;
		var neighborhood = node.neighborhood(); // includes parent! need to get children
		
		// plot node and its neighbors
		var fromSearch = false;
		plotNodeWithNeighbors(node, fromSearch);

		
		// apply styles...
		cy.elements().addClass('faded').removeClass('active selected'); //all nodes
		
		node.removeClass('faded').addClass('selected'); // tapped node
		neighborhood.removeClass('faded hidden').addClass('active');  // tapped node's children
		
		
		//removes any existing node information and displays current node info
		displayNodeDetails(node); 
		
		// redraw (realign mouse coords with graph coords)
		cy.resize(); 
		
		// recenter the graph based on new active nodes
		cy.animate({
			fit: {
				eles: neighborhood,
				padding: 40
				}
			}, {
			duration: 1000
		});
	});

	// Right-click on active/faded node
	cy.on('cxttap', 'node', function(e) {
		var node = e.cyTarget;
		//var nodeNeighbors = node.neighborhood('.active'); //select only neighbors that are active
		
		var edgesConnected = node.connectedEdges(); //selected ALL edges connected to the node
		var edge = edgesConnected.connectedNodes('.active').edgesWith(node); //get the edge that connects the target node with an active one


		console.log("EDGE = ", edge); //FOR TESTING 
 
 		// if FADED, make node ACTIVE, and its edge too, if connecting to another ACTIVE node
		if (node.hasClass('faded')) {
			node.removeClass('faded').addClass('active');
			edge.removeClass('faded').addClass('active');
		}
		
		// if ACTIVE, make node FADED, and its edge too (if also ACTIVE) 
		else if (node.hasClass('active')) {
			node.removeClass('active').addClass('faded');
			edge.removeClass('active').addClass('faded');
		}
		
		// if SELECTED, make node ACTIVE
		else if (node.hasClass('selected')) {
			node.removeClass('selected').addClass('active');
		}
		
		// resize & recenter the graph based on ACTIVE nodes
		var nodesActive = cy.$('.active');
		cy.animate({
			fit: {
				eles: nodesActive,
				padding: 40
				}
			}, {
			duration: 1000
		});
	});

	// remove faded nodes
	$('#button-clear').click(function() {
		console.log('clear the faded!');
		var node = cy.$('.faded');

		node.removeClass('faded').addClass('cleared');
		

	});
	
	// restore faded nodes that were cleared
	$('#button-unclear').click(function() {
		console.log('unclear the faded!');
		var nodes = cy.$('.cleared');
		
		nodes.removeClass('cleared').addClass('faded');
		
		//cy.resize(); //not needed?
		
		// resize & recenter the graph based on new active nodes
		cy.animate({
			fit: {
				eles: nodes,
				padding: 40
				}
			}, {
			duration: 1000
		});		
	});
	
	$('#button-print').click(function() {
		var png = cy.png();
		$('#button-print').attr('href', png).attr('download', 'ecoGraph.png');
	});	


}); // end script
