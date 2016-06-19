var gulp = require('gulp');
var plumber = require('gulp-plumber');
var sass = require('gulp-sass');

gulp.task('sass', () => {
    gulp.src('static/scss/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest('static/css/'))
});

gulp.watch('app.scss',['sass']);

gulp.task('default',['sass']);
