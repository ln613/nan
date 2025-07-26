const fs = require('fs');
const express = require('express');
const exec = require('mz/child_process').exec;

const router = express.Router();

const DIRS = ["F:/t","I:/t","K:/t"]
const dirs = DIRS.map(d => fs.readdirSync(d).map(f => `${d}/${f}`)).flat()
let file

const getModelDir = code => dirs.find(d => d.split(' - ')[0].endsWith(`/${code}`))

router.get('/play/:code/:pid', (req, res) => {
  const { code, pid } = req.params;
  const dir = getModelDir(code)

  if (dir) {
    const fns = fs.readdirSync(dir)
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

router.get('/files/:code', (req, res) => {
  const { code } = req.params;
  const dir = getModelDir(code)
  return res.json(dir ? fs.readdirSync(dir) : [])
});

module.exports = router;