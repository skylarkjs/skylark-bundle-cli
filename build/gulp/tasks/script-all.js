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

var src = [util.dest+"uncompressed/" + util.pkg.name + "/**/*.js"];

var dest = util.dest;

var requireConfig = {
    baseUrl: util.dest+"uncompressed/"+ util.pkg.name,
    out : util.pkg.name + "-all.js",
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


module.exports = function() {
    return amdOptimize(requireConfig)
            .on("error",util.log)
        .pipe(header(fs.readFileSync(util.allinoneHeader, 'utf8')))
        .pipe(footer(fs.readFileSync(util.allinoneFooter, 'utf8')))
        .pipe(header(util.banner, {
            pkg: util.pkg
        })) 
        .pipe(gulp.dest(dest));

};
