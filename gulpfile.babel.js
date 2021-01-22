import { series, parallel, src, dest } from "gulp";
import sass from "gulp-sass";
import { join } from "path";
import tildeImport from "node-sass-tilde-importer";
import webp from "gulp-webp";
import imagemin from "gulp-imagemin";
import rename from "gulp-rename";
import gulpdata from'gulp-data';

import nunjucksRende from "gulp-nunjucks-render";
import gulpNunjucksRender from "gulp-nunjucks-render";

const paths = {
  src: join(__dirname, "src"),
  dist: join(__dirname, "dist"),
};

//compile sccc to css
const compileSCSS = () => {
  return src(join(paths.src, "scss", "**/*.scss"))
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
  return src(join(paths.src, "pages", "*.{html,nunjucks,.njk}"))
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



export const build = series(
  parallel(nunjucksHtml,nunjucksPhp),
  parallel(compileSCSS, minifyCss),
  parallel(webpConvert, imgCompress),
  copyFonts,
  copyJs
);
export default series(nunjucksHtml,compileSCSS,parallel(copyJs,copyFonts, webpConvert, imgCompress)
);
