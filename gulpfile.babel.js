import gulp from 'gulp'
import babel from 'gulp-babel'
import plumber from 'gulp-plumber'
import sass from 'gulp-sass'
import concat from 'gulp-concat'

gulp.task('sass', () => {
    gulp.src('*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(gulp.dest('static/css/'))
});

gulp.task('js', () => {
    gulp.src('app/**/*.js')
        .pipe(plumber())
        .pipe(babel())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('static/js/'))
});

gulp.watch('app.scss', ['sass']);
gulp.watch('app/**/*.js', ['js']);

gulp.task('default',['sass', 'js']);
