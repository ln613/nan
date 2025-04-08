const fs = require('fs');
const express = require('express');
const exec = require('mz/child_process').exec;

const router = express.Router();

const dirs = ["F:/t","I:/t","K:/t"]
let file

router.get('/play/:code/:pid', (req, res) => {
  const { code, pid } = req.params;
console.log(code)
console.log(pid)
  const dir = dirs.map(d => fs.readdirSync(d).map(f => `${d}/${f}`)).flat().find(d => d.split(' - ')[0].endsWith(`/${code}`))
console.log(dir)
  if (dir) {
    const fns = fs.readdirSync(dir)
    console.log(fns.length)
    let fn = fns.find(f => f.toLowerCase().startsWith(pid.toLowerCase()))
    console.log(fn)
    if (fn) {
      fn = `${dir}/${fn}`
      exec('"' + fn + '"');
      file = fn;
      setTimeout(() => file = null, 1000);
    }
  }
  res.end();
});

module.exports = router;