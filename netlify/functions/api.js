import { makeApi } from './utils/http'
import { connect, listDocs, listDBs, listAllDocs, get, count, sample, search, flat, replace, getById, maxId, clusters } from './utils/db'
import { tap } from './utils'
import { chatWithOpenAI, getOpenAIResponse, askAboutFile, getFileQuestionResponse } from './utils/openai'
import { translate } from './utils/google'
import { parse } from 'multipart-formdata'
import { cdupload, cdVersion, cdList } from './utils/cd'
// import { initAI, chat } from './utils/ai'

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
      flat: q => flat(q.doc, tap(q).agg),
      maxId: q => maxId(q.doc),

      // cd
      cdVer: q => cdVersion(),
      cdList: q => cdList(),

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
