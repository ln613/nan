const robot = require('robotjs');
const { Jimp, rgbaToInt, diff } = require('jimp');
const fs = require('fs');

const black = "\x1b[30m"
const red = "\x1b[31m"
const green = "\x1b[32m"
const yellow = "\x1b[33m"
const blue = "\x1b[34m"
const gap = 708

const sleep = s => new Promise(resolve => setTimeout(resolve, s * 1000));

// Parse command line arguments
const args = process.argv.slice(2);
let isDebug = args.includes('--debug') || args.includes('-d') ? 1 : 0;
const isPos = args.includes('--pos') || args.includes('-p') ? 1 : 0;
const isCopy = args.includes('--copy') || args.includes('-c') ? 1 : 0;
if (isCopy) isDebug = 1

// Show help if requested
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage: node lg.js [options]

Options:
  --debug, -d    Enable debug mode (saves screenshots, breaks after first loop)
  --pos, -p      Show mouse position and exit
  --copy, -c     Enable copy mode
  --help, -h     Show this help message

Examples:
  node lg.js --debug     # Run in debug mode
  node lg.js --pos       # Show current mouse position
  node lg.js --copy      # Run in copy mode
  node lg.js -d -p       # Run in debug mode and show position
`);
  process.exit(0);
}

const imgs1 = [
{ name: 'sup open t', x: 1845, y: 289, w: 300, h: 60, click: { x: 1844, y: 403 }, win: 'top' },
{ name: 'sup leave t', x: 1845, y: 289, w: 300, h: 60, click: { x: 1988, y: 403 }, win: 'top' },
{ name: 'sup t', x: 1839, y: 373, w: 185, h: 200, click: { x: 1917, y: 524 }, win: 'top' },
{ name: 'sup spend t', x: 1839, y: 502, w: 315, h: 75, click: { x: 1917, y: 524 }, win: 'top' },
// { name: 'vic t', x: 1884, y: 372, w: 138, h: 38, win: 'top' },
{ name: 'tap 1 t', x: 2230, y: 585, w: 148, h: 28, win: 'top' }, // tap anywhere
{ name: 'tap 2 t', x: 2255, y: 584, w: 196, h: 32, win: 'top' }, // tap to continue
{ name: 'x1 t', x: 2280, y: 179, w: 46, h: 46, win: 'top' }, // black
{ name: 'x3 t', x: 2314, y: 148, w: 55, h: 55, win: 'top' }, // white
{ name: 'open 1 t', x: 1505, y: 560, w: 84, h: 40, win: 'top' },
{ name: 'open 2 t', x: 1615, y: 558, w: 92, h: 50, win: 'top' },
{ name: 'open 3 t', x: 1727, y: 560, w: 86, h: 44, win: 'top' },
{ name: 'open 4 t', x: 1840, y: 561, w: 90, h: 46, win: 'top' },
{ name: 'play t', x: 1896, y: 552, w: 85, h: 50, win: 'top' },
{ name: 'fight 1 t', x: 2231, y: 548, w: 200, h: 75, win: 'top' },
{ name: 'slot 7 t', x: 2162, y: 563, w: 150, h: 34, click: { x: 1891, y: 402 }, win: 'top' },
{ name: 'comm t', x: 1543, y: 127, w: 100, h: 45, click:{ x: 1489, y: 136 }, win: 'top' },
{ name: 'event t', x: 1465, y: 124, w: 200, h: 45, click: { x: 1489, y: 136 }, win: 'top' },
{ name: 'claim t', x: 1877, y: 530, w: 150, h: 45, click: { x: 1917, y: 543 }, win: 'top' },
{ name: 'err t', x: 1715, y: 135, w: 220, h: 40, click: { x: 1374, y: 95 }, win: 'top' },
//{ name: 'fight t', x: 1879, y: 388, w: 156, h: 66, win: 'top' },

{ name: 'sup open b', x: 1845, y: 995, w: 300, h: 60, click: { x: 1844, y: 1107 }, win: 'bottom' },
{ name: 'sup leave b', x: 1845, y: 995, w: 300, h: 60, click: { x: 1988, y: 1107 }, win: 'bottom' },
{ name: 'sup b', x: 1839, y: 1078, w: 185, h: 200, click: { x: 1917, y: 1228 }, win: 'bottom' },
{ name: 'sup spend b', x: 1839, y: 1207, w: 315, h: 75, click: { x: 1917, y: 1228 }, win: 'bottom' },
{ name: 'vic b', x: 1880, y: 1077, w: 138, h: 38, win: 'bottom' },
{ name: 'tap 1 b', x: 2230, y: 1289, w: 148, h: 28, win: 'bottom' },
{ name: 'tap 2 b', x: 2260, y: 1288, w: 196, h: 32, win: 'bottom' },
{ name: 'x1 b', x: 2280, y: 884, w: 46, h: 46, win: 'bottom' },
{ name: 'x2 b', x: 2327, y: 935, w: 40, h: 40, win: 'bottom' }, // set up account
{ name: 'x3 b', x: 2318, y: 856, w: 40, h: 40, win: 'bottom' },
{ name: 'open 1 b', x: 1505, y: 1266, w: 84, h: 40, win: 'bottom' },
{ name: 'open 2 b', x: 1614, y: 1263, w: 92, h: 50, win: 'bottom' },
{ name: 'open 3 b', x: 1728, y: 1265, w: 86, h: 44, win: 'bottom' },
{ name: 'open 4 b', x: 1838, y: 1265, w: 90, h: 46, win: 'bottom' },
{ name: 'open 5 b', x: 1951, y: 1265, w: 90, h: 46, win: 'bottom' },
{ name: 'play b', x: 1896, y: 1218, w: 85, h: 50, win: 'bottom' },
{ name: 'fight 1 b', x: 2234, y: 1254, w: 200, h: 75, win: 'bottom' },
{ name: 'slot 8 b', x: 2276, y: 1267, w: 152, h: 40, click: { x: 1891, y: 1110 }, win: 'bottom' },
{ name: 'err b', x: 1713, y: 841, w: 225, h: 35, click: { x: 1374, y: 799 }, win: 'bottom' },
{ name: 'black b', x: 1467, y: 831, w: 100, h: 50, click: { x: 1374, y: 799 }, win: 'bottom' },
{ name: 'comm b', x: 1543, y: 832, w: 100, h: 45, click: { x: 1489, y: 840 }, win: 'bottom' },
{ name: 'event b', x: 1465, y: 829, w: 200, h: 45, click: { x: 1489, y: 840 }, win: 'bottom' },
{ name: 'claim b', x: 1877, y: 1235, w: 150, h: 45, click: { x: 1917, y: 1248 }, win: 'bottom' },
// { name: 'lucy b', x: 1827, y: 994, w: 300, h: 60, click: { x: 1919, y: 1107 }, win: 'bottom' },
//{ name: 'fight b', x: 1879, y: 1095, w: 156, h: 66, win: 'bottom' },

{ name: 'sup open y', x: 578, y: 995, w: 250, h: 50, click: { x: 575, y: 1092 }, win: 'y' },
{ name: 'sup leave y', x: 578, y: 995, w: 250, h: 50, click: { x: 698, y: 1092 }, win: 'y' },
{ name: 'sup y', x: 573, y: 1068, w: 155, h: 170, click: { x: 637, y: 1196 }, win: 'y' },
{ name: 'sup spend y', x: 570, y: 1177, w: 270, h: 62, click: { x: 637, y: 1196 }, win: 'y' },
{ name: 'tap 1 y', x: 904, y: 1244, w: 148, h: 28, win: 'y' },
{ name: 'tap 2 y', x: 928, y: 1243, w: 196, h: 32, win: 'y' },
{ name: 'x1 y', x: 945, y: 900, w: 46, h: 46, win: 'y' },
{ name: 'x3 y', x: 978, y: 878, w: 40, h: 40, win: 'y' },
{ name: 'open 1 y', x: 282, y: 1222, w: 84, h: 40, win: 'y' },
{ name: 'open 2 y', x: 375, y: 1222, w: 92, h: 50, win: 'y' },
{ name: 'open 3 y', x: 472, y: 1222, w: 86, h: 44, win: 'y' },
{ name: 'open 4 y', x: 568, y: 1222, w: 86, h: 44, win: 'y' },
{ name: 'play y', x: 615, y: 1215, w: 85, h: 50, win: 'y' },
{ name: 'fight 1 y', x: 905, y: 1210, w: 200, h: 75, win: 'y' },
{ name: 'slot 7 y', x: 843, y: 1225, w: 152, h: 40, click: { x: 632, y: 1100 }, win: 'y' },
{ name: 'err y', x: 433, y: 871, w: 225, h: 35, click: { x: 93, y: 827 }, win: 'y' },
{ name: 'comm y', x: 316, y: 858, w: 100, h: 45, click: { x: 271, y: 866 }, win: 'y' },
{ name: 'event y', x: 253, y: 855, w: 200, h: 45, click: { x: 271, y: 866 }, win: 'y' },
//{ name: 'fight y', x: 606, y: 1082, w: 130, h: 45, win: 'y' },



// { name: 'x2', x: 2347, y: 890, w: 44, h: 42 },
  // { name: 'x5', x: 2366, y: 855, w: 45, h: 45 },
  // { name: 'x6', x: 2373, y: 929, w: 45, h: 45 },
  // { name: 'auto', x: 2385, y: 955, w: 75, h: 85, click: { x: 2410, y: 980 } },  

// { name: 'win t', x: 2248, y: 1119, w: 174, h: 96, win: 'top' },
// { name: 'win b', x: 2255, y: 1119, w: 174, h: 96, win: 'bottom' },
// { name: 'lost t', x: 1944, y: 1000, w: 76, h: 44, win: 'top' },
// { name: 'lost b', x: 1949, y: 1000, w: 76, h: 44, win: 'bottom' },

]

// imgs1.forEach(x => {
//   if (x.win === 'top') x.win = 'bottom'
//   else if (x.win === 'bottom') x.win = 'top'
// })

const imgs1Top  = imgs1.filter(x => x.win === 'top')
const imgs1Bottom  = imgs1.filter(x => x.win === 'bottom')
const imgs1X  = imgs1.filter(x => x.win === 'x')
const imgs1Y  = imgs1.filter(x => x.win === 'y')
// const imgs1Both  = imgs1.filter(x => !x.win).map(x => ({ ...x, win: 'bottom' }))

// const imgs2 = imgs1Both.map(x => ({
//   ...x,
//   y: x.y - gap,
//   click: x.click ? {
//     ...x.click,
//     y: x.click.y - gap,
//   } : undefined,
//   win: 'top'
// }))

imgs1Top.forEach(x => {
  if (x.y > gap) x.y -= gap;
  if (x.click?.y > gap) x.click.y -= gap;
})
imgs1Bottom.forEach(x => {
  if (x.y < gap) x.y += gap;
  if (x.click?.y < gap) x.click.y += gap;
})
const imgs = [...imgs1Top, ...imgs1Bottom, ...imgs1X, ...imgs1Y]
//.filter(x => !isDebug || x.win === 'top');

const click = async (x, y) => {
  robot.setMouseDelay(100);
  robot.moveMouse(x,y);
  robot.setMouseDelay(100);
  robot.mouseClick();
  robot.setMouseDelay(100);
  robot.mouseClick();
}

const hasImg = async img => {
  try {
    const ss = capture(img)
    isDebug && await ss.write('output.png');
    if (isCopy && imgs.length === 1) {
      if (fs.existsSync('output.png')) {
        fs.renameSync('output.png', `images/${img.name}.png`);
        console.log(blue, `moved output.png to images/${img.name}.png`)
      }
    }
    const file = await Jimp.read(`images/${img.name}.png`)
    const d = diff(ss, file, 0.2);
    // console.log(black, `${img.win} ${img.name}: ${d.percent}`)
    return d.percent < (img.per || 0.05);
  } catch (e) {
    return false
  }
}
  
const capture = img => {
  const bitmap = robot.screen.capture(img.x, img.y, img.w, img.h);

  const image = new Jimp({ width: img.w, height: img.h});
  let i = 0;

  for (let y = 0; y < img.h; y++) {
    for (let x = 0; x < img.w; x++) {
      const index = (y * bitmap.byteWidth) + (x * bitmap.bytesPerPixel);
      const r = bitmap.image[index];
      const g = bitmap.image[index + 1];
      const b = bitmap.image[index + 2];
      const color = rgbaToInt(r, g, b, 255);
      image.setPixelColor(color, x, y);
      i++;
    }
  }

  return image;
}

let vict = 0
let vicb = 0
let vicy = 0
const noFightt = 3000
const noFightb = 3000
const noFighty = 3000
let supt = 0
let supb = 0
let supy = 0
const supOpent = 1
const supOpenb = 1
const supOpeny = 1
let cur = ''
const idle = [
  { x: 1481, y: 198 },
  { x: 1481, y: 902 },
  { x: 264, y: 915 },
]
const idleLimit = 100
let idleCount = 0
const blackCount = 3
let blackt = 0
let blackb = 0
let blacky = 0

const loop = async () => {
  while (true) {
    for (const img of imgs) {
      await sleep(0.1);
      if (++idleCount >= idleLimit) {
        idleCount = 0
        if(!isDebug) {
          for (let i of idle) {
            await click(i.x, i.y)
            await sleep(1)
          }
        }
      }
      const has = await hasImg(img);
      if (has) {
        console.log(green, `found ${img.win} ${img.name}`)
        if ((img.name == 'sup open t' || img.name == 'sup t' || img.name == 'sup spend t') && supt >= supOpent) {
          console.log(red, `sup open t (${supt}/${supOpent}) reached`)
        } else if (img.name == 'sup leave t' && supt < supOpent) {
          console.log(red, `sup open t (${supt}/${supOpent}) not reached`)
        } else if ((img.name == 'sup open b' || img.name == 'sup b' || img.name == 'sup spend b') && supb >= supOpenb) {
          console.log(red, `sup open b (${supb}/${supOpenb}) reached`)
        } else if (img.name == 'sup leave b' && supb < supOpenb) {
          console.log(red, `sup open b (${supb}/${supOpenb}) not reached`)
        } else if ((img.name == 'sup open y' || img.name == 'sup y' || img.name == 'sup spend y') && supy >= supOpeny) {
          console.log(red, `sup open y (${supy}/${supOpeny}) reached`)
        } else if (img.name == 'sup leave y' && supy < supOpeny) {
          console.log(red, `sup open y (${supy}/${supOpeny}) not reached`)
        } else if (img.name == 'vic t') {
          console.log(yellow, `vic t = ${++vict}`)
        } else if (img.name == 'vic b') {
          console.log(yellow, `vic b = ${++vicb}`)
        } else if (img.name == 'vic y') {
          console.log(yellow, `vic y = ${++vicy}`)
        } else if (img.name == 'fight t' && vict > noFightt) {
          console.log(red, `top ${noFightt} reached`)
        } else if (img.name == 'fight b' && vicb > noFightb) {
          console.log(red, `bottom ${noFightb} reached`)
        } else if (img.name == 'fight y' && vicy > noFighty) {
          console.log(red, `y ${noFighty} reached`)
        } else if (img.name == 'black t' && blackt < blackCount) {
          console.log(red, `top black ${++blackt}`)
        } else if (img.name == 'black b' && blackb < blackCount) {
          console.log(red, `bottom black ${++blackb}`)
        } else if (img.name == 'black y' && blacky < blackCount) {
          console.log(red, `y black ${++blacky}`)
        } else {
          const c = img.click || { x: img.x + 5, y: img.y + 5 }
          !isDebug && await click(c.x, c.y)
          console.log(blue, `clicked ${c.x}, ${c.y}`)
          if (img.name == 'sup spend t') supt++
          if (img.name == 'sup spend b') supb++
          if (img.name == 'sup spend y') supy++
          if (img.name == 'black t') { blackt = 0 }
          if (img.name == 'black b') { blackb = 0 }
          if (img.name == 'black y') { blacky = 0 }
          !isDebug && await sleep(3);
        }
      }
    }
    if (isDebug) break
  }
}

isPos ? console.log(robot.getMousePos()) : loop()
