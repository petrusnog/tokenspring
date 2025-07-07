const { watch, series } = require('gulp');
const browserSync = require('browser-sync').create();

function serve(cb) {
  browserSync.init({
    proxy: 'http://localhost:3000', // seu app Node.js precisa estar rodando nessa porta
    port: 3001,
    open: false, // não abre o navegador toda vez
    notify: false
  });
  cb();
}

function reload(cb) {
  browserSync.reload();
  cb();
}

function watchFiles() {
  watch(['views/**/*.html', 'public/**/*.{css,js}'], series(reload));
}

exports.default = series(serve, watchFiles);
