import { series, parallel, src, dest, watch } from "gulp";
import {sync} from 'glob';
import sass from "gulp-sass";
import { join,basename } from "path";
import tildeImport from "node-sass-tilde-importer";
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";
import rename from "gulp-rename";
// import {babel} from 'gulp-babel';
// import {uglify} from 'gulp-u'

import nunjucksRende from "gulp-nunjucks-render";
import gulpNunjucksRender from "gulp-nunjucks-render";

const paths = {
  src: join(__dirname, "src"),
  dist: join(__dirname, "dist"),
};

const scssPath = sync(join(paths.src, "scss", "**/*.scss"));
const jsPath = sync(join(paths.src, "js", "**/*.js"));
const  nunjucksPathHTML = sync(join(paths.src, "pages", "*.{html,nunjucks,.njk}"));
const nunjucksTemplates = sync(join(paths.src,'templates'))
//compile sccc to css
const compileSCSS = () => {
  return src(scssPath)
    .pipe(sass({ importer: tildeImport }).on("error", sass.logError))
    .pipe(dest(join(paths.dist, "css")));
};
const minifyCss = () => {
  return (
    src(join(paths.src, "scss", "**/*.scss"))
      .pipe(
        sass({ outputStyle: "compressed", importer: tildeImport }).on(
          "error",
          sass.logError
        )
      )
      //.pipe(sass({importer: tildeImport,outputStyle: 'compressed'}).on('error', sass.logError))
      .pipe(
        rename(({ dirname, basename, extname }) => ({
          dirname,
          basename: `${basename}.min`,
          extname,
        }))
      )
      .pipe(dest(join(paths.dist, "css")))
  );
};

// const compileJs = () => {
//   return src(scssPath)
// }
const webpConvert = () => {
  return src(join(paths.src, "images", "**/*.{jpg,png}"))
    .pipe(webp())
    .pipe(dest(join(paths.dist, "images")));
};
const imgCompress = () => {
  return src(join(paths.src, "images", "**/*.{jpg,png,svg,jpeg}"))
    .pipe(
      imagemin({
        progressive: true,
      })
    )
    .pipe(dest(join(paths.dist, "images")));
};

const nunjucksTemp = () => {
  return src(join(paths.src, "templates", "**/*.html"))
    .pipe(
      nunjucksRender({
        path: [`${paths.src}/templates`], // String or Array
      })
    )
    .pipe(gulp.dest("dist"));
};

const copyFonts = () => {
  return src(
    join(paths.src, "fonts", "**/*.{eot,svg,ttf,woff,woff2,otf}")
  ).pipe(dest(join(paths.dist, "fonts")));
};

const copyJs = () => {
  return src(
    join(paths.src, "js", "**/*.js")
  ).pipe(dest(join(paths.dist, "js")));
};

const nunjucksHtml = () => {
  return src(nunjucksPathHTML)
    .pipe(
      gulpNunjucksRender({
        path: [`${paths.src}/templates`],
        ext:'.html'
      })
    )
    .pipe(dest(join(paths.dist)));
};

const nunjucksPhp = () => {
  return src(join(paths.src, "pages", "*.{html,nunjucks,.njk}"))
    .pipe(
      gulpNunjucksRender({
        path: [`${paths.src}/templates`],
        ext:'.php'
      })
    )
    .pipe(dest(join(paths.dist,'php')));
};

const watchFiles = () => {
  const scssFiles = scssPath;
  const nunjucksFiles = nunjucksPathHTML;
  console.log(scssFiles);
  
 // watch(scssFiles,series(compileSCSS,minifyCss));
  watch(scssFiles,series(compileSCSS,minifyCss));
  console.log(nunjucksFiles);
 watch(nunjucksFiles,nunjucksHtml);
 console.log(nunjucksTemplates);
  watch(nunjucksTemplates,nunjucksHtml)
};

export const watchFile = watchFiles ;

export const build = series(
  parallel(nunjucksHtml,nunjucksPhp),
  compileSCSS, minifyCss,
  parallel(webpConvert, imgCompress),
  copyFonts,
  copyJs
);
export default series(nunjucksHtml,compileSCSS,parallel(copyJs,copyFonts, webpConvert, imgCompress)
);
