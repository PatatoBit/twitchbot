import { RefreshingAuthProvider } from "@twurple/auth"
import { ChatClient } from "@twurple/chat"
import { promises as fs } from "fs"
import dotenv from "dotenv-flow"

dotenv.config({
  default_node_env: "development",
})

const investIntervalMs = 304000 * 2 //60000
const farmIntervalMs = 304000
const stopTime = 2 * 60 * 60 * 1000
let running = true

const clientId = process.env.CLIENT_ID as string
const clientSecret = process.env.CLIENT_SECRET as string
const channel = process.env.CHANNEL as string

async function main() {
  setTimeout(() => {
    console.log("Stopped")
    running = false
  }, stopTime)

  const tokenData = JSON.parse(await fs.readFile("./tokens.json", "utf-8"))
  const auth = new RefreshingAuthProvider(
    {
      clientId,
      clientSecret,
      onRefresh: async (newTokenData) =>
        await fs.writeFile(
          "./tokens.json",
          JSON.stringify(newTokenData, null, 2),
          "utf-8"
        ),
    },
    tokenData
  )

  // function randomIntFromInterval() { 
  //   return Math.floor(Math.random() * (27 - 7 + 1) + 7)
  // }

  const chatClient = new ChatClient(auth, { channels: [channel] })

  chatClient.onConnect(async () => {
    console.log("CONNECTED", { channel })

    
    setInterval(async () => {
      if (!running) {
        return
      }
      
      const amounts = 1
      const invest = `!invest ${amounts}`
      await chatClient.say(channel, invest).then(
        () => {
          console.log("Sent", { invest } )
        },
        (reason) => {
          console.error("Not sent", { reason })
        }
        )
        
      }, investIntervalMs)
      
      
    setInterval(async () => {
      if (!running) {
        return
      }

      const message = `!farm`
      await chatClient.say(channel, message).then(
        () => {
          console.log("Sent", { message } )
        },
        (reason) => {
          console.error("Not sent", { reason })
        }
      )

    }, farmIntervalMs)
  })

  await chatClient.connect()
}

main()
