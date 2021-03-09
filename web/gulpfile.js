//TODO: add comments to this file

console.log("starting, loading modules...");
console.log("gulp");
const gulp = require("gulp");
console.log("gulp-compile-handlebars");
const handlebars = require("gulp-compile-handlebars");
console.log("gulp-sass");
const sass = require("gulp-sass");
console.log("gulp-rename");
const rename = require("gulp-rename");
console.log("workbox-build");
const workboxBuild = require("workbox-build");
console.log("loaded!");

var workboxConfig = require("./workbox-config.js");

// define gulp tasks

gulp.task("service-worker", () => {
  return workboxBuild.generateSW(workboxConfig);
});

gulp.task("minimize_css", () => {
  //TODO: minimize and generate sourcemaps
  return gulp.src("dist/css/**/*.css").pipe(gulp.dest("dist/css"));
});

gulp.task("process_css", () => {
  return gulp
    .src("src/scss/**/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(gulp.dest("dist/css"));
});

gulp.task("process_js", () => {
  // import bootstrap.js
  gulp
    .src("node_modules/bootstrap/dist/js/bootstrap.bundle.min.js")
    .pipe(gulp.dest("dist/js"));
  gulp
    .src("node_modules/bootstrap/dist/js/bootstrap.bundle.min.js.map")
    .pipe(gulp.dest("dist/js"));
  // copy javascript source files
  return gulp.src("src/js/**/*.js").pipe(gulp.dest("dist/js"));
});

gulp.task("process_html", () => {
  options = {
    batch: ["./src/_partials"],
  };

  gulp.src(["src/**/*.html", "!src/_partials/**/*"]).pipe(gulp.dest("dist"));

  return gulp
    .src(["src/**/*.handlebars", "!src/_partials/**/*"])
    .pipe(handlebars(null, options))
    .pipe(
      rename(function (path) {
        path.extname = ".html";
      })
    )
    .pipe(gulp.dest("dist"));
});

// define gulp pipelines

gulp.task("build", (done) => {
  tailwindConfig.purge.enabled = true;
  return gulp.series(
    gulp.parallel(
      gulp.task("process_html"),
      gulp.task("process_js"),
      gulp.task("process_css")
    ),
    gulp.task("minimize_css"),
    gulp.task("service-worker")
  )(done);
});

gulp.task("watch", () => {
  gulp.parallel(
    gulp.task("process_html"),
    gulp.task("process_js"),
    gulp.task("process_css")
  )();
  gulp.watch("src/**/*.html", gulp.series("process_html"));
  gulp.watch("src/**/*.handlebars", gulp.series("process_html"));
  gulp.watch("src/**/*.scss", gulp.series("process_css"));
  gulp.watch("src/**/*.js", gulp.series("process_js"));
  return;
});
