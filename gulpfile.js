// ---------- Configurations for your custom build of open pixel ---------- //

// This is the header comment that will be included at the top of the "dist/openpixel.js" file
var HEADER_COMMENT =
  process.env.OPIX_HEADER_COMMENT ||
  '// Open Pixel v1.3.1 | Published By Dockwa | Created By Stuart Yamartino | MIT License\n';

// This is where the compiled snippet and openpixel.js files will be dropped
var DESTINATION_FOLDER = process.env.OPIX_DESTINATION_FOLDER || './dist';

// The name of the global function and the cookie prefix that will be included in the snippet and is the client to fire off custom events
var PIXEL_FUNC_NAME = process.env.OPIX_PIXEL_FUNC_NAME || 'opix';

// The remote URL of the pixel.gif file that will be pinged by the browser to send tracking information
var PIXEL_ENDPOINT = process.env.OPIX_PIXEL_ENDPOINT || '/pixel.gif';

// The core openpixel.min.js file that the snippet will loaded asynchronously into the browser
var JS_ENDPOINT = process.env.OPIX_JS_ENDPOINT || '/openpixel.js';

// The current version of your openpixel configuration
var VERSION = process.env.OPIX_VERSION || '1';

// ------------------------------------------------------------------------//

// include plug-ins
var gulp = require('gulp');
var concat = require('gulp-concat');
var iife = require('gulp-iife');
var inject = require('gulp-inject-string');
var rename = require('gulp-rename');
var babel = require('gulp-babel');
var ts = require('gulp-typescript');
var terser = require('gulp-terser');
var tsProject = ts.createProject('tsconfig.json');
var tsProject2 = ts.createProject('tsconfig.json', { declaration: true });

// ---- Compile openpixel.js and openpixel.min.js files ---- //
function openpixel() {
  return (
    gulp
      .src([
        './src/config.ts',
        './src/helper.ts',
        './src/browser.ts',
        './src/cookie.ts',
        './src/url.ts',
        './src/pixel.ts',
        './src/setup.ts',
      ])
      .pipe(tsProject())
      .js.pipe(concat('openpixel.js'))
      // .pipe(babel())
      .pipe(
        iife({
          useStrict: false,
          params: [
            'window',
            'document',
            'pixelFunc',
            'pixelFuncName',
            'pixelEndpoint',
            'versionNumber',
          ],
          args: [
            'window',
            'document',
            'window["' + PIXEL_FUNC_NAME + '"]',
            '"' + PIXEL_FUNC_NAME + '"',
            '"' + PIXEL_ENDPOINT + '"',
            VERSION,
          ],
        })
      )
      .pipe(inject.prepend(HEADER_COMMENT))
      .pipe(inject.replace('OPIX_FUNC', PIXEL_FUNC_NAME))
      // This will output the non-minified version
      .pipe(gulp.dest(DESTINATION_FOLDER))
      // This will minify and rename to openpixel.min.js
      .pipe(terser())
      .pipe(inject.prepend(HEADER_COMMENT))
      .pipe(rename({ extname: '.min.js' }))
      .pipe(gulp.dest(DESTINATION_FOLDER))
  );
}

// ---- Compile snippet.html file ---- //
function snippet() {
  return (
    gulp
      .src(['./src/snippet.ts'])
      .pipe(tsProject2())
      .js.pipe(inject.replace('JS_URL', JS_ENDPOINT))
      .pipe(inject.replace('OPIX_FUNC', PIXEL_FUNC_NAME))
      // This will minify and rename to snippet.html
      .pipe(terser())
      .pipe(inject.prepend('<!-- Start Open Pixel Snippet -->\n<script>\n'))
      .pipe(inject.append('\n</script>\n<!-- End Open Pixel Snippet -->'))
      .pipe(rename({ extname: '.html' }))
      .pipe(gulp.dest(DESTINATION_FOLDER))
  );
}

// watch files and run gulp
function watch() {
  gulp.watch('src/*', openpixel);
  gulp.watch('src/*', snippet);
}

// run all tasks once
var build = gulp.parallel(openpixel, snippet);

exports.openpixel = openpixel;
exports.snippet = snippet;
exports.watch = watch;
exports.build = build;
