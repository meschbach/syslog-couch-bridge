"use strict";
/*
 * Copyright 2015 Mark Eschbach 
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Syslog to CouchDB bridge for nginx logs
 *
 * Suggested configuration for nginx:
log_format mee_json '{"format":[0,0,1],'
			'"connection":{'
				'"serial":$connection,'
				'"pipeline_index":$connection_requests,'
				'"pipelined":"$pipe",'
				'"client": {'
					'"address":"$remote_addr",'
					'"port":$remote_port'
				'}'
			'},'
			'"response":{'
				'"status":$status,'
				'"size":$bytes_sent,'
				'"bodySize":$body_bytes_sent'
			'},'
			'"cycle":{'
				'"when":$msec,'
				'"nginx":{'
					'"pid" : $pid,'
					'"hostname" : "$hostname"'
				'}'
			' },'
			' "request" : { '
				' "host" : { "host" : "$server_name", "port" : $server_port }, '
				' "proxy" : "$proxy_protocol_addr", '
				' "scheme" : "$scheme", '
				' "method" : "$request_method", '
				' "uri" : "$request_uri", '
				' "host" : "$host", '
				' "protocol" : "$server_protocol", '
				' "processsed-uri" : "$uri", '
				' "http_referer" : "$http_referer", '
				' "http_user_agent" : "$http_user_agent", '
				' "length" : $request_length, '
				' "user" : "$remote_user" '
			'}'
	' }\n ';
access_log syslog:server=syslog-couch-bridge:9405 mee_json;
 */

/***************************************
 * Command line argument parsing 
 **************************************/
var options =
	(function(){
		return require("yargs")
			.default( "port", process.env["PORT"] || 9405 )
			.default( "couch-url", process.env["COUCH_URL"] || "http://localhost:5984" )
			.default( "couch-db", process.env[ "COUCH_DB" ] || "development-monitor-http" )
			.alias( "v", "verbose" )
			.argv;
	})();
if( options.verbose ){
	console.log( "Verbose output enabled" );
}

/***************************************
 * Utilities
 **************************************/
function strip_empty_request_field( name ){
	return function( record ){
		var capture = record.request[ name ];
		if( capture == "-" ){
			delete record.request[ name ];
		}
		return record;
	};
}

function pipeline_to_boolean( record ){
	var pipeLinedChar = record.connection.pipelined;
	record.connection.pipelined = pipeLinedChar == 'p';
	return record; 
}

function remove_empty_proxy( record ){
	if( record.request.proxy === "" ){
		delete record.request['proxy'];
	}
	return record; 
}

function log_record( record ){
	console.log( record );
}

/***************************************
 * Utility Instances
 **************************************/
var userRemover = strip_empty_request_field( "user" );
var refererUser = strip_empty_request_field( "http_referer" );

/***************************************
 * Cold Storage
 **************************************/
var coldStorage = 
(function(){

var db = require('nano')( options['couch-url'] ).use( options['couch-db'] );

return {
	store: function( record ){
		db.insert( record, function( error ){
			if( error ){
				console.error( error );
				process.exit( -256 );
			}
		});
	}
};

})();

/***************************************
 * UID
 **************************************/
function uid_process( message ){
	if( message.beacon ){
		var uid = message.beacon;
		var beacon = {
			id: uid.id,
			first: uid.got ? false : true
		}
		message.beacon = beacon;
	}
}

/***************************************
 * Message Ingest 
 **************************************/
function ingest( rawJson, ingress_processing ){
	try {
	  var msg = JSON.parse( rawJson );

	/*
	 * Ingest processing and normalizing
	 * --in theory these have no dependencies on eachother; however these are CPU bound tasks 
	 */
	ingress_processing( msg );
	remove_empty_proxy( msg );
	userRemover( msg );
	refererUser( msg );
	pipeline_to_boolean( msg );
	uid_process( msg );

	if( options.verbose ){
		log_record( msg );
	}
	/*
	 * Cold Storage 
	 */
	coldStorage.store( msg );
	}catch( problem ){
		console.log("Unable to process message", problem);
	}
}

/***************************************
 * Service Syslog Edge 
 **************************************/
var port = options.port;
var syslogd = require( "syslogd" );
syslogd( function( message ){
	function ingress_processing( record ){
		var incomingLength = message.size;
		record.cycle.syslog = {
			message_length: incomingLength
		};
		// clean time
		record.cycle.when = record.cycle.when * 1000;
		return record;
	}

	ingest( message.msg, ingress_processing );
}).listen( port, function(){
	console.log("Started on ", port);
});

