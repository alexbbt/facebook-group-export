#!/usr/bin/env node
"use strict";

const pkg     = require("../package.json");
const program = require("commander-plus");
const Table   = require("cli-table");
const colors  = require("colors");
const rp      = require("request-promise");
const fsp     = require("fs-promise");


const main = function() {
	const chain = Promise.resolve()
	.then(setup)
	.then(process_options)
	.then(run)
	.then(save)
	.catch((err) => {
		process.stdin.destroy();
		process.stdout.write("Error\n".red);

		if (err.error) {
			console.error(JSON.parse(err.error).error.message);
		} else {
			console.error(err);
		}
		return false;
	})
	// done
	.then(display_results)
	.then(() => {
		process.stdout.write("\n");
	})
	.catch((err) => {
		process.stdin.destroy();
		console.error(err);
	})
}

const setup = function() {
	program
		.version(pkg.version)
		.option("-a, --accessToken <token>","Access Token for Open Graph" + " Required".red)
		.option("-l, --list","List Facebook Groups")
		.option("-g, --groupId [id]","ID for group to export")
		.option("-f, --file [path]","File to store data in")
		.parse(process.argv);
}

const process_options = function() {
	const paramaters = {
		accessToken: null,
		groupId: null,
		file: null,
		list: false
	};

	if (program.args.length > 0) {

		paramaters.urls = [];
		for (var i = 0; i < program.args.length; i++) {

			paramaters.urls.push(program.args[i]);
		}

	}
	if (program.accessToken !== undefined) paramaters.accessToken = program.accessToken;
	if (program.groupId !== undefined) paramaters.groupId = program.groupId;
	if (program.file !== undefined) paramaters.file = program.file;
	paramaters.list = (program.list === true);

	return paramaters;
}

const run = function(paramaters) {
	if (!(
			paramaters.accessToken !== null
			&& (
				paramaters.list
				|| paramaters.groupId !== null
			)
	)) {
		program.help()
		throw "Missing Required Paramaters.";
	}

	process.stdout.write("\n");

	if (paramaters.list) {
		return list_groups(paramaters)
	} else if (paramaters.groupId) {
		return export_group(paramaters)
	}

}

const list_groups = function(paramaters) {
	if (!paramaters.list) {
		return;
	}

	return next_loop(paramaters, "https://graph.facebook.com/v2.8/me/groups?fields=name%2Cadministrator");
}

const export_group = function(paramaters) {
	if (paramaters.groupId === null) {
		return;
	}

	return next_loop(paramaters, "https://graph.facebook.com/v2.8/" + paramaters.groupId + "/members?fields=id%2Cfirst_name%2Cmiddle_name%2Clast_name%2Cadministrator");
}

const next_loop = function(paramaters, url, rows, page = 1) {
	if (!url.includes(paramaters.accessToken)) {
		url += "&access_token=" + paramaters.accessToken
	}

	if (rows == null) {
		rows = [];
	}

	return rp(url)
	.then((data) => JSON.parse(data))
	.then((results) => {
		var paging = results.paging;
		results.data.forEach((result) => {
			rows.push(result);
		});

		if (paging && paging.next) {

			if (page === 1) {
				process.stdout.write("More than 25 Results, Paging is required." + "\n");
				process.stdout.write("This could take a very long time for large groups." + "\n");
				process.stdout.write("Hit " + "Control-C".red + " to quit." + "\n");
				process.stdout.write("\n");
			}

			process.stdout.clearLine();
			process.stdout.cursorTo(0);
			process.stdout.write("Pages Queried: " + page.toString().green + ", Results Found: " + rows.length.toString().green);

			return next_loop(paramaters, paging.next, rows, page + 1);
		}

		if (rows.length > 25) {
			process.stdout.write("\n" + "\n");
		}

		return [rows, paramaters];
	})
}

const save = function() {


	var [rows, paramaters] = arguments[0];

	if (paramaters.file == null) {
		return rows;
	}

	var keys = Object.keys(rows[0]);

	var promises = [
		fsp.writeFile(paramaters.file, keys.join(",") + "\n")
	];

	rows.forEach((row) => {
		promises.push(
			fsp.appendFile(
				paramaters.file,
				keys.map((key) => {
					return row[key]
				}).join(",") + "\n"
			)
		);
	})

	return Promise.all(promises)
		.then(() => {
			process.stdout.write("All Data writen to " + (__dirname + "/" + paramaters.file).green + "\n");
			return rows;
		});
}

const display_results = function(rows) {
	if (!rows) {
		return;
	}
	if (rows.length > 100) {
		if (rows[0].administrator != null) {
			process.stdout.write("\n" + "Displaying Administrators".green + "\n");
			display_results(rows.filter(row => row.administrator));
		}
		process.stdout.write("\n" + "Displaying First 50 rows".green + "\n");
		rows = rows.splice(0, 50);
	}
	const keys = Object.keys(rows[0]);
	var maxWidthByKey = {};
	keys.forEach((key) => {
		maxWidthByKey[key] = key.length;
		rows.forEach((row) => {
			if (row[key].length > maxWidthByKey[key]) {
				maxWidthByKey[key] = row[key].length;
			}
		});
	});

	var options = {

		head: keys,
		colWidths: keys.map(key => maxWidthByKey[key] + 2),
		chars: {"mid": "", "left-mid": "", "mid-mid": "", "right-mid": ""},
		style: {head: ["white"], border: ["white"]}

	}

	var table = new Table(options);
	rows.forEach((row) => {
		table.push(keys.map((key) => {
			if (typeof row[key] === "boolean") {
				row[key] = row[key] ? "True" : "False";
			}
			return row[key];
		}));
	});

	// Print table.
	process.stdout.write(table.toString() + "\n");

}


main();
