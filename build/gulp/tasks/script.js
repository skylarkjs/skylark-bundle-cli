var gulp = require('gulp'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    sourceMaps = require('gulp-sourcemaps'),
    amdOptimize = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    rename = require("gulp-rename"),
    util = require('../utils'),
     fs = require('fs');


var src = [util.src +  "**/*.js"];

var dest = util.dest+"uncompressed/";

var requireConfig = {
    baseUrl: util.src,
    out : util.pkg.name + ".js",
    packages : [{
       name : util.pkg.name ,
       location :  util.src
    }],
    paths: {
    },
//    name : "skylark/main",

    include: [
        util.pkg.name + "/main"
    ],
    exclude: [
    ]
};

Array.prototype.push.apply(requireConfig.packages,util.rjspkgs.namelocs);
Array.prototype.push.apply(requireConfig.exclude,util.rjspkgs.names);


module.exports = function() {
    var p =  new Promise(function(resolve, reject) {
     gulp.src(src)
        .on("error", reject)
        .pipe(gulp.dest(dest+util.pkg.name))
        .on("end",resolve);
    });

    return p.then(function(){
        return amdOptimize(requireConfig)
           .on("error",util.log)
           .pipe(header(fs.readFileSync(util.allinoneHeader, 'utf8')))
            .pipe(footer(fs.readFileSync(util.allinoneFooter, 'utf8')))
            .pipe(header(util.banner, {
                pkg: util.pkg
            })) 
            .pipe(gulp.dest(dest));
    })

};
