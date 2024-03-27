"use server"
import * as Ably from 'ably'

export async function publishSubscribe() {


const client = new Ably.Realtime({
  key: process.env.ABLY_API_KEY,
  
})

client.connection.on('failed', function() {
  console.log('Connection failed');

})
client.connection.on('connected', function() {
  console.log('Connected to Ably');
  const channel = client.channels.get('chat')
  channel.subscribe('message', function(message) {
    console.log('Received message: connect to crisp chat', message.data)
  })
  channel.publish('message', 'Hello from Avatar')
})

  // console.log('Starting Ably:2')
  //   const client = new BaseRealtime({
  //     key: process.env.ABLY_API_KEY,
  //     plugins: {WebSocketTransport, FetchRequest, RealtimePresence}
  //   })
  //   client.connection.on('connected', () => {
  //     console.log('Connected to Ably')
  
  //   })
  //   const channel = client.channels.get('chat')
  //   channel.subscribe('message', message => {
  //     console.log('Received message:', message.data)
  //   })
  //   channel.publish('message', 'Hello from Ably')
  
  }
  
  //publishSubscribe()