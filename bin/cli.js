#!/usr/bin/env node
var program = require('commander');
const path = require('path');


/**
 * Install an around function; AOP.
 */

function around (obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    var args = new Array(arguments.length)
    for (var i = 0; i < args.length; i++) args[i] = arguments[i]
    return fn.call(this, old, args)
  }
}

/**
 * Install a before function; AOP.
 */

function before (obj, method, fn) {
  var old = obj[method]

  obj[method] = function () {
    fn.call(this)
    old.apply(this, arguments)
  }
}

/**
 * Prompt for confirmation on STDOUT/STDIN
 */

function confirm (msg, callback) {
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  rl.question(msg, function (input) {
    rl.close()
    callback(/^y|yes|ok|true$/i.test(input))
  })
}


/**
 * Graceful exit for async STDIO
 */

function exit (code) {
  // flush output for Node.js Windows pipe bug
  // https://github.com/joyent/node/issues/6247 is just one bug example
  // https://github.com/visionmedia/mocha/issues/333 has a good discussion
  function done () {
    if (!(draining--)) _exit(code)
  }

  var draining = 0
  var streams = [process.stdout, process.stderr]

  exit.exited = true

  streams.forEach(function (stream) {
    // submit empty write request and wait for completion
    draining += 1
    stream.write('', done)
  })

  done()
}


program.version('v' + require('../package.json').version)
       .description('skyarkjs bundle builder')


program.command('build [prjRoot]')
       .alias('b')
       .description('build skylark bundle project, files builded will be output to the /dist directory of project')
       .action(function (prjRoot) {
          prjRoot = prjRoot || '.';
          var options = {
            prjRoot : path.resolve(process.cwd(),prjRoot)
          };
          console.log("The bundle prject root directory:"+path.resolve(process.cwd(),prjRoot));

    			var GulpRunner = require('gulp-runner');

    			var gulp = new GulpRunner(path.resolve(__dirname,'../build/gulpfile.js'));
    			gulp.on('start', function() {
    			  console.log('gulp starting...')
    			})

    			gulp.on('complete', function() {
    			  console.log('complete!')
    			});

    			gulp.on('log', function(data) {
    			  // console.log(data.toString())
    			  // works better to 
    			  process.stdout.write(data);
    			});

    			gulp.on('error', function(err) {
    			  process.stderr.write(err);
    			});

    			gulp.run('default',options);
	    });

program.command('*')
       .action(function (cmd) {
         console.log('sbundle: \'%s\' is not an skylark bundle command. See \'sbundle --help\'.', cmd)
       })

program.parse(process.argv)

if (program.args.length === 0) {
  program.help()
}
