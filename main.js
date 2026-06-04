function _load() {
  let el = (id) => document.getElementById(id);
  let rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let checkItem = (arr, it) => arr.indexOf(it) > -1;
  let getObj = (arr, prop, it) => arr[arr.findIndex((a) => a[prop] === it)];
  let getObjs = (arr, prop, it) => arr.filter((a) => a[prop] === it);

  function mineAct() {
    music.volume = mv > 0.6 ? 0.6 : mv;
    let s = room.size;
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
    let digs = Math.round(char.ero / 2);
    //let pic = ["gyep.jpg", "pearl.png", "akna.png"]; pic[field[col][row][1]]
    let kincsHit = 0;
    let aknaHit = 0;
    let firstEnd = true;

    function updateMScore() {
      document.getElementById("scoresM").innerHTML = `
            <span class="score">Energia: <span class="red">${digs}</span></span> 
            <span class="score">Kincs: <span class="lime">${kincsHit}</span>/${room.kincs}</span> 
            <span class="score">Akna: <span class="lime">${aknaHit}</span>/${room.akna}</span>
          `;
      let finish = false;

      if (firstEnd) {
        if (kincsHit == room.kincs) {
          message("Minden kincset megtaláltál!");
          finish = true;
          let bonus =
            5 +
            Math.round(
              room.size * 2 +
              room.akna * 2.5 -
              room.kincs / 2 +
              Math.random() * 5 +
              (room.size * (room.size - 1) - digs) / 2 +
              kincsHit / 1.5 -
              aknaHit
            );
          changeVal("sup", bonus);
          changeVal("hat", 1);
          changeVal("esz", 1 + Math.floor(bonus / 4));
          changeVal("ugy", Math.floor(bonus / 4));
          char.room = room.pass;
          if (room.help) {
            changeVal("lel", 1 + Math.round(bonus / 3));
          }
        } else if (digs < 1) {
          message("Nem bírod tovább, kidöglöttél!");
          finish = true;
          let bonus = Math.round(
            room.size * 1.5 +
            room.akna * 2 -
            room.kincs -
            Math.random() * 5 +
            Math.random() * 5 -
            (room.kincs - kincsHit) * 2 +
            kincsHit -
            aknaHit
          );
          changeVal("sup", bonus);
          changeVal("hat", -1);
          char.room = room.med;
        }
        if (finish) {
          if (room.help) modi = room.help.split("_")[1];
          if (room.modi) modi = room.modi;
          firstEnd = false;
          document.querySelectorAll(".minefield").forEach((i) => i.removeEventListener("click", pressMine));
          document.getElementById("exitBtn").disabled = true;
          setTimeout(() => {
            newRoom();
          }, 4500);
        }
      }
    }

    function fleeM() {
      if (room.help) modi = room.help.split("_")[1];
      char.room = room.fail;
      newRoom();
    }

    document.getElementById("subMain").innerHTML = `
          <div id="subHeader">
            <span id="scoresM"></span>
            <button id="exitBtn" title="Gyáva!">Feladom!</button> 
          </div>
          <table id="garden"></table>
        `;
    let gardenStr = "<tr>";
    let name = char.name.split(",")[0];
    for (let row = 0; row < s; row++) {
      for (let col = 0; col < s; col++) {
        gardenStr += `
              <td class="minefieldCard" id="mfc-${col}-${row}"}> 
                <img
                    class="minefield"
                    id="mf-${col}-${row}"
                    src="./img/rooms/gyep.jpg"
                    title="Keress csak, ${name}!"
                />
              </td>
            `;
      }
      gardenStr += "</tr>";
    }
    document.getElementById("garden").innerHTML = gardenStr;
    updateMScore();
    document.querySelectorAll(".minefield").forEach((i) => i.addEventListener("click", pressMine));
    document.getElementById("exitBtn").addEventListener("click", fleeM);

    function pressMine(e) {
      let mineX = Number(e.target.id.split("-")[1]);
      let mineY = Number(e.target.id.split("-")[2]);
      if (field[mineX][mineY][0] === true || char.ero < 1) return;
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
          document.getElementById("mfc-" + mineX + "-" + mineY).innerHTML = `
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
          document.getElementById("mf-" + mineX + "-" + mineY).src = "./img/rooms/" + room.treasure;
          document.getElementById("mf-" + mineX + "-" + mineY).title = "Drágaságom!";
          updateMScore();
          break;

        case 2:
          sound.src = "./audio/bomb.mp3";
          sound.play();
          aknaHit++;
          document.getElementById("mf-" + mineX + "-" + mineY).src = "./img/rooms/akna.png";
          document.getElementById("mf-" + mineX + "-" + mineY).title = "Ez jó nagyot szólt!";
          let loser = Math.floor(21 + Math.random() * (20 - char.ugy / 5) - char.ugy / 5);
          changeVal("ero", -loser);
          updateMScore();
          break;

        default:
          break;
      }
      digs--;
      updateMScore();
    }
  }

  function clickAct(e) {
    let teljesszó = e.target.id.split("_");
    let bType = teljesszó[0];
    let bId = "";
    if (teljesszó.length > 1) bId = teljesszó[1];
    console.log('teljesszó: ', teljesszó);

  }

  //START
  document.addEventListener("click", clickAct);
  //document.body.requestFullscreen();
}

window.addEventListener("load", _load);