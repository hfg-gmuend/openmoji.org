var gulp = require('gulp');

/* Copy emoji data */

gulp.task('copy-openmoji-data-json', function(){
  return gulp.src([
    'node_modules/openmoji/package.json',
    'node_modules/openmoji/data/color-palette.json',
    'node_modules/openmoji/data/openmoji.json',
    ]).pipe(gulp.dest('public/data/'));
});

gulp.task('copy-openmoji-data-black-svg', function(){
  return gulp.src('node_modules/openmoji/black/svg/*.svg')
    .pipe(gulp.dest('public/data/black/svg/'));
});

gulp.task('copy-openmoji-data-color-svg', function(){
  return gulp.src('node_modules/openmoji/color/svg/*.svg')
    .pipe(gulp.dest('public/data/color/svg/'));
});

gulp.task('copy-openmoji-data',
  gulp.series(
    'copy-openmoji-data-json',
    'copy-openmoji-data-black-svg',
    'copy-openmoji-data-color-svg'
));

/* Copy Markdown assets */

gulp.task('copy-markdown-samples-assets', function(){
  return gulp.src(['src/pages/samples/*.*', '!src/pages/samples/index.md'])
    .pipe(gulp.dest('public/'));
});

gulp.task('copy-markdown-styleguide-assets', function(){
  return gulp.src(['src/pages/styleguide/*.*', '!src/pages/styleguide/index.md'])
    .pipe(gulp.dest('public/'));
});

gulp.task('copy-markdown-assets',
  gulp.series(
    'copy-markdown-samples-assets',
    'copy-markdown-styleguide-assets'
));