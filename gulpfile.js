var gulp = require('gulp');
var browserify = require('browserify');
var reactify = require('reactify');
var source = require('vinyl-source-stream');

gulp.task('bundle', function() {
  browserify('./src/app.js')
    .transform(reactify)
    .bundle()
    .pipe(source('app.js'))
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('css', function() {
  gulp.src('./src/styles.css')
      .pipe(gulp.dest('./dist/css/'));
});

gulp.task('html', function () {
  gulp.src('./src/index.html')
      .pipe(gulp.dest('./dist/'));
});

gulp.task('worker', function() {
  gulp.src('./src/worker.js')
      .pipe(gulp.dest('./dist/js/'));
});

gulp.task('watch', function() {
  gulp.watch('./src/**/*.*', ['app']);
});

gulp.task('app', ['bundle', 'html', 'css', 'worker']);
