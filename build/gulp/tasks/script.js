var gulp = require('gulp'),
    concat = require('gulp-concat'),
    header = require('gulp-header'),
    footer = require('gulp-footer'),
    sourceMaps = require('gulp-sourcemaps'),
    amdOptimize = require('gulp-requirejs'),
    uglify = require('gulp-uglify'),
    replace = require('gulp-replace'),
    rename = require("gulp-rename"),
    texttojs = require('gulp-texttojs'),
    util = require('../utils'),
    es6toamd = require('../tosjs/es6tosjs'),
    noop = require("gulp-noop"),
    fs = require('fs');


var srcJs = [util.src +  "**/*.js"],
    srcText ;

if (util.prepare && util.prepare.texttojs){
  srcText = [
      util.src +  "**/*.{" + util.prepare.texttojs.join(",") +"}",
      "!" + util.src +  "**/*.js"
  ];
} 

var dest = util.dest+"uncompressed/";
console.log(util.pkg.name+":a");
var requireConfig = {
    baseUrl: dest+util.pkg.name,
    out : util.pkg.name + ".js",
    packages : [{
       name : util.pkg.name ,
       location :  dest+util.pkg.name
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
    var promises = [];
    promises.push( new Promise(function(resolve, reject) {
     gulp.src(srcJs)
        .on("error", reject)
        .pipe(util.prepare && util.prepare.es6toamd ? es6toamd() : noop())
        .pipe(gulp.dest(dest+util.pkg.name))
        .on("end",resolve);
    }) );

    if (srcText) {
        promises.push( new Promise(function(resolve, reject) {
            gulp.src(srcText)
                .on("error", reject)
                .pipe(texttojs())
                .pipe(gulp.dest(dest+util.pkg.name))
                .on("end",resolve);
        }) );
    }

    return Promise.all(promises).then(function(){
        return true;
    })

};
