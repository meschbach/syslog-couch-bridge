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
 * General option parsing
 */
var yargs = require( "yargs" );

function standard_options(){
	return yargs.options({
		iface: { alias: "i", default: process.env["IFACE"], describe: "INET interface to bind to, defaults to all" },
		port:	{ alias: "p", default: process.env["PORT"] || 9405, describe: "UDP/IP port to bind to" },
		"couch-url": { 
			alias: "u",
			default: process.env["COUCH_URL"] || "http://localhost:5984",
			describe: "CouchDB HTTP Host"
		}, 
		"couch-db" : {
			alias: "d",
			default: process.env[ "COUCH_DB" ] || "development-monitor-http",
			describe: "Database to store ingressed messages to"
		}, 
		"verbose" : { alias: "v", describe: "display verbose messages" } 
		});
}

exports.standard = standard_options;
