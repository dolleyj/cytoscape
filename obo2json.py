#!/usr/bin/env python

'''
	Goal:	From a Django view, or called by a Django view, this is attempting 
			to parse OBO file and pass the data for a cytoscape.js graph 

	Parse object data from a .obo file

    From http://stackoverflow.com/q/32989776/4014959

    Written by PM 2Ring 2015.10.07
'''

from __future__ import print_function, division

import json
from collections import defaultdict

import urllib.request
import io

#fname = "/home/dolley/practice_cytoscape/eco.obo"
term_head = "[Term]"

#Keep the desired object data here
all_objects = {}

def add_object(d):
	
#	#Ignore obsolete objects
#	if "is_obsolete" in d:
#		return
####################################################################
# This will grab term id and set all attributes to it
# This should prevent term attributes from being missed
	
	term_key = d['id'][0] # set object key with eco term id
	
	# This removes 'id' because its going to be set as object's key
	# and keeping it would make 'id' appear twice 
	#if "id" in d:		# REMOVED THESE 2 LINES TO MAKE JQUERY TERM SEARCH EASIER TO PARSE
	#	del d["id"]
		
	if "is_a" not in d:
		d["is_a"] = []
	
		
	# This 'is_a' description info. Remove it to keep descriptive info	
#	if "is_a" in d:
#		d["is_a"] = [s.partition(' ! ')[0] for s in d["is_a"]]
		
	all_objects[term_key] = d # set all of object's data that is present to id
#####################################################################
#####################################################################
'''
# This is for picking out specific parts of the terms

	#Gather desired data into a single list,
	# and store it in the main all_objects dict
	key = d["id"][0]
	name = d["name"]
	definition = d["def"]
	comment = d["comment"]
	synonym = d["synonym"]
	disjoint_from = d["disjoint_from"]
	xref = d["xref"]
	is_a = d["is_a"]  #will be 'target' for Cytoscape.js data json
	is_obsolete = d["is_obsolete"] # dont want to graph an obsolete term, but could have an obsolete list
	 
	created_by = d["created_by"]
	creation_date = d["creation_date"]
	#Remove the next line if you want to keep the is_a description info
	is_a = [s.partition(' ! ')[0] for s in is_a]
#	all_objects[key] = d["name"] + name + definition + is_a
	all_objects[key] = {"name": name, 
						"def": definition,
						"comment": comment,
						"synonym": synonym,
						"disjoint_from": disjoint_from,
						"xref": xref, 
						"is_a": is_a,
						"is_obsolete": is_obsolete,
						"created_by": created_by,
						"creation_date": creation_date						
	}
'''
####################################################################	

#A temporary dict to hold object data
current = defaultdict(list)

# Will hold the different term properties that each term COULD have
term_keys = list()


# Gets the most current ECO release
eco_obo_url = 'https://raw.githubusercontent.com/evidenceontology/evidenceontology/master/eco.obo'

# Open the URL and get the response (eco.obo object)
response = urllib.request.urlopen(eco_obo_url)

# Open and convert response from bytes into string
response_string = response.read().decode('utf-8')

# set the response_string as a StringIO object
# this includes a builtin open() so 'with open(...) as f' is NOT needed
# StringIO: http://stackoverflow.com/a/7472878/2900840
# Its included open(): http://stackoverflow.com/a/33395561/2900840
fname = io.StringIO(response_string)

for line in fname:
	if line.rstrip() == term_head:
		break

for line in fname:
	line = line.rstrip()
	if not line:
		#ignore blank lines
		continue
	if line == term_head:
		#end of term
		add_object(current)
		current = defaultdict(list)
	else:
		#accumulate object data into current
		key, _, val = line.partition(": ")
		current[key].append(val)
		
		# these 3 lines gather term properties.
		# This allows for me to know what possible fields exist for a term
		current_key = key
		if current_key not in term_keys:
			term_keys.append(current_key)

if current:
	add_object(current)    

#print("\nall_objects =")
#print(json.dumps(all_objects, indent = 4, sort_keys=True))

# print out the possible term properties
for key in term_keys:
	print(key)

with open("eco_from_obo.json", "w") as jsonfile:
	json.dump(all_objects, jsonfile, sort_keys = True, indent = 4)
	
fname.close() #clear the memory
