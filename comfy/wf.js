const WebSocket = require("ws");
const axios = require('axios')
const _ = require('lodash')
const fs = require('fs');

const WEBSOCKET_URL = "ws://127.0.0.1:8188/ws";
const COMFYUI_URL = 'http://127.0.0.1:8188/prompt'
const WF_DIR = 'C:/Software/comfy/ComfyUI/user/default/workflows/'

const API =
  //'ff'
  'faceswap'
const positive = "a full body portrait of fionan, with {1}'s body, full body nude, white skin, {0}, best quality, masterpiece, (realistic:1.2)"
const body = 'yb1'
const batch = 1
const steps = 25
const test = false // batch = 1, steps = 4, no additional prompts
const gpt = false // use gpt generated prompts, false = no additional prompts
const imgDir = 'C:/t/swap/1/'
const srcImgs = imgDir ? fs.readdirSync(imgDir) : []

const ws = new WebSocket(WEBSOCKET_URL);
const wf = JSON.parse(fs.readFileSync(`${WF_DIR}${API}_api.json`, 'utf-8'))
let n = 0
let started

const init = {
  'ff': () => {
    wf['5'].inputs.batch_size = test ? 1 : batch
    wf['31'].inputs.lora_name_2 = `${body}.safetensors`
    wf['33'].inputs.seed = _.random(1000000000000)
    wf['33'].inputs.steps = test ? 4 : steps
    const desc = PS.prompts[n].description.replace('A girl', 'She').replace('A young woman', 'She')
    const pose = PS.prompts[_.random(PS.prompts.length - 1)].pose
    const expression = PS.prompts[_.random(PS.prompts.length - 1)].expression
    wf['35'].inputs.text = positive
      .replace('{0}', (test || !gpt) ? '' : `${desc},${pose},${expression}`)
      .replace('{1}', body)  
  },
  'faceswap': () => {
    wf['77'].inputs.seed = _.random(1000000000000)
    wf['79'].inputs.image = `${imgDir}${srcImgs[n]}`
  }
}

const total = {
  'ff': test ? 3 : !gpt ? 10 : PS.prompts.length,
  'faceswap': srcImgs.length,
}

const queue = async () => {
  init[API]();
  const response = await axios.post(COMFYUI_URL, { prompt: wf })
  if (response.status === 200 && response.data.prompt_id) {
    const prompt_id = response.data.prompt_id;
    console.log(`📤 Workflow submitted! Prompt ID: ${prompt_id}`);

    // Listen for updates related to this prompt ID
    ws.send(JSON.stringify({ type: "status", prompt_id }));
  } else {
    console.error("❌ Failed to submit workflow:", response.data);
  }
}

ws.on("open", async () => {
    console.log("✅ Connected to ComfyUI WebSocket!");
    await queue()
});

// Listen for messages from ComfyUI WebSocket
ws.on("message", async (data) => {
  const message = JSON.parse(data);
  console.log(`📊 Status Update: ${JSON.stringify(message.data)}`);
  if (message.type == 'progress') started = true
  if (started && message.data.status?.exec_info?.queue_remaining == 0) {
    console.log(`✅ Execution Complete! Prompt ID: ${message.prompt_id}`);
    started = false
    if (n < total[API] - 1) {
      n++
      await new Promise(r => setTimeout(r, 2000));
      await queue()
    } else {
      ws.close(); // Close WebSocket connection after completion
    }
  }
});

// Handle WebSocket errors
ws.on("error", (error) => {
    console.error("❌ WebSocket Error:", error.message);
});

// Handle WebSocket close event
ws.on("close", () => {
    console.log("🔌 Disconnected from ComfyUI WebSocket.");
});

const PS = {
  "prompts": [
    {
      "location": "Venice, Italy - Grand Canal",
      "description": "A young woman stands near the Grand Canal in Venice, Italy. The sun casts golden reflections on the water as gondolas drift by. Historic buildings with intricate facades line the canal, and birds fly overhead in the warm afternoon light.",
      "pose": "Leaning against a stone railing, one hand resting on her chin, gazing at the canal.",
      "expression": "Soft smile with a dreamy, thoughtful look in her eyes."
    },
    {
      "location": "Cairo, Egypt - Great Pyramids",
      "description": "A girl stands in the vast Egyptian desert, gazing at the towering Great Pyramids of Giza. The golden sand stretches endlessly, and the warm wind carries the whispers of ancient history. The setting sun bathes the scene in a fiery orange glow.",
      "pose": "Standing with one hand shielding her eyes from the sun, looking into the distance.",
      "expression": "Awe and wonder, with slightly parted lips as she takes in the grand sight."
    },
    {
      "location": "New York City, USA - Times Square",
      "description": "A girl stands in the heart of Times Square at night, surrounded by dazzling neon billboards and the blur of rushing crowds. The vibrant energy of the city pulses around her as yellow taxis speed by and street performers entertain passersby.",
      "pose": "Hands in pockets, one foot slightly forward, casually taking in the busy surroundings.",
      "expression": "Curious and excited, wide eyes reflecting the neon lights."
    },
    {
      "location": "Paris, France - Eiffel Tower Gardens",
      "description": "A young woman stands in a beautiful garden near the Eiffel Tower. The iconic iron structure rises in the background, partially framed by blossoming trees. The soft breeze carries the scent of fresh flowers as the city buzzes in the distance.",
      "pose": "Sitting on a bench with hands resting on her lap, tilting her head slightly.",
      "expression": "Gentle and serene, a peaceful smile as she enjoys the moment."
    },
    {
      "location": "Iceland - Northern Lights",
      "description": "A girl stands alone in the vast Icelandic wilderness, mesmerized by the glowing green and purple auroras dancing in the night sky. The icy terrain glistens under the celestial light, with snow-capped mountains stretching across the horizon.",
      "pose": "Arms outstretched towards the sky, taking in the magical sight.",
      "expression": "Joy and amazement, eyes wide and a bright smile."
    },
    {
      "location": "Bali, Indonesia - Lush Rice Terraces",
      "description": "A young woman stands on a hill overlooking the breathtaking rice terraces of Bali. The vibrant green fields stretch endlessly in cascading layers, reflecting the soft morning sunlight. A gentle mist rolls over the landscape, adding a dreamlike quality.",
      "pose": "Hands on hips, looking down at the landscape with appreciation.",
      "expression": "Calm and content, a relaxed smile as she breathes in the fresh air."
    },
    {
      "location": "Rio de Janeiro, Brazil - Copacabana Beach",
      "description": "A girl stands on the golden sands of Copacabana Beach, watching the waves crash against the shore. The distant sound of samba music drifts through the air, and the iconic Sugarloaf Mountain looms in the background as the sun sets over the Atlantic Ocean.",
      "pose": "Barefoot in the sand, one foot slightly raised, arms loosely crossed.",
      "expression": "Playful and relaxed, with a soft grin as she enjoys the ocean breeze."
    },
    {
      "location": "Kyoto, Japan - Bamboo Forest",
      "description": "A young woman stands in the middle of the Arashiyama Bamboo Forest, surrounded by towering green stalks that sway gently in the wind. Sunlight filters through the dense canopy, casting enchanting patterns of light and shadow on the path below.",
      "pose": "Walking slowly down the path, one hand lightly touching the bamboo.",
      "expression": "Peaceful and introspective, a slight, contented smile."
    },
    {
      "location": "Santorini, Greece - Cliffside View",
      "description": "A girl stands on a white stone terrace in Santorini, gazing out over the endless blue sea. The sun is setting, painting the sky in shades of pink and orange, while the iconic white and blue buildings cling to the cliffs below.",
      "pose": "Resting her hands on the railing, leaning slightly forward towards the ocean.",
      "expression": "Serene and in awe, eyes slightly closed, savoring the sunset."
    },
    {
      "location": "Patagonia, Argentina - Mountain Wilderness",
      "description": "A young woman stands in the rugged wilderness of Patagonia, surrounded by towering snow-capped peaks and crystal-clear glacial lakes. The crisp mountain air and vast, untouched landscape create a feeling of profound solitude and wonder.",
      "pose": "Standing with arms crossed, gazing at the towering mountains.",
      "expression": "Determined and adventurous, a subtle yet confident smile."
    }
  ]
}
