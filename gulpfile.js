
var gulp = require('gulp'),
    file = require('gulp-file'),
    http = require('http');


var fixtureSeeds = {
  target: ['UAT1', 'UAT2', 'UAT3', 'Stage', 'Live'],
  project: ['MyCms', 'MyGreatSite', 'MyGreatApi'],
  branch: ['develop', '14.42.3.1', 'QA', 'some_feature'],
  user: ['bill', 'lenny', 'dave', 'charlie']
};

/**
 * Get a random element from arrays
 */
Array.prototype.randomElement = function () {
  return this[Math.floor(Math.random() * this.length)]
}

/**
 *
 */
gulp.task('gen-data-fixture', function() {

  var fixture = {},
      ts = Math.round(Date.now() / 1000);

  fixtureSeeds.target.forEach(function(t) {
    fixtureSeeds.project.forEach(function(p) {

      var required = Math.ceil(Math.random() * 3),
          key = t + ':' + p;

      fixture[key] = [];

      for (var i = 0; i < required; i++) {

        var b = fixtureSeeds.branch.randomElement();
        var u = fixtureSeeds.user.randomElement();

        fixture[key].push({
          target: t,
          project: p,
          branch: b,
          user: u,
          timestamp: ts
        });

      }

    });
  });

  return file('default.json', JSON.stringify(fixture))
    .pipe(gulp.dest('data'));

});

/**
 * Generates simulated traffic based on the exampleConfig.js file
 */
gulp.task('demo-notify', function() {

  setInterval(function() {
      var t = fixtureSeeds.target.randomElement();
      var p = fixtureSeeds.project.randomElement();
      var b = fixtureSeeds.branch.randomElement();
      var u = fixtureSeeds.user.randomElement();

      var path = '/notify?target='+t+'&project='+p+'&branch='+b+'&user='+u;

      console.log('Sending: '+path);

      http.request({
        hostname: 'localhost',
        port: 3000,
        path: path
      }).end()

  }, 5000);

});

/**
 * Runs the test suite
 */
gulp.task('test', require('gulp-jsx-coverage').createTask({
    src: [
      // Tests
      'test/server/**/*Test.js',
      'test/ui/**/*Test.js*(x)',
      // Sources - added to get visibility of coverage
      'src/server/lib/**/*.js',
      'src/ui/components/**/*.jsx',
      'src/ui/models/**/*.js'
    ],
    isparta: false,
    istanbul: {
        preserveComments: true, // required for istanbul 0.4.0+
        coverageVariable: '__MY_TEST_COVERAGE__',
        exclude: /node_modules|test/  // do not instrument these files
    },
    transpile: {
        babel: {
            include: /\.jsx?$/,
            exclude: /node_modules/,
            omitExt: false
        }
    },
    coverage: {
        reporters: ['text-summary', 'json', 'lcov'],
        directory: 'coverage'
    },
    mocha: {
        reporter: 'spec'
    }
}));


gulp.task('default', function() {
  console.log('No default task');
});

