function _load() {
  let el = (id) => document.getElementById(id);
  let rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let checkItem = (arr, it) => arr.indexOf(it) > -1;
  let getObj = (arr, prop, it) => arr[arr.findIndex((a) => a[prop] === it)];
  let getObjs = (arr, prop, it) => arr.filter((a) => a[prop] === it);
  let lvl = [1, 1, 1];
  let score = 0;
  let rekord = [0, 0, 0];
  if (localStorage.getItem("records")) {
    let records = localStorage.getItem("records").split(",");
    for (let i = 0; i < records.length; i++) {
      rekord[i] = parseInt(records[i]);
    }
  }
  if (localStorage.getItem("levels")) {
    let szintek = localStorage.getItem("levels").split(",");
    for (let i = 0; i < szintek.length; i++) {
      lvl[i] = parseInt(szintek[i]);
    }
  }
  let music = el("music");
  let sound = el("sound");
  let timo;
  music.volume = 0.3;
  sound.volume = 0.5;
  let musicOn = true;
  let soundOn = true;

  function message(txt) {
    happen.classList.remove("nosee");
    happen.classList.add("see");
    let msgStr = `
      <div id="mescard">
        <p>${txt}</p>
        <div id="mesBtns">
          <button class="mesBtn" id="back">OK</button>
        </div>
      </div>`;
    happen.innerHTML = msgStr;
    el("back").addEventListener("click", () => {
      happen.classList.remove("see");
      happen.classList.add("nosee");
    });
  }

  function restart() {
    el("happen").innerHTML = "";
    el("header").innerHTML = "";
    el("main").innerHTML = "";
    el("opening").innerHTML = `<h1>ZSUGAME</h1>>
    <h2>Mivel akarsz játszani?</h2>
    <div id="tBtns">
      <button class="tBtn" id="mineStart">Zsuzsikereső</button>
      <button class="tBtn" id="memStart">Zsuzsimemo</button>
      <button class="tBtn" id="matchStart">Zsuzsimatch</button>
    </div>`;
    music.src = "./audio/love.mp3";
    music.play();
    el("mineStart").addEventListener("click", mineAct);
    el("memStart").addEventListener("click", () => {
      message("Hamarosan...");
    });
    el("matchStart").addEventListener("click", () => {
      message("Hamarosan...");
    });
  }

  function mineAct() {
    document.body.requestFullscreen();
    el("opening").innerHTML = "";
    music.src = "./audio/music1.mp3";
    music.play();
    let level = lvl[0];
    let steps = 0;
    let zs = 1 + Math.floor(Math.random() * 8);
    let s = 2 + level * 2; //4, 6, 8 => 16, 36, 64
    let room = {
      kincs: Math.pow(level, 2) + level * 2, //3, 8, 15
      akna: level * 3, //3, 6, 9 => 6/16, 14/36, 24/64
    }
    var field = [];
    for (let x = 0; x < s; x++) {
      field.push([]);
      for (let y = 0; y < s; y++) {
        field[x].push([false, 0]);
      }
    }
    let numera = 0;
    do {
      let x = parseInt(Math.random() * s);
      let y = parseInt(Math.random() * s);
      if (field[x][y][1] === 0) {
        field[x][y][1] = 1;
        numera++;
      }
    } while (numera < room.kincs);
    numera = 0;
    do {
      let x = parseInt(Math.random() * s);
      let y = parseInt(Math.random() * s);
      if (field[x][y][1] === 0) {
        field[x][y][1] = 2;
        numera++;
      }
    } while (numera < room.akna);
    //let pic = ["gyep.jpg", "pearl.png", "akna.png"]; pic[field[col][row][1]]
    let kincsHit = 0;
    let aknaHit = 0;
    let firstEnd = true;

    function updateMScore() {
      el("subHeader").innerHTML = `
          <span class="score">Zsuzsi: <span class="lime">${kincsHit}</span>/${room.kincs}</span> 
          <span class="score">Akna: <span class="lime">${aknaHit}</span>/${room.akna}</span>
          <span class="score">Pont: <span id="ms" class="red">${score}</span></span> 
        `;
      let finish = false;

      if (firstEnd) {
        if (kincsHit == room.kincs) {
          finish = true;
          let bonus = 10 + (s * s - steps - aknaHit * 3) * level;
          if (bonus < level * 5) bonus = level * 5;
          score += bonus;
          el("ms").innerHTML = score;
          message(`<p>Gratulálok! Sikerült megtalálnod a ${room.kincs} kincset ${steps} lépésből, és elkerülni ${room.akna - aknaHit} aknát!</p><p>A pontszámod: ${score} (bónusz: ${bonus})</p>`);
        }
        //TODO:checkrecord
        if (finish) {
          firstEnd = false;
          document.querySelectorAll(".minefield").forEach((i) => i.removeEventListener("click", pressMine));
          setTimeout(() => {
            //TODO:finishedMine();
          }, 4500);
        }
      }
    }
    el("header").innerHTML = `
      <h2>ZSUZSIKERESŐ</h2>
    `;
    el("main").innerHTML = `
        <div id="subHeader">
        </div>
        <table id="garden"></table>
      `;
    let gardenStr = "<tr>";
    for (let row = 0; row < s; row++) {
      for (let col = 0; col < s; col++) {
        gardenStr += `
              <td class="minefieldCard" id="mfc_${col}-${row}"}> 
                <img
                  class="minefield"
                  id="mf_${col}-${row}"
                  src="./img/gyep.jpg"
                />
              </td>
            `;
      }
      gardenStr += "</tr>";
    }
    el("garden").innerHTML = gardenStr;
    document.querySelectorAll(".minefield").forEach((i) => i.addEventListener("click", pressMine));
    updateMScore();
    //CONT.
    //TODO: ezt majd a globalban


    function pressMine(e) {
      let ms = e.target.id.split("_")[1];
      console.log('ms: ', ms);
      let mineX = Number(ms.split("-")[0]);
      let mineY = Number(ms.split("-")[1]);
      if (field[mineX][mineY][0] === true) return;
      let nearAkna = 0;
      let nearKincs = 0;
      field[mineX][mineY][0] = true;
      switch (field[mineX][mineY][1]) {
        case 0:
          sound.src = "./audio/dig.mp3";
          sound.play();
          let startX = mineX > 0 ? -1 : 0;
          let startY = mineY > 0 ? -1 : 0;
          let endX = mineX < s - 1 ? 2 : 1;
          let endY = mineY < s - 1 ? 2 : 1;
          for (let surX = startX; surX < endX; surX++) {
            for (let surY = startY; surY < endY; surY++) {
              if (surX === 0 && surY === 0) {
                continue;
              }
              let xx = mineX + surX;
              let yy = mineY + surY;
              if (field[xx][yy][1] === 1) {
                nearKincs++;
              }
              if (field[xx][yy][1] === 2) {
                nearAkna++;
              }
            }
          }
          el("mfc_" + mineX + "-" + mineY).innerHTML = `
                <span class="near">
                  <span class="kincsHits">${nearKincs}</span>
                  <span> / </span>
                  <span class="aknaHits">${nearAkna}</span>
                </span>
              `;
          break;

        case 1:
          sound.src = "./audio/pearl.mp3";
          sound.play();
          kincsHit++;
          el("mf_" + mineX + "-" + mineY).src = "./img/zs" + zs + ".jpg";
          score += level;
          updateMScore();
          break;

        case 2:
          sound.src = "./audio/bomb.mp3";
          sound.play();
          aknaHit++;
          el("mf_" + mineX + "-" + mineY).src = "./img/akna.png";
          score -= level * 2;
          updateMScore();
          break;

        default:
          break;
      }
      steps++;
      updateMScore();
    }
  }

  //START
  restart();
}

window.addEventListener("load", _load);