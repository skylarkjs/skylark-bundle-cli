var path = require('path'),
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    sourceMaps = require('gulp-sourcemaps'),
    amdOptimize = require('../plugins/requirejs'),
    uglifyes = require('uglify-es'),
    composer = require('gulp-uglify/composer'),
    uglify = composer(uglifyes, console),
    replace = require('gulp-replace'),
    rename = require("gulp-rename"),
    util = require('../utils'),
    fs = require('fs');


var srcPkgs = [{
      pkgName : util.pkg.name,
      pkgSrcJs :   util.dest+"uncompressed/" + util.pkg.name +  "/**/*.js"
    }];

var src = [util.dest+"uncompressed/" + util.pkg.name +  "/**/*.js"];

var dest = util.dest;

var requireConfig = {
    baseUrl: util.dest+"uncompressed/"+ util.pkg.name,
//    out : util.pkg.name + ".js",
    packages : [{
       name : util.pkg.name ,
       location :  util.dest+"uncompressed/"+ util.pkg.name 
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
    for (var secondaryPkgName in util.secondaries) {
        srcPkgs.push({
          pkgName : secondaryPkgName,
          pkgSrcJs :   util.dest+"uncompressed/" + secondaryPkgName +  "/**/*.js"

        });

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

    for (var i =0; i<srcPkgs.length;i++) {
        let srcPkg = srcPkgs[i];
        promises.push(new Promise(function(resolve, reject) {
            gulp.src(srcPkg.pkgSrcJs)
                .pipe(sourceMaps.init())
                .pipe(uglify({
                    mangle: { 
                        reserved: ['require','exports','module']
                    }                
                }))
                .on("error", reject)
                .pipe(header(util.banner, {
                    pkg: util.pkg
                }) )
                .pipe(sourceMaps.write("sourcemaps"))
                .pipe(gulp.dest(dest+srcPkg.pkgName))
                .on("end",resolve);
        }));
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

    rqConfig.out = util.pkg.name + suffix + ".js";

    console.log("bundle " +  bundleName);

    return amdOptimize(rqConfig)
        .on("error",util.log)
        .pipe(sourceMaps.init())
        .pipe(header(fs.readFileSync(util.allinoneHeader, 'utf8')))
        .pipe(footer(fs.readFileSync(util.allinoneFooter, 'utf8')))
        .pipe(uglify({
            mangle: { 
                reserved: ['require','exports','module']
            }                
        }))
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



/*

var gulp = require('gulp'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    sourceMaps = require('gulp-sourcemaps'),
    amdOptimize = require('../plugins/requirejs'),
    uglifyes = require('uglify-es'),
    composer = require('gulp-uglify/composer'),
    uglify = composer(uglifyes, console),
    replace = require('gulp-replace'),
    rename = require("gulp-rename"),
    util = require('../utils'),
    fs = require('fs');

var src = [util.dest+"uncompressed/" + util.pkg.name + "*.js"];

var dest = util.dest;

var requireConfig = {
    baseUrl: util.dest+"uncompressed/"+ util.pkg.name,
    out : util.pkg.name + ".js",
    packages : [{
       name : util.pkg.name ,
       location :  util.dest+"uncompressed/"+ util.pkg.name 
    }],
    paths: {
    },

    include: [
        util.pkg.name + "/main"
    ],
    exclude: [
    ]
};

Array.prototype.push.apply(requireConfig.packages,util.rjspkgs.namelocs);
//Array.prototype.push.apply(requireConfig.exclude,util.rjspkgs.names);

var include = util.bundle && util.bundle.standard && util.bundle.standard.include;
requireConfig.exclude = util.rjspkgs.names.filter(function(name){
    return !(include && include.indexOf(name)>-1);
});

module.exports = function() {
    var p =  new Promise(function(resolve, reject) {
        gulp.src(src)
            .pipe(sourceMaps.init())
            .pipe(uglify({
                mangle: { 
                    reserved: ['require','exports','module']
                }                
            }))
            .on("error", reject)
            .pipe(header(util.banner, {
                pkg: util.pkg
            }) )
            .pipe(sourceMaps.write("sourcemaps"))
            .pipe(gulp.dest(dest+util.pkg.name))
            .on("end",resolve);
    });

    return p.then(function(){
        return amdOptimize(requireConfig)
            .on("error",util.log)
            .pipe(sourceMaps.init())
            .pipe(header(fs.readFileSync(util.allinoneHeader, 'utf8')))
            .pipe(footer(fs.readFileSync(util.allinoneFooter, 'utf8')))
            .pipe(uglify({
                mangle: { 
                    reserved: ['require','exports','module']
                }                
            }))
            .pipe(header(util.banner, {
                pkg: util.pkg
            })) 
            .pipe(sourceMaps.write("sourcemaps"))
            .pipe(gulp.dest(dest));

    });

};
*/