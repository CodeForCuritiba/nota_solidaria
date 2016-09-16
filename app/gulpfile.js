var gulp    = require('gulp');  
var replace = require('gulp-replace-task');  
var args    = require('yargs').argv;  
var fs      = require('fs');

gulp.task('replace', function () {  
  // Get the environment from the command line
  var env = args.env || 'localdev';
  var theme = args.theme || 'default';

  // Read the settings from the right file
  var filename = env + '.json';
  var settings = JSON.parse(fs.readFileSync('./config/' + filename, 'utf8'));
  var theme = JSON.parse(fs.readFileSync('./themes/' + theme + '.json', 'utf8'));

  // Replace each placeholder with the correct value for the variable.  
  gulp.src('js/constants.js')  
    .pipe(replace({
      patterns: [
        {
          match: 'apiUrl',
          replacement: settings.apiUrl
        }
      ]
    }))
    .pipe(replace({
      patterns: [
        {
          match: 'theme',
          replacement: theme
        }
      ]
    }))
    .pipe(gulp.dest('www/js'));
  gulp.src('css/theme.css')
    .pipe(replace({
      patterns: [
        {
          match: 'BgColor',
          replacement: theme.style.background_color
        },
        {
          match: 'HeaderBgColor',
          replacement: theme.style.header.background_color
        },
        {
          match: 'HeaderColor',
          replacement: theme.style.header.text_color
        },
        {
          match: 'ButtonBgColor',
          replacement: theme.style.button.background_color
        },
        {
          match: 'ButtonColor',
          replacement: theme.style.button.text_color
        }
      ]
    }))
    .pipe(gulp.dest('www/css'));


});