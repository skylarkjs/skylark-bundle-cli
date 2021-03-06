var path = require('path'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    sourceMaps = require('gulp-sourcemaps'),
    amdOptimize = require('../plugins/requirejs'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    rename = require("gulp-rename"),
    texttojs = require('gulp-texttojs'),
    util = require('../utils'),
    es6toamd = require('../tosjs/es6tosjs'),
    cjstoamd = require('../tosjs/cjstosjs'),
    noop = require("gulp-noop"),
    babel = require('gulp-babel'),    
    fs = require('fs');

var srcPkgs = [{
      pkgName : util.pkg.name,
      pkgSrcJs :   util.src +  "**/*.js"
    }];

if (util.prepare && util.prepare.texttojs){
  srcPkgs[0].pkgSrcTxt = [
      util.src +  "**/*.{" + util.prepare.texttojs.join(",") +"}",
      "!" + util.src +  "**/*.js"
  ];
} 

var dest = util.dest+"uncompressed/";
console.log("Building package:" + util.pkg.name);
var requireConfig = {
    baseUrl: dest+util.pkg.name,
//    out : util.pkg.name + ".js",
    packages : [{
       name : util.pkg.name ,
       location :  dest+util.pkg.name
    }],
    paths: {
    },
//    name : "skylark/main",
//    exclude: [
//    ],

    include: [
        util.pkg.name + "/main"
    ]
};

if (util.secondaries) {
    for (let secondaryPkgName in util.secondaries) {
        let secondaryPkgSrcDir = path.resolve(util.prjRoot,util.secondaries[secondaryPkgName]) + "/",
            secondarySrcPkg = {
                pkgName : secondaryPkgName,
                pkgSrcJs : secondaryPkgSrcDir  +  "**/*.js"
            };

        if (util.prepare && util.prepare.texttojs){
          secondarySrcPkg.pkgSrcTxt = [
              secondaryPkgSrcDir +  "**/*.{" + util.prepare.texttojs.join(",") +"}",
              "!" + secondaryPkgSrcDir +  "**/*.js"
          ];
        } 

        srcPkgs.push(secondarySrcPkg);

        requireConfig.packages.push({
            name : secondaryPkgName,
            location : util.dest+"uncompressed/"+ secondaryPkgName
        });
    }    
}

Array.prototype.push.apply(requireConfig.packages,util.rjspkgs.namelocs);

//var include = util.bundle && util.bundle.standard && util.bundle.standard.include;
//requireConfig.exclude = util.rjspkgs.names.filter(function(name){
//    return !(include && include.indexOf(name)>-1);
//});


function build(){
    var promises = [];
    var moduleCovert = noop;
    if (util.prepare) {
        if (util.prepare.es6toamd ) {
            moduleCovert = es6toamd;
        } else if (util.prepare.cjstoamd) {
            moduleCovert = cjstoamd;
        }

    }
    for (var i =0; i<srcPkgs.length;i++) {
        let srcPkg = srcPkgs[i];

        promises.push( new Promise(function(resolve, reject) {
         gulp.src(srcPkg.pkgSrcJs)
            .on("error",util.log)
            .on("error", reject)
            .pipe(util.prepare && util.prepare.jsxtojs ? babel({
                plugins: [path.join(__dirname, '../../../node_modules/@babel/plugin-transform-react-jsx/lib/index.js')]
             }) : noop())
            .pipe(moduleCovert())
            .pipe(gulp.dest(dest+srcPkg.pkgName))
            .on("end",resolve);
        }) );

        if (srcPkg.pkgSrcTxt) {
            promises.push( new Promise(function(resolve, reject) {
                gulp.src(srcPkg.pkgSrcTxt)
                    .on("error",util.log)
                    .on("error", reject)
                    .pipe(texttojs())
                    .pipe(gulp.dest(dest+srcPkg.pkgName))
                    .on("end",resolve);
            }) );
        }
    }

    return Promise.all(promises);
}

function bundle(bundleName,bundleConfig) {
    let rqConfig = Object.assign({},requireConfig),
        suffix,
        include = bundleConfig.include;
    if (bundleName=="alone") {
        suffix = ""
    } else {
        suffix = "-" + bundleName;
    }
    rqConfig.exclude = util.rjspkgs.names.filter(function(pkgName){
        let isExcluded = true;
        if (bundleName=="alone") {
            isExcluded = true;
        } else {
            if (bundleName=="all") {
                isExcluded = false;
            } else {

                isExcluded = !(include && include.indexOf(pkgName)>-1);
            }
        }
        return isExcluded;
    });

    rqConfig.out = util.pkg.name + suffix + ".js",

    console.log("bundle " +  bundleName);

    return amdOptimize(rqConfig)
        .on("error",util.log)
        .pipe(sourceMaps.init())
        .pipe(header(fs.readFileSync(util.allinoneHeader, 'utf8')))
        .pipe(footer(fs.readFileSync(util.allinoneFooter, 'utf8')))
        .pipe(header(util.banner, {
            pkg: util.pkg
        })) 
        .pipe(sourceMaps.write("sourcemaps"))
        .pipe(gulp.dest(dest)) 
}

module.exports = function() {
    return build().then(function(){
        var promises2 = [],
            bundles = util.bundles || {};

        bundles.alone = true;

        for (let bundleName in bundles) {
            if (bundles[bundleName]) {
                promises2.push(bundle(bundleName,bundles[bundleName]));
            }
        }

        return Promise.all(promises2).catch(function(e){
            console.error(e);
            return Promise.reject(e);
        });
    },function(e){
        console.error(e);
        return Promise.reject(e);
    })

};
