import 'zone.js/dist/zone-node';
import {enableProdMode} from '@angular/core';
// Express Engine
import {ngExpressEngine} from '@nguniversal/express-engine';
// Import module map for lazy loading
import {provideModuleMap} from '@nguniversal/module-map-ngfactory-loader';

import * as express from 'express';
import {join} from 'path';

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { renderModuleFactory } from '@angular/platform-server';
import { mkdirSync } from 'mkdir-recursive';

(global as any).WebSocket = require('ws');
(global as any).XMLHttpRequest = require('xhr2');

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
export const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist/browser');

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const {AppServerModuleNgFactory, LAZY_MODULE_MAP} = require('./dist/server/main');

// Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));

app.set('view engine', 'html');
app.set('views', DIST_FOLDER);

// Example Express Rest API endpoints
// app.get('/api/**', (req, res) => { });
// Serve static files from /browser
app.get('*.*',  express.static(DIST_FOLDER, {
  maxAge: '1d'
}));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render('index', { req });
});

// Start up the Node server
if (process.env.PRERENDER) {
  const template = readFileSync(join(DIST_FOLDER, 'index.html')).toString();
  const routes = [
    '/',
    '/login',
    '/404',
    '/claim',
    '/about'
  ];

  Promise.all(
    routes.map(route =>
      renderModuleFactory(AppServerModuleNgFactory, {
        document: template,
        url: route,
        extraProviders: [
          provideModuleMap(LAZY_MODULE_MAP)
        ]
      }).then(html => [route, html])
    )
  ).then(results => {
    results.forEach(([route, html]) => {
      const fullPath = join(DIST_FOLDER, route);
      console.log('rendered route:', route, '-', fullPath);
      if (!existsSync(fullPath)) {
        mkdirSync(fullPath);
      }
      writeFileSync(join(fullPath, 'index.html'), html);
    });
    process.exit();
  });
}
else if (!process.env.FUNCTION_NAME) {

  // If we're not in the Cloud Functions environment, spin up a Node server
  app.listen(PORT, () => {
    console.log(`Node server listening on http://localhost:${PORT}`);
  });
}
