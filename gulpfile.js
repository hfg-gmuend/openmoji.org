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

gulp.task('copy-openmoji-data-json', function(){
  return gulp.src([
    'node_modules/openmoji/package.json',
    'node_modules/openmoji/data/color-palette.json',
    'node_modules/openmoji/data/openmoji.json',
    ]).pipe(gulp.dest('data/'));
});

gulp.task('copy-openmoji-data-black-svg', function(){
  return gulp.src('node_modules/openmoji/black/svg/*.svg')
    .pipe(gulp.dest('data/black/svg/'));
});

gulp.task('copy-openmoji-data-color-svg', function(){
  return gulp.src('node_modules/openmoji/color/svg/*.svg')
    .pipe(gulp.dest('data/color/svg/'));
});

gulp.task('copy-openmoji-data',
  gulp.series(
    'copy-openmoji-data-json',
    'copy-openmoji-data-black-svg',
    'copy-openmoji-data-color-svg'
));
