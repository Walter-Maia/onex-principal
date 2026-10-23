// Cena do backup em quadros: cópias chegando, arquivo apagado, restauração e quadro final
'use strict';
const path = require('path');
const BASE = 'file:///' + path.resolve(__dirname, '..', 'index.html').replace(/\\/g, '/').replace(/ /g, '%20');
const OUT = path.resolve(__dirname, 'capturas', 'backup');
module.exports = async function (api) {
  await api.viewport(1440, 900);
  await api.go(BASE + '?intro=0');
  await api.wait(1000);
  await api.eval('document.querySelector(".explorador").scrollIntoView({behavior:"instant",block:"start"}); window.scrollBy({top:-90,behavior:"instant"})');
  await api.wait(500);
  await api.eval('document.getElementById("aba-backup").click()');
  let t = 0;
  for (const alvo of [1300, 2250, 2700, 3800]) {
    await api.wait(alvo - t); t = alvo;
    await api.shot(path.join(OUT, 'backup-' + alvo + '.png'));
  }
};
