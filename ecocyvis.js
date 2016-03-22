$(function() {

	//$('<i id="loading" class="fa fa-refresh fa-4 fa-spin">').append("#cy-eco");

	var displayNodeDetails = function(node) {
	
		// remove prior term info (if exists)
		$('p#term-info').remove();
	
		// display term information
		var nodeID = $('<p id="term-info"><strong>ID:</strong>  ' + node.data('id') + '</p>').appendTo('#details');
		var nodeName = $('<p id="term-info"><strong>Name:</strong>  ' + node.data('name') + '</p>').appendTo('#details');
		var nodeDef = $('<p id="term-info"><strong>Definition:</strong>  ' + node.data('definition') + '</p>').appendTo('#details');
		var nodeComment = function(){
			if ( node.data('comment') ) { 
				 return $('<p id="term-info"><strong>Comment:</strong>  ' + node.data('comment') + '</p>').appendTo('#details'); 
			} else {return}
		}
		var nodeSyn = function() {
			if ( node.data('synonym') ) { 				
				return $('<p id="term-info"><strong>Synoym:</strong>  ' + node.data('synonym') + '</p>').appendTo('#details');
			} else {return}
		}
		var nodeDisjoint = function() {		
			if ( node.data('disjoint_from') ) {		
				return $('<p id="term-info"><strong>Disjoint from:</strong>  ' + node.data('disjoint_from') + '</p>').appendTo('#details');
			} else {return}
		}
		var nodeXref = function() {		
			if ( node.data('xref') ) {		
				return $('<p id="term-info"><strong>Xref:</strong>  ' + node.data('xref') + '</p>').appendTo('#details');
			} else {return}
		}
		var nodeIsA = function() {		
			if ( node.data('is_a') ) {				
				return $('<p id="term-info"><strong>Is a:</strong>  ' + node.data('is_a') + '</p>').appendTo('#details');
			} else {return}
		}
		var nodeIsObs = function() {		
			if ( node.data('is_obsolete') ) {		
				return $('<p id="term-info"><strong>is obsolete:</strong>  ' + node.data('is_obsolete') + '</p>').appendTo('#details');
			} else {return}
		}
		var nodeCreatDate = function() {			
			if ( node.data('creation_date') ) {				
				return $('<p id="term-info"><strong>Creation Date:</strong>  ' + node.data('creation_date') + '</p>').appendTo('#details');
			} else {return}
		}
		var nodeCreatBy = function() {		
			if ( node.data('created_by') ) {				
				return $('<p id="term-info"><strong>Created by:</strong>  ' + node.data('created_by') + '</p>').appendTo('#details');
			} else {return}
		}
		
		return nodeID + nodeName + nodeDef + nodeComment + nodeSyn + nodeDisjoint + nodeXref + nodeIsA + nodeIsObs + nodeCreatDate + nodeCreatBy;
	} // end displayNodeDetails


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
			  	'line-color': '#ffaaaa',
				'target-arrow-shape': 'triangle',
				'target-arrow-color': '#ffaaaa'
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
	
	$.getJSON( "https://raw.githubusercontent.com/dolleyj/flatfile_visualizer/master/eco_from_obo.json", function( data ) {
		var newNodes = [];		
					
//		var counter = 0; 
//		var xStartCoor = 0;
//		var yStartCoor = 0;
//		var xLeftOrRight = function() {
//			var randNum = Math.floor((Math.random() * 10) + 1);
//			if (randNum >= 5) {
//				return -1;
//			} else if (randNum < 5) {
//				return 1;
//			}
//		}
		var ySpaceNode = 10;
		$.each( data, function( key, val ) {
			if (/^ECO/.test(key)) {


			//console.log("ECO ID = " + key); //FOR TESTING
			//console.log(val.name); //FOR TESTING
			//console.log(val.def); //FOR TESTING

			// val.is_a returns "ECO:0005542ECO:0000352 {is_inferred="true"},ECO:0005553" 
			//is_inferred causes error when creating edge (below). Need to only get ECO ids for creating edges

// For creating 'position' for each node. AND to loop thru OBO file once instead of twice
// http://stackoverflow.com/questions/31829231/

			// For root terms: Evidence & Assertion Method (no parents)
			if ( val.is_a.length === 0 ) { 			
				//console.log("is_a UNDEFINED"); //FOR TESTING
				
				newNodes.push(
		  			{group: "nodes", 
			  			data: {
			  				id: key, 
			  				name: val.name, 
			  				definition: val.def,
			  				is_a: undefined,
			  				notChild: true
			  				},
		  				position: {
		  					x: 0, //xStartCoor+(counter*xLeftOrRight*10), 
		  					y: 0 //yStartCoor + ySpaceNode}
	  					} 
	  				}
				);
//				counter++;
			// For all other terms under root terms
			} else {
				// For Terms with more than one 'is_a'
				if ( val.is_a.length > 1 ) {
				
					// clean is_a statements then create an edge for each
					for ( var element = 0; element < val.is_a.length; element++ ) {
						var clean_is_a = val.is_a[element].replace( /\s\{.*\}/g, "" ); // removed "{is_inferred=true}"
						//console.log("clean is_a = " + clean_is_a); //FOR TESTING				
						newNodes.push(
//				  			{group: "nodes", 
//				  				data: {
//				  					id: key, 
//				  					name: val.name, 
//				  					definition: val.def,
//				  					is_a: val.is_a,
//				  					notChild: false
//				  					},
//			  					position: {x:25*counter*xLeftOrRight, y:20*counter+(ySpaceNode*10)}
//			  				},
				  			{group: "edges", 
				  				data: {
				  					id: key + clean_is_a, 
				  					source: key, 
				  					target: clean_is_a
				  					}
			  					}
				  		);
//				  		counter++;
					 } //end for
					
					// create a node that contains the cleaned 
		 			newNodes.push(
		 				{group: "nodes", 
		  				data: {
		  					id: key, 
		  					name: val.name, 
		  					definition: val.def,
		  					is_a: val.is_a,
		  					notChild: false
		  					},
						position: {
							x:0, //25*counter*xLeftOrRight, 
							y:0 //20*counter+(ySpaceNode*10)
							}
						}
					);
					//console.log(val.is_a, "  IS_A"); //FOR TESTING
//					counter++;
				} else {
					// For Terms with 1 'is_a'
					var clean_is_a = val.is_a[0].replace( /\s\{.*\}/g, "" ); // removed "{is_inferred=true}"
					//console.log("clean is_a = " + clean_is_a); //FOR TESTING
					newNodes.push(
			  			{group: "nodes", 
			  			data: {
			  				id: key, 
			  				name: val.name, 
			  				definition: val.def,
			  				notChild: false
			  				},
			  				position: {
			  					x:0, //25*counter, 
			  					y:0 //20*counter+(ySpaceNode*10)
			  					}
		  				},
			  			{group: "edges", 
			  				data: {
			  					id: key + clean_is_a, 
			  					source: key, 
			  					target: clean_is_a
			  					}
	  					}
			  		);
//			  		counter++;		
				} //end if more than 1 'is_a'
			} //end if 'is_a' exists	
			}else {return;} // skip terms that are NOT ECO terms
		}); //end $.each
		
		//console.log(newNodes); //FOR TESTING
		// TODO need to loop thru newNodes to set x-y positions
		// 1) Root terms: Assertion Method & Evidence SHOULD be at/near top DONE
		//		They are the parents-of-all-parents
		// 2) All childs of same rank SHOULD be on at same y-position DONE
		// 3) 
		
		// loop thru newNodes to add CORRECT positions
		var nodeCounter = 0;
		$.each( newNodes, function( key, val ) {
			
			// Explicitly calls root terms and set START positions
			if (val.data.id === "ECO:0000000" | val.data.id === "ECO:0000217"){
				console.log(val.data.id, "is a root");
				val.position.x = 0 + (nodeCounter*500); // offset node position so root nodes do not overlap
				val.position.y = -200;
				val.data.isRoot = true; //assign node as an ontology root
				//console.log("isRoot ", val.data.isRoot);
				nodeCounter++;
			} else {
				
				// Set positions for direct children terms of roots
				if (val.data.target === "ECO:0000000" | val.data.target === "ECO:0000217" ) {   /// THIS IS READING 'EDGES'. ERRORS BECAUSE NODES DONT CONTAIN A 'TARGET'
					//val.position.x = 0 + (xLeftOrRight*nodeCounter*250);						/// NEED TO ADD A 'IS_A' TO THE NODE DATA (ABOVE)
					//val.position.y = 50;
					console.log(val.data.id, " CHILD");
				} else {
					console.log("ELSE!");
				}
////			// Find root nodes
////			if (val.notChild) {
////				//console.log(key, " is possible root.");
////				
////			} else {
////				//console.log(key, " not possible root.");
////			
////			}
			}
		
		
		});
		
		// add all terms to graph
		cy.add(newNodes);
		
		//hide all terms EXCEPT root terms
		cy.filter(function(i, element) {
			if ( element.isNode() && element.data("id") === "ECO:0000000" || element.data("id") === "ECO:0000217") {
//				element.show();
				element.removeClass('hidden').addClass('active');
				console.log("GOT to cy.filter!");
			} else {
//				element.hide();
				element.addClass('hidden');
			}
		});
		
	}).then(function(){
			$('#loading').hide();
			
			
			
			
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

	var xDistance = 75; // space between nodes (x-coors)

	// Displays selected node's children
	cy.on('tap', 'node', function(e){
		var node = e.cyTarget;
		var posY = node.position('y'); //get y-coord of selected node
		var posX = node.position('x'); //get x-coord of selected node
		
		//TODO need to get parent node OUT of neighbor so it doesnt remap
		var nodeParent = node.outgoers().target(); //gets the edges and targets coming out from node
		var neighborhood = node.neighborhood(); // includes parent! need to get children
		
		var parentCount = 0;
		
		// root nodes error without this:
		if (nodeParent) {
			console.log('nodeParent = ', nodeParent.data('id'));
			var nodeParentId = nodeParent.data('id');
			parentCount = nodeParent.length;
			
			nodeParent.removeClass('faded').addClass('active');
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
		
		
		var childCount = neighborhood.filter('node').length - parentCount; // number of child nodes
		console.log(childCount / 2);
		
		var xStartPoint = posX - (xDistance * childCount); //from the selected node x-coord, start at half of the total distance between all child nodes 
		
		neighborhood.positions(function(i, node) {
			if ( node.data('id') === nodeParentId ) {  // keeps the parent node position the same. BUT causes 'hole' in rank where it would otherwise appear
				return {							   // just another reason that parent node needs removed from neighborhood
					x: node.position('x'),
					y: node.position('y')
				};
			} else {
				// If a node is NOT already plotted give it x-y coors
				if (node.position('x') === 0 && node.position('y') === 0) {
					return {
						x: i * xDistance + xStartPoint,
						y: posY + 100
					};	
				}
				else {
					// If a node has already been plotted, return those x-y coors to keep its position the same
					return {
						x:node.position('x'),
						y:node.position('y')
					};
				}
			}
		});
		
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
				padding: 80
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
				padding: 80
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
				padding: 80
				}
			}, {
			duration: 1000
		});		
	});
	
	$('#button-print').click(function() {
		var png = cy.png();
		$('#button-print').attr('href', png).attr('download', 'ecoGraph.png');
	});
	
	
	//// COMMENTED OUT TO WORK ON: TODO GENERATE NODE POSITIONS. x:root+whatever AND animate/show connectedNodes	
////	cy.on('tap', 'node', function(e){
////		var node = e.cyTarget; 
////		var neighborhood = node.neighborhood().add(node);

////		cy.elements().addClass('faded');
////		//cy.elements().hide();
////		neighborhood.removeClass('faded');
////		//neighborhood.show();
////	});

////	cy.on('tap', function(e){
////		if( e.cyTarget === cy ){
////			cy.elements().removeClass('faded');
////		}
////	});
	
  	// TO LOOP thru json and add nodes/edges
  	//http://stackoverflow.com/questions/23454473/add-nodes-and-edges-through-loop-in-cytoscape-arbor-layout

}); // end script
