var gutil = require('gulp-util'),
    path = require('path'),
    fs = require('fs'),
    argv = require('yargs').argv,
    prjRoot = argv.prjRoot; 

var pkg = require(path.resolve(prjRoot,'./package.json')),
    rjspkgs = {
        names : [],
        namelocs : []
    };

console.log("required packages:")


/*
var devDependencies = pkg.devDependencies;
if (devDependencies) {
    for (var name in devDependencies) {
        rjspkgs.names.push(name);
        rjspkgs.namelocs.push({
            name : name,
            location : path.resolve(prjRoot,"./node_modules",name,"./dist/uncompressed/",name)+'/'
        });
        console.log(name+":" + path.resolve(prjRoot,"./node_modules",name,"./dist/uncompressed/",name)+'/');
    }
}
*/

var dependencies =  fs.readdirSync(path.resolve(prjRoot,"./node_modules"));
for (var i = 0; i < dependencies.length;i++) {
    var name = dependencies[i];
    if(name.match(/^[A-Za-z]/i)) {
        rjspkgs.names.push(name);
        rjspkgs.namelocs.push({
            name : name,
            location : path.resolve(prjRoot,"./node_modules",name,"./dist/uncompressed/",name)+'/'
        });
        console.log(name+":" + path.resolve(prjRoot,"./node_modules",name,"./dist/uncompressed/",name)+'/');        
    }
}


const { lstatSync, readdirSync } = require('fs')

const isDirectory = source => fs.lstatSync(source).isDirectory()
const getDirectories = source => fs.
readdirSync(source).map(name => join(source, name)).filter(isDirectory)


var banner = ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @author <%= pkg.author %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''
].join('\n');

module.exports = {
    prjRoot : prjRoot,
    src: path.resolve(prjRoot,'./src') + '/',
    dest: path.resolve(prjRoot,'./dist') + '/',
    banner: banner,
    allinoneHeader : path.resolve(__dirname ,'../../scripts/allinone-js.header'),
    allinoneFooter : path.resolve(__dirname ,'../../scripts/allinone-js.footer'),
    pkg: pkg,
    rjspkgs : rjspkgs
};
