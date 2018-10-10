var gutil = require('gulp-util'),
    path = require('path'),
    argv = require('yargs').argv,
    prjRoot = argv.prjRoot; 

var pkg = require(path.resolve(prjRoot,'./package.json')),
    rjspkgs = {
        names : [],
        namelocs : []
    },
    devDependencies = pkg.devDependencies;

console.log("required packages:")
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
