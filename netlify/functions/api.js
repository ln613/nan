import { makeApi } from './utils/http'
import { connect, listDocs, listDBs, listAllDocs, get, count, sample, search, flat, replace, getById, maxId, clusters, backupDB, restoreDB } from './utils/db'
import { tap } from './utils'
import { chatWithOpenAI, getOpenAIResponse, askAboutFile, getFileQuestionResponse } from './utils/openai'
import { translate } from './utils/google'
import { parse } from 'multipart-formdata'
import { cdupload, cdVersion, cdList, cdUploadRaw, cdConfig, cdListFolder, cdGetRaw } from './utils/cd'
// import { initAI, chat } from './utils/ai'

// When the agg pipeline is passed in a GET url without url-encoding the '&'
// (e.g. ?agg=p_code&m_code=regex$M0&s_code=-1&l_1), the query parser splits it
// into separate params and only q.agg keeps the first stage. Reassemble the full
// pipeline from q.agg plus any stage-prefixed params, preserving url order.
const stagePrefixes = ['u', 'l', 'k', 'm', 'a', 'r', 'p', 's', 'c', 'f']
const buildAgg = q => {
  const isStage = k => k.length > 1 && k[1] === '_' && stagePrefixes.includes(k[0])
  const parts = q.agg ? [q.agg] : []
  Object.keys(q).filter(isStage).forEach(k => parts.push(q[k] ? `${k}=${q[k]}` : k))
  return parts.join('&')
}

// Define public endpoints that don't require authentication
const publicEndpoints = [
  { method: 'get', type: 'flat' },
  { method: 'get', type: 'translate' },
  { method: 'get', type: 'doc' },
  { method: 'get', type: 'dbs' },
  { method: 'get', type: 'docs' },
  { method: 'get', type: 'allDocs' },
  { method: 'get', type: 'chat' },  // Add chat endpoint as public
  { method: 'post', type: 'save' },
  { method: 'post', type: 'search' },
  { method: 'post', type: 'flat' },
  { method: 'post', type: 'fileQuestion' },  // Add fileQuestion endpoint as public
  { method: 'post', type: 'backup' },
  { method: 'get', type: 'listBackups' },
  { method: 'post', type: 'restore' },
  // Add other public endpoints if needed
];

export const handler = makeApi({
  handlers: {
    get: {
      clusters: q => Promise.resolve(clusters),
      dbs: q => listDBs(),
      docs: q => listDocs(),
      allDocs: q => listAllDocs(),
      doc: q => get(q.doc),
      count: q => count(q.doc),
      getById: q => getById(q.doc, q.id),
      search: q => _search({ doc: q.doc, ...q.params }),
      flat: q => flat(q.doc, buildAgg(q)),
      maxId: q => maxId(q.doc),

      // cd
      cdVer: q => cdVersion(),
      cdList: q => cdList(),

      // db backup/restore
      listBackups: q => {
        cdConfig('ln613')
        return cdListFolder('db')
      },

      // google
      translate: q => translate(q.txt, q.to),
      
      // openai
      chat: q => getOpenAIResponse(q.message, {
        model: q.model || 'gpt-3.5-turbo',
        temperature: q.temperature ? parseFloat(q.temperature) : 0.7,
        maxTokens: q.maxTokens ? parseInt(q.maxTokens) : 1000
      })
    },
    post: {
      search: (q, b) => _search({ doc: q.doc, ...b }),
      sample: (q, b) => sample(q.doc, +b.size, b.sort),
      save: (q, b) => replace(q.doc, b, q.id), // q.id specify the identity field
      flat: (q, b) => flat(q.doc, b.agg),
      // update: async (q, b) => {
      //   await connect(b.cluster, b.db)
      //   return await DB.replace(b.col, b.data)
      // },

      // cd
      cdupload: (q, b) => cdupload(),

      // db backup
      backup: async (q) => {
        const collections = await backupDB()
        const [cluster, dbName] = q.db.split('.')
        const data = { _meta: { cluster, db: dbName }, collections }
        const json = JSON.stringify(data)
        const buffer = Buffer.from(json, 'utf-8')
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
        const filename = `${cluster}_${dbName}_${timestamp}`
        cdConfig('ln613')
        const result = await cdUploadRaw(buffer, 'db', filename)
        return { message: 'Backup uploaded to Cloudinary', url: result.secure_url, filename }
      },

      // db restore
      restore: async (q, b) => {
        if (!b.url) throw new Error('Backup url is required')
        if (!b.cluster) throw new Error('Target cluster is required')
        if (!b.name) throw new Error('Backup name is required')
        const json = await cdGetRaw(b.url)
        const data = JSON.parse(json)
        const { dbName, collections } = parseBackupData(data, b.name)
        const targetDb = b.dbOverride || dbName
        await connect(`${b.cluster}.${targetDb}`)
        const results = await restoreDB(collections)
        return { message: `Restore to ${b.cluster}.${targetDb} completed`, results }
      },

      // ai
      // chat: (q, b) => chat(b.text),
      
      // file question with OpenAI - handle multipart form data
      fileQuestion: async (q, b, event) => {
        try {
          // Check for multipart content type
          const contentType = event.headers['content-type'] || event.headers['Content-Type'];
          if (!contentType || !contentType.includes('multipart/form-data')) {
            throw new Error('Content-Type must be multipart/form-data');
          }

          // Extract boundary
          const boundary = contentType.split('boundary=')[1];
          if (!boundary) {
            throw new Error('Missing boundary in Content-Type');
          }

          // Parse form data using parse-multipart-data
          const formData = parse(Buffer.from(event.body, 'base64'), boundary);
          
          // Find the file field
          const fileField = formData.find(field => field.name === 'file');
          if (!fileField || !fileField.data) {
            throw new Error('File is required in form data');
          }
          
          // Extract question and other parameters
          const questionField = formData.find(field => field.name === 'question');
          if (!questionField) {
            throw new Error('Question is required in form data');
          }
          
          // Get the question text
          const question = questionField.data.toString();
          
          // Extract optional parameters
          const model = formData.find(field => field.name === 'model')?.data.toString();
          const assistantId = formData.find(field => field.name === 'assistantId')?.data.toString();
          const temperatureField = formData.find(field => field.name === 'temperature');
          const maxTokensField = formData.find(field => field.name === 'maxTokens');
          
          const temperature = temperatureField ? parseFloat(temperatureField.data.toString()) : 0.7;
          const maxTokens = maxTokensField ? parseInt(maxTokensField.data.toString()) : 1000;
          
          // Check file size (max 100MB)
          const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes
          if (fileField.data.length > MAX_FILE_SIZE) {
            throw new Error('File size exceeds the maximum limit of 100MB');
          }
          
          // Process the file and get response
          return await getFileQuestionResponse(
            fileField.data,                  // file content as Buffer
            fileField.filename || 'uploaded-file',  // original filename with extension
            question,                        // question to ask about the file
            {
              model,                         // optional: override model
              assistantId,                   // optional: assistant ID for Excel files
              temperature,
              maxTokens
            }
          )
        } catch (error) {
          console.error('Error processing file question:', error)
          throw error
        }
      },
    },
  },
  connectDB: connect,
  // initAI: initAI,
  nocache: true,
  publicEndpoints: publicEndpoints,
})

const _search = async ({ doc, query, fields, sort, path }) => {
  let list = await search(doc, query, fields, sort)
  if (list.length > 0 && path) {
    list = path.split('.').reduce((p, c) => p[0][c], list) || []
  }
  return list
}

// Parse backup data, supporting both new format (with _meta) and old format (raw collections)
// Filename format: cluster_db_timestamp (e.g. mylist_mylist_2026-06-16T...)
const parseBackupData = (data, backupName) => {
  if (data._meta) {
    return { dbName: data._meta.db, collections: data.collections }
  }
  // Old format: top-level keys are collection names, extract db from filename
  const parts = backupName.split('_')
  const dbName = parts.length >= 2 ? parts[1] : parts[0]
  return { dbName, collections: data }
}
