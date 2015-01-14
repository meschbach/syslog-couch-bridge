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
var opts = require( __dirname + "/options.js" );
var yargs = require( "yargs" );

/***************************************
 * Options parsing
 **************************************/
//Setup options
var options = opts.standard().options({
		"node-home" : { describe: "Location of node to run the application under", default: "/opt/joyent/latest"  },
		"pid-file" : { describe: "Location of the PID file", default: "/var/run/syslog-couchdb.pid" },
		"user" : { describe: "User to change to", default: "nobody" },
		"run-extras" : { describe: "extra options to be passed to start-stop-daemon", default: "" },
		"run-opts" : { describe: "Additional runtime options for the syslog service", default: "" },
		"working-dir" : { alias: "pwd", describe: "Working directory for the applcation", default: __dirname },
		"version" : { describe: "Version to install for the upstart script", default: pkg.version }
	});
var args = options.argv;

function run_options(){
	return opts.names.reduce( function( options, optionName ){
		var value = args[ optionName ]; 
		if( value ){
			options = options + " --" + optionName + " \"" + value + "\" ";
		}
		return options;
	}, args[ "run-options" ] );
}

function generate_template(){
	var config = {
		node: {
			'home': args[ 'node-home' ]
		},
		run: {
			dir:		args[ 'working-dir' ],
			extras:	args.extras,
			opts:		run_options,
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
}

if( args.help ){
	yargs.showHelp();
}else{
	generate_template();
}
