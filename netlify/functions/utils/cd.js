import cd from 'cloudinary'
import fetch from 'node-fetch'

const configs = process.env.CD.split(' ').map(x => x.split(','))

export const cdConfig = (id = 'lnnlgmail') => {
  const cfg = configs.find(x => x[0] === id)
  cd.config({
    cloud_name: cfg[0],
    api_key: cfg[1],
    api_secret: cfg[2],
  })
}

cdConfig()

export const cdList = () =>
  cd.v2.api
    .resources({ max_results: 500 })
    .then(r => sortWith([ascend(prop('public_id'))], r.resources))

export const cdVersion = () =>
  cd.v2.api
    .resources({ max_results: 500 })
    .then(r => sortWith([descend(prop('version'))], r.resources)[0].version)

export const cdupload = ({ url, folder, name }) =>
  cd.v2.uploader.upload(url, {
    public_id: folder + '/' + name,
    use_filename: true,
    unique_filename: false,
    overwrite: true,
  })

export const cdUploadRaw = (buffer, folder, name) =>
  new Promise((resolve, reject) => {
    const stream = cd.v2.uploader.upload_stream(
      {
        public_id: folder + '/' + name,
        resource_type: 'raw',
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      },
      (error, result) => {
        if (error) reject(error)
        else resolve(result)
      },
    )
    stream.end(buffer)
  })

export const cdListFolder = (folder) =>
  cd.v2.api
    .resources({
      type: 'upload',
      resource_type: 'raw',
      prefix: folder + '/',
      max_results: 500,
    })
    .then(r =>
      r.resources
        .map(x => ({
          public_id: x.public_id,
          name: x.public_id.replace(folder + '/', ''),
          url: x.secure_url,
          created_at: x.created_at,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    )

export const cdGetRaw = (url) =>
  fetch(url).then(r => r.text())