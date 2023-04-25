const gulp = require('gulp');
const inject = require('gulp-inject');
const browserify = require('browserify');
const watchify = require('watchify');
const babelify = require('babelify');
const uglify = require('gulp-uglify');
const del = require('del');
const source = require('vinyl-source-stream');
const buffer = require('vinyl-buffer');
const hash = require('gulp-hash');
const sourcemaps = require('gulp-sourcemaps');

const packageJson = require('./package.json');
const dependencies = Object.keys(packageJson && packageJson.dependencies || {});

const DIRS = {
  base: './',
  entry: './_src/',
  dist: './assets/js/',
  inject: './_includes/',
};

const FILES = {
  entry: DIRS.entry + 'main.js',
  injectTarget: DIRS.inject + 'scripts-require.html',
};

function bundleDeps() {
  del([DIRS.dist + 'vendor-*.js']);

  return browserify()
    .require(dependencies)
    .transform(babelify, {
      presets: ["@babel/preset-env"],
    })
    .bundle()
    .pipe(source('vendor.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(hash())
    .pipe(gulp.dest(DIRS.dist))
    .on('finish', function () {
      injectScripts('vendor');
    });
}

function bundleApp(watch) {
  const bundler = browserify(FILES.entry, { debug: true }).transform(babelify, {
    presets: ["@babel/preset-env"],
    sourceMaps: true,
  });

  if (watch) {
    bundler.plugin(watchify);
  }

  function clean() {
    del([DIRS.dist + 'main-*.js.map', DIRS.dist + 'main-*.js']);
  }
  function rebundle() {
    return bundler
      .external(dependencies)
      .bundle()
      .on('error', function (err) {
        console.error(err);
        this.emit('end');
      })
      .pipe(source('main.js'))
      .pipe(buffer())
      .pipe(sourcemaps.init({loadMaps: true}))
      .pipe(uglify())
      .pipe(hash())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(DIRS.dist))
      .on('finish', function () {
        injectScripts('main');
      });
  }

  if (watch) {
    console.log('-> watching files...');

    bundler.on('update', function () {
      clean();
      rebundle();
      console.log('-> rebuild & inject scripts');
    });

    rebundle();
  } else {
    clean();
    return rebundle();
  }
}

function injectScripts(name) {
  const injectTraget = gulp.src(FILES.injectTarget);
  const injectFiles = gulp.src(DIRS.dist + `${name}-*.js`, {read: false});
 
  return injectTraget
    .pipe(inject(injectFiles, { quiet: true, name: `inject:${name}` }))
    .pipe(gulp.dest(DIRS.inject));
}

gulp.task('build:deps', function () {
  return bundleDeps();
});

gulp.task('build:app', function () {
  return bundleApp();
});

gulp.task('watch:app', function () {
  return bundleApp(true);
});
