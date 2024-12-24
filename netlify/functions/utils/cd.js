import cd from 'cloudinary'

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