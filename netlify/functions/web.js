import { makeApi } from './utils/http'
import {
  getArrayUrl,
  getArrayHtml,
  // getNewItemsInPage,
  // youtubeDownloadUrl,
  // saveItemsInPage,
  extractSaved,
  // download,
  folder,
} from './utils/html'

// https://sace-mongodb.netlify.app/.netlify/functions/web?type=...
export const handler = makeApi({
  handlers: {
    get: {
      test: q => 'ok',
      // &url=...&selectors=selector@attr
      // &url=...&selectors=root!selector1@attr1@name1,selector2@attr2@name2
      extractUrl: q => getArrayUrl(q.url, q.selectors),
      // youtubeDownloadUrl: q => youtubeDownloadUrl(q.url),
      // folder: q => folder(q.folder),
    },
    post: {
      extractHtml: (q, b) => getArrayHtml(b.html, b.selectors),
      extractSaved: (q, b) => extractSaved(q.name, q.def, b),
      // getNewItemsInPage: (q, b) => getNewItemsInPage(b),
      // saveItemsInPage: (q, b) => saveItemsInPage(b),
      // download: (q, b) => download(b),
    },
  },
  nocache: true,
})
