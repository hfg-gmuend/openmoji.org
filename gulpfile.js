var gulp = require('gulp');
var sass = require('gulp-sass');
var prefix = require('gulp-autoprefixer');
var plumber = require('gulp-plumber');

function onError(err) {
  console.log(err);
}

gulp.task('sass', function () {
  return gulp.src('style/main.scss')
    .pipe(sass())
    .pipe(prefix({
      grid: true
    }))
    .pipe(gulp.dest('style/'))
    .pipe(plumber({
      errorHandler: onError
    }));
});
