function _load() {
  let el = (id) => document.getElementById(id);
  let rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  let kever = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };
  let inic = (txt) => txt.charAt(0).toUpperCase() + txt.slice(1);

  let checkItemDeep = (arr, prop, it) => arr.findIndex((a) => a[prop] === it) > -1;

  let checkItem = (arr, it) => arr.indexOf(it) > -1;
  let getObj = (arr, prop, it) => arr[arr.findIndex((a) => a[prop] === it)];
  let getObjs = (arr, prop, it) => arr.filter((a) => a[prop] === it);

  let lvl = [1, 1, 1];
  let nextl = [
    [20, 40, 55],
    [6, 18, 50],
  ];
  const nlname = ["kezdő", "haladó", "mester", "Kimaxolva!"];
  const gname = ["Zsuzsikereső", "Zsuzsimemo", "Zsuzsikvíz"]
  const startid = ["mineStart", "memStart", "quizStart"]
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
  let musicOn = false;
  let soundOn = true;

  function voice(src) {
    if (soundOn) {
      sound.src = "./audio/" + src + ".mp3";
      sound.play();
    }
  }

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
      restart();
    });
  }

  function restart() {
    score = 0;
    let konec = false;
    el("happen").innerHTML = "";
    el("header").innerHTML = "";
    el("main").innerHTML = "";
    let btStr = `<h1>ZSUGAME</h1>
      <h2>Mivel akarsz játszani?</h2>
      <div id="tBtns">`
    for (let g = 0; g < gname.length; g++) {
      if (lvl[g] > 3) {
        btStr += `
          <button class="tBtn" id=${startid[g]} disabled>${gname[g]}<br>(${nlname[lvl[g] - 1]})</button>
        `
      } else {
        btStr += `
          <button class="tBtn" id=${startid[g]}>${gname[g]}<br>(${nlname[lvl[g] - 1]})</button>
        `
      }
    }
    if (checkEnd().charAt(0) == "E") {
      btStr += `
          <button class="tBtn" id="finale">Kérem a Jutalmat!</button>
        `;
      konec = true;
    }
    btStr += "</div>";
    el("opening").innerHTML = btStr;
    music.src = "./audio/love.mp3";
    if (musicOn) music.play();
    el("mineStart").addEventListener("click", mineAct);
    el("memStart").addEventListener("click", memAct);
    el("quizStart").addEventListener("click", quizAct);
    if (konec) el("finale").addEventListener("click", finalAct);
  }

  function finalAct() {
    message("Hamarosan...");
    //TODO: finale
  }

  function xtrascore(score, game) {
    let rt = "";
    if (score > rekord[game]) {
      rekord[game] = score;
      localStorage.setItem("records", rekord.join());
      rt += `<p>Új rekord, gratula!!!</p>`;
    }
    nl = nextl[game][lvl[game] - 1];
    if (score < nl) {
      let nl = nextl[game][lvl[game] - 1];
      rt += `<p>A következő (${nlname[lvl[game]]}) szintre ${nl} ponttal juthatsz el.</p>`;
    } else {
      lvl[game]++;
      if (lvl[game] == 4) {
        rt += "<p>Ezzel kimaxoltad a " + gname[game] + "t! " + checkEnd() + "</p>";
      } else {
        rt += `<p>Ezzel elérted a következő (${nlname[lvl[game] - 1]}) szintet!</p>`;
      }

      localStorage.setItem("levels", lvl.join());
    }
    return rt;
  }

  function checkEnd() {
    let ende = true;
    for (l of lvl) {
      if (l < 4) ende = false;
    }
    let eStr = ende ? "Ezzel pedig teljesítettél minden pályát mester szinten, így jogosult lettél az Évfordulós Jutalomra!" : "Maxolj ki minden maradék játékot az Évfordulós Jutalomért!";
    return eStr;
  }

  //TODO: navbar minden Act-ba
  //TODO: háttérszínek

  function mineAct() {
    document.body.requestFullscreen();
    el("opening").innerHTML = "";
    music.src = "./audio/music1.mp3";
    if (musicOn) music.play();
    let level = lvl[0];
    let steps = 0;
    let zs = 1 + Math.floor(Math.random() * 8);
    let s = 2 + level * 2; //4, 6, 8 => 16, 36, 64
    let room = {
      kincs: Math.pow(level, 2) + level * 2, //3, 8, 15
      akna: level * 3, //3, 6, 9 => 6/16, 14/36, 24/64
    };
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
    let kincsHit = 0;
    let aknaHit = 0;
    let firstEnd = true;

    function updateMScore() {
      el("subHeader").innerHTML = `
          <span class="score">Zsuzsi: <span class="lime">${kincsHit}</span>/${room.kincs}</span> 
          <span class="score">Akna: <span class="lime">${aknaHit}</span>/${room.akna}</span>
          <span class="score">Pont: <span id="ms" class="red">${score}</span></span> 
        `;

      if (kincsHit == room.kincs) {
        voice("happy1");
        let bonus = 10 + (s * s - steps - aknaHit * 3) * level;
        if (bonus < level * 5) bonus = level * 5;
        score += bonus;
        el("ms").innerHTML = score;
        let mes = `<p>Gratulálok! Sikerült megtalálnod a ${room.kincs} Zsuzsit ${steps} lépésből, és elkerülni ${room.akna - aknaHit} aknát!</p><p>A pontszámod: ${score} (bónusz: ${bonus}).</p>`;

        mes += xtrascore(score, 0);

        message(mes);

        document
          .querySelectorAll(".minefield")
          .forEach((i) => i.removeEventListener("click", pressMine));
      }
    }

    el("header").innerHTML = `
      <h2>ZSUZSIKERESŐ</h2>
      <h3>Szint: ${nlname[level - 1]}</h3>
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
    document
      .querySelectorAll(".minefield")
      .forEach((i) => i.addEventListener("click", pressMine));
    updateMScore();

    function pressMine(e) {
      let ms = e.target.id.split("_")[1];
      console.log("ms: ", ms);
      let mineX = Number(ms.split("-")[0]);
      let mineY = Number(ms.split("-")[1]);
      if (field[mineX][mineY][0] === true) return;
      let nearAkna = 0;
      let nearKincs = 0;
      field[mineX][mineY][0] = true;
      switch (field[mineX][mineY][1]) {
        case 0:
          voice("dig");
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
          voice("pearl");
          kincsHit++;
          el("mf_" + mineX + "-" + mineY).src = "./img/zs" + zs + ".jpg";
          score += level;
          updateMScore();
          break;

        case 2:
          voice("bomb");
          aknaHit++;
          el("mf_" + mineX + "-" + mineY).src = "./img/akna.png";
          score -= level;
          updateMScore();
          break;

        default:
          break;
      }
      steps++;
      updateMScore();
    }
  }

  function memAct() {
    document.body.requestFullscreen();
    el("opening").innerHTML = "";
    music.src = "./audio/music2.mp3";
    if (musicOn) music.play();
    let level = lvl[1];
    let score = 0;
    let steps = 0;
    let err = 0;
    let s = level + 1;
    let marr = [];
    let pairs = Math.pow(2, level);
    let kincsHit = 0;
    for (let i = 0; i < pairs; i++) {
      marr.push(i);
      marr.push(i);
    }
    if (level == 2) marr.push(-1);
    let narr = kever(marr);
    var field = [];
    let num = 0;
    let sels = [];
    for (let x = 0; x < s; x++) {
      field.push([]);
      for (let y = 0; y < s; y++) {
        field[x].push([false, narr[num] + 1]);
        num++;
      }
    }
    console.log("field: ", field);
    el("header").innerHTML = `
      <h2>ZSUZSIMEMO</h2>
      <h3>Szint: ${nlname[level - 1]}</h3>
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

    function updateEScore() {
      el("subHeader").innerHTML = `
          <span class="score">Találat: <span class="lime">${kincsHit}</span>/${pairs}</span> 
          <span class="score">Pont: <span id="ms" class="red">${score}</span></span> 
        `;

      if (kincsHit == pairs) {
        voice("happy2");
        let bonus = (pairs * 3 - steps) * level;
        if (bonus < level * 2) bonus = level * 2;
        score += bonus;
        el("ms").innerHTML = score;
        let mes = `<p>Gratulálok! Sikerült megtalálnod az összes ${pairs} Zsuzsi-párt ${steps} lépésből.</p><p>A pontszámod: ${score} (bónusz: ${bonus}).</p>`;

        mes += xtrascore(score, 1);

        message(mes);

        document
          .querySelectorAll(".minefield")
          .forEach((i) => i.removeEventListener("click", pressMem));
      }
    }

    function pressMem(e) {
      let hit = false;
      let ms = e.target.id.split("_")[1];
      let mineX = Number(ms.split("-")[0]);
      let mineY = Number(ms.split("-")[1]);
      let fm = field[mineX][mineY];
      if (fm[0] === true) return;
      if (sels.length > 0) {
        if (sels[0].x === mineX && sels[0].y === mineY) return;
        if (fm[1] === sels[0].val) {
          voice('pearl');
          kincsHit++;
          hit = true;
        }
      }
      sels.push({
        x: mineX,
        y: mineY,
        val: fm[1],
      });
      let saci = fm[1] > 0 ? "zs" + fm[1] + ".jpg" : "akna.png";
      el("mf_" + mineX + "-" + mineY).src = "./img/" + saci;
      if (fm[1] == 0) {
        err++;
        score -= err;
        voice("bomb");
        updateEScore();
      }
      if (sels.length == 2) {
        if (hit) {
          score += level;
        }
        steps++;
        updateEScore();
        document
          .querySelectorAll(".minefield")
          .forEach((i) => i.removeEventListener("click", pressMem));
        timo = setTimeout(() => {
          let is = hit ? "pipa" : "gyep";
          for (s of sels) {
            el("mf_" + s.x + "-" + s.y).src = "./img/" + is + ".jpg";
            if (hit) field[s.x][s.y][0] = true;
          };
          document
            .querySelectorAll(".minefield")
            .forEach((i) => i.addEventListener("click", pressMem));
          sels = [];
        }, 1800)
      }
    }

    document
      .querySelectorAll(".minefield")
      .forEach((i) => i.addEventListener("click", pressMem));
    updateEScore();
  }

  function quizAct() {
    document.body.requestFullscreen();
    el("opening").innerHTML = "";
    music.src = "./audio/music3.mp3";
    if (musicOn) music.play();
    let level = lvl[2];
    let score = 0;
    let goal = 4 + level;

    function genQ() {
      let qs = [];
      let q = false;
      for (let l = level; l > 0; l--) {
        for (q of quiz) {
          if (q.lvl == l && q.win === false) {
            qs.push(q);
          }
        }
        if (qs.length > 0) {
          q = rnd(qs);
          return q;
        } else {
          q = false;
        }
      }
      return q;
    }

    let question = genQ();
    if (question === false) question = rnd(quiz);
    let [qq, aa] = [question.q, question.a];
    el("header").innerHTML = `
      <h2>ZSUZSIKVÍZ</h2>
      <h3>Szint: ${nlname[level - 1]}</h3>
    `;

    function pressQuiz(e) {
      let answer = e.target.id;
      console.log('answer: ', answer);
      if (answer == aa[0]) {
        voice("right");
        score++;
        let qqq = getObj(quiz, "q", qq);
        qqq.win = true;
        if (score < goal) {
          question = genQ();
          if (question === false) question = rnd(quiz);
          qq = question.q;
          aa = question.a;
          displayQA();
        } else {
          voice("happy3");
          let mes = `<p>Gratulálok! Sikerült minden kérdést helyesen megválaszolnod!</p>`
          lvl[2]++;
          if (lvl[2] == 4) {
            mes += "<p>Ezzel kimaxoltad Zsuzsikvízt! " + checkEnd() + "</p>";
          } else {
            mes += `<p>Ezzel továbbjutottál következő (${nlname[lvl[2] - 1]}) szintre!</p>`;
          }

          localStorage.setItem("levels", lvl.join());

          message(mes);

          document
            .querySelectorAll(".aBtn")
            .forEach((i) => i.removeEventListener("click", pressQuiz));
        }
      } else {
        let wr = Math.floor(Math.random() * 6);
        voice("wrong" + wr);
        let wts = ["Mégis hogy gondoltad ezt?!", "Ezt vesd jobban górcső alá!", "Hát... ennél azért jobbra számítottam!", "Ezen gondolkozz még egy kicsit...", "Hát ez kész! Komolyan...", "Bzzz, falsch!"];
        let wt = wts[wr];
        document
          .querySelectorAll(".aBtn")
          .forEach((i) => i.removeEventListener("click", pressQuiz));
        message(wt);
      }
    }

    function displayQA() {
      let as = [];
      do {
        const can = rnd(aa);
        if (!checkItem(as, can)) as.push(can);
      } while (as.length < 4);
      let bStr = "";
      for (ass of as) {
        bStr += `
        <button class="aBtn", id="${ass}">${ass}</button>
      `;
      }

      el("main").innerHTML = `
      <div id="qq">(${score}/${goal}): ${qq}</div>
      <div id="aBtns">${bStr}</div>
    `;

      document
        .querySelectorAll(".aBtn")
        .forEach((i) => i.addEventListener("click", pressQuiz));
    }

    displayQA();

  }


  //START
  restart();
}

window.addEventListener("load", _load);
