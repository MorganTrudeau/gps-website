"use strict";

// Load Plugins
const browserSync = require("browser-sync").create();
const del = require("del");
const gulp = require("gulp");
const nunjucks = require("gulp-nunjucks");
const mergeStream = require("merge-stream");
const purgecss = require("gulp-purgecss");
const cleanCSS = require("gulp-clean-css");

/**
 * Set the destination/production directory
 * This is where the project is compiled and exported for production.
 * This folder is auto created and managed by gulp.
 * Do not add/edit/save any files or folders iside this folder. They will be deleted by the gulp tasks.
 */
const distDir = "./dist/";

// Clean up the dist folder before running any task
function clean() {
  return del(distDir + "**/*");
}

// Task: Copy Files
function copyFiles() {
  const jsFolder = gulp.src("./js/**/*").pipe(gulp.dest(distDir + "js/"));

  const imgFolder = gulp.src("./img/**/*").pipe(gulp.dest(distDir + "img/"));

  const fontsFolder = gulp
    .src("./fonts/**/*")
    .pipe(gulp.dest(distDir + "fonts/"));

  return mergeStream(jsFolder, imgFolder, fontsFolder);
}

function processCss() {
  return gulp
    .src("./css/**/*.css")
    .pipe(
      purgecss({
        content: ["./html/**/*.html", "./js/**/*.js"],
      })
    )
    .pipe(cleanCSS())
    .pipe(gulp.dest(distDir + "css/"));
}

// Task: Compile HTML
function compileHTML() {
  return gulp
    .src(["./html/*.html"])
    .pipe(nunjucks.compile())
    .pipe(gulp.dest(distDir))
    .pipe(browserSync.stream());
}

// Init live server browser sync
function initBrowserSync(done) {
  browserSync.init({
    server: {
      baseDir: distDir,
    },
    port: 3000,
    notify: false,
  });
  done();
}

// Watch files
function watchFiles() {
  gulp.watch("./html/**/*.html", compileHTML);
  gulp.watch(["./js/**/*", "./img/**/*", "./fonts/**/*"], copyFiles);
  gulp.watch("./css/**/*", processCss);
}

// Export tasks
const dist = gulp.series(
  clean,
  gulp.parallel(copyFiles, compileHTML),
  processCss
);

exports.watch = gulp.series(dist, watchFiles);
exports.start = gulp.series(dist, gulp.parallel(watchFiles, initBrowserSync));
exports.default = dist;
