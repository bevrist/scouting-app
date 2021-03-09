//TODO: add comments to this file

console.log("starting, loading modules...");
console.log("gulp");
const gulp = require("gulp");
console.log("gulp-compile-handlebars");
const handlebars = require("gulp-compile-handlebars");
console.log("gulp-postcss");
const postcss = require("gulp-postcss");
console.log("gulp-rename");
const rename = require("gulp-rename");
console.log("autoprefixer");
const autoprefixer = require("autoprefixer");
console.log("precss");
const precss = require("precss");
console.log("tailwindcss");
const tailwindcss = require("tailwindcss");
console.log("workbox-build");
const workboxBuild = require("workbox-build");

console.log("loading configs...");
var tailwindConfig = require("./tailwind.config.js");
var workboxConfig = require("./workbox-config.js");
console.log("loaded!");

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
    .src("src/css/**/*.css")
    .pipe(postcss([precss(), tailwindcss(tailwindConfig), autoprefixer()]))
    .pipe(gulp.dest("dist/css"));
});

gulp.task("process_js", () => {
  //TODO: closure-compile and generate sourcemaps in a new "minimize-js" step
  //google-closure-compiler --js *.js --js_output_file out.min
  return gulp.src("src/js/**/*.js").pipe(gulp.dest("dist/js"));
});

gulp.task("process_html", () => {
  options = {
    batch: ["./src/partials"],
  };

  gulp.src(["src/**/*.html", "!src/partials/**/*"]).pipe(gulp.dest("dist"));

  return gulp
    .src(["src/**/*.handlebars", "!src/partials/**/*"])
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
  gulp.watch("src/**/*.css", gulp.series("process_css"));
  gulp.watch("tailwind.config.js", gulp.series("process_css"));
  gulp.watch("src/**/*.js", gulp.series("process_js"));
  return;
});
