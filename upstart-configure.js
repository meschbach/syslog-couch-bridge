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
 * Configuration of upstart script 
 */
var pkg = require( __dirname + "/package.json" );

var args = require( "yargs" ).default( "node-home", "/opt/joyent/latest" )
	.default( "pid-file", "/var/run/syslog-couchdb.pid" )
	.default( "pwd", __dirname )
	.default( "user", "nobody" )
	.default( "version", pkg.version )
	.default( "run-extras", "" )
	.default( "run-options", "" )
	.argv;

var config = {
	node: {
		'home': args[ 'node-home' ]
	},
	run: {
		dir:		args.pwd,
		extras:	args.extras,
		opts:		args[ "run-options" ],
		pid: args[ 'pid-file' ],
		user:		args.user,
		version: args.version
	}
};

var fs = require( "fs" );
var template = fs.readFileSync( "upstart.conf.mustache" );

var mustache = require( "mustache" );
var result = mustache.render( template.toString(), config );
process.stdout.write( result );
