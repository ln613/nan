// import PusherServer from 'pusher'
import PusherClient from 'pusher-js'

// export const pusherServer = new PusherServer({
//   appId: process.env.PUSHER_APP_ID!,
//   key: process.env.PUSHER_APP_KEY!,
//   secret: process.env.PUSHER_APP_SECRET!,
//   cluster: 'us3',
//   useTLS: true,
// })

export const pusherClient = new PusherClient('c248f5fbb8ba1c92329e', {
  cluster: 'us3',
  authEndpoint: '/api/pusher-auth',
  authTransport: 'ajax',
  auth: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
})
