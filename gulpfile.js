var gulp = require('gulp'),
    runSequence = require('run-sequence'),
    rev = require('gulp-rev'),
    revCollector = require('gulp-rev-collector'),
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    jshint = require('gulp-jshint')
    cleanCSS = require('gulp-clean-css')//压缩css使用的

var cssSrc = 'src/**/*.css',//定义css、js源文件路径
    jsSrc = ['src/**/*.js'];

gulp.task('watch', function () {//监控文件变化
    gulp.watch([jsSrc, cssSrc], ['default']);
});

gulp.task('jsLint', function () {//检查js语法
    return gulp.src(jsSrc)
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('cleanDist', function () {//清空目标文件
    return gulp.src(['dist', 'rev'], {read: false})
        .pipe(clean());
});

gulp.task('revCss', function () {//CSS生成文件hash编码并生成 rev-manifest.json文件名对照映射
    return gulp.src(cssSrc)
        .pipe(rev())
        .pipe(cleanCSS({compatibility: 'ie8'}))// 压缩css
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest()) //生成rev-manifest.json
        .pipe(gulp.dest('rev/css'));
});

gulp.task('revJs', function () {//js生成文件hash编码并生成 rev-manifest.json文件名对照映射
    return gulp.src(jsSrc)
        .pipe(rev())
        .pipe(uglify())
        .pipe(gulp.dest('dist'))
        .pipe(rev.manifest()) //生成rev-manifest.json
        .pipe(gulp.dest('rev/js'));
});

gulp.task('revHtml', function () {//Html替换css、js文件版本
    return gulp.src(['rev/**/*.json', 'src/**/*.html'])
        .pipe(revCollector({
            replaceReved: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('mvNotDealAsset', function () {// 将非js、非css、非less移动到目标目录
    return gulp.src(['src/**/*', '!src/**/*.css', '!src/**/*.js', '!src/**/*.html', '!src/**/*.less', '!src/less'])
        .pipe(gulp.dest('dist'));
});

gulp.task('dev', function (done) {//开发构建
    condition = false;
    runSequence(
        ['jsLint'],
        ['cleanDist'],
        ['revCss'],
        ['revJs'],
        ['revHtml'],
        ['mvNotDealAsset'],
        ['watch'],
        done);
});

gulp.task('default', ['dev']);