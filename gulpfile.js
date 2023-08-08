const gulp = require('gulp')
const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')
const cssnano = require('cssnano')
const path = require('path')
const sass = require('gulp-sass')(require('sass'));
const imagemin = require('gulp-imagemin')
const browserSync = require('browser-sync').create()
const concat = require('gulp-concat')
const terser = require('gulp-terser')
const sourcemaps = require('gulp-sourcemaps')

const src = './assets';

let sources = {
    images: `${src}/images/**/*`,
    styles: `${src}/styles/**/*.scss`,
    scripts: `${src}/scripts/**/*.js`,
    vendor_scripts: [].concat.apply([], [
        './node_modules/bootstrap/dist/js/bootstrap.min.js',
        './node_modules/aos/dist/aos.js',
        './node_modules/slick-carousel/slick/slick.min.js',
    ]),
}

let destinations = {
    images: './images/',
    styles: './styles/',
    scripts: './scripts/',
}

function images() {
    return gulp.src(sources.images)
        .pipe(imagemin())
        .pipe(gulp.dest(destinations.images));
}

function styles() {
    const processors = [
        // tailwindcss,
        autoprefixer,
        cssnano
    ];

    return gulp.src(sources.styles)
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', function (err) {
            console.error(err.message);
            browserSync.notify('<pre style="text-align: left">' + err.message + '</pre>', 10000);
            this.emit('end');
        }))
        .pipe(postcss(processors))
        .pipe(gulp.dest(destinations.styles))
        .pipe(browserSync.stream({
            match: '**/*.css'
        }))
}

function vendor_scripts() {
    return gulp.src(sources.vendor_scripts)
        .pipe(sourcemaps.init())
        .pipe(concat('vendor.min.js'))
        .pipe(sourcemaps.write())
        .pipe(terser())
        .pipe(gulp.dest(destinations.scripts))
}

function custom_scripts() {
    return gulp.src(sources.scripts)
        .pipe(concat('scripts.min.js'))
        .pipe(terser())
        .pipe(gulp.dest(destinations.scripts))
}

function watch() {
    browserSync.init({
        proxy: encodeURI(`localhost/${path.resolve(__dirname, '../../../').split(path.sep).pop()}/`),
        injectChanges: true,
    });

    gulp.watch(sources.images, images).on('change', browserSync.reload);
    gulp.watch(sources.scripts, custom_scripts).on('change', browserSync.reload);
    gulp.watch(sources.scripts, vendor_scripts).on('change', browserSync.reload);
    gulp.watch('./**/*.php').on('change', browserSync.reload);
    gulp.watch(sources.styles, styles);
}

exports.watch = gulp.series(
    gulp.parallel(
        images,
        custom_scripts,
        vendor_scripts,
        styles
    ),
    watch
)