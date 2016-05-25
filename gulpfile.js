var ENV = process.env.NODE_ENV || 'development';
if (ENV === 'development') {
  require('dotenv').config();
}
var gulp = require('gulp'),
  less = require('gulp-less'),
  jade = require('gulp-jade'),
  gutil = require('gulp-util'),
  bower = require('gulp-bower'),
  source = require('vinyl-source-stream'),
  imagemin = require('gulp-imagemin'),
  nodemon = require('gulp-nodemon'),
  reporter = require('gulp-codeclimate-reporter'),
  jasmineTest = require('gulp-jasmine'),
  browserify = require('browserify'),
  jshint = require('jshint'),
  karma = require('gulp-karma'),
  browserSync = require('browser-sync');
path = require('path'),
  paths = {
    public: 'public/**',
    jade: ['!app/shared/**', 'app/**/*.jade'],
    styles: 'app/styles/*.+(less|css)',
    images: 'app/images/**/*',
    unitTests: [],
    serverTests: ['./document-manager.spec.js'],
    staticFiles: [
      '!app/**/*.+(less|css|js|jade)',
      '!app/images/**/*',
      'app/**/*.*'
    ]
  };

gulp.task('less', function() {
  gulp.src(paths.styles)
    .pipe(less({
      paths: [path.join(__dirname, './app/styles')]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('jade', function() {
  gulp.src(paths.jade)
    .pipe(jade())
    .pipe(gulp.dest('./public/'));
});

gulp.task('browserify', function() {
  return browserify('./app/application.js').bundle()
    .on('success', gutil.log.bind(gutil, 'Browserify Rebundled'))
    .on('error', gutil.log.bind(gutil, 'Browserify ' +
      'Error: in browserify gulp task'))
    // vinyl-source-stream makes the bundle compatible with gulp
    .pipe(source('application.js')) // Desired filename
    // Output the file
    .pipe(gulp.dest('./public/js/'));
});

gulp.task('bower', function() {
  return bower()
    .pipe(gulp.dest('public/lib/'));
});

gulp.task('test:fend', ['test:bend', 'browserify', 'bower'], function() {
  // Be sure to return the stream
  return gulp.src(paths.unitTests)
    .pipe(karma({
      configFile: __dirname + '/karma.conf.js',
      //autoWatch: true,
      // singleRun: true
      action: 'run'
    }))
    .on('error', function(err) {
      // Make sure failed tests cause gulp to exit non-zero
      throw err;
    });
});

gulp.task('test:bend', function() {
  return gulp.src(paths.serverTests)
    // gulp-jasmine works on filepaths so you can't have any plugins before it
    .pipe(jasmineTest({
      verbose: true
    }));
});

gulp.task('codeclimate-reporter', ['test:fend'], function() {
  return gulp.src(['coverage/lcov/lcov.info'], {
      read: false
    })
    .pipe(reporter({
      token: process.env.CODECLIMATE_REPO_TOKEN,
      verbose: true
    }));
});

gulp.task('images', function() {
  gulp.src(paths.images)
    .pipe(imagemin({
      optimizationLevel: 3,
      progressive: true,
      interlaced: true
    }))
    .pipe(gulp.dest('./public/images/'));
});

gulp.task('lint', function() {
  return gulp.src(['./app/**/*.js', './index.js', +
      './server/**/*.js', './tests/**/*.js'
    ])
    .pipe(jshint())
    .pipe(jshint.reporter('default'));
});

gulp.task('static-files', function() {
  return gulp.src(paths.staticFiles)
    .pipe(gulp.dest('public/'));
});

gulp.task('nodemon', function() {
  nodemon({
      script: 'index.js',
      ext: 'js',
      ignore: ['public/', 'node_modules/']
    })
    .on('change', ['lint'])
    .on('restart', function() {
      console.log('>> node restart');
    });
});


gulp.task('watch', function() {
  gulp.watch(paths.jade, ['jade']);
  gulp.watch(paths.styles, ['less']);
  gulp.watch(paths.scripts, ['browserify']);
});

gulp.task('launch', ['bower', 'jade', 'less', 'static-files'], function() {
  browserSync.init(null, {
    proxy: 'http://localhost:5555',
    files: ['public/**/*.*'],
    port: 5555
  });
});

gulp.task('build', ['jade', 'less', 'static-files',
  'images', 'browserify', 'bower'
]);
gulp.task('heroku:production', ['build']);
gulp.task('heroku:staging', ['build']);
gulp.task('production', ['nodemon', 'build']);
gulp.task('test', ['test:fend', 'test:bend', 'codeclimate-reporter']);
gulp.task('default', ['nodemon', 'watch', 'build', 'launch']);
