let n = 2;
let probability = 100;

let renderers = {
  rendererGraph: null,
  rendererCores: null,
};

function setupRenderers() {
  renderers.rendererGraph = new Sigma(new graphology.Graph(), document.getElementById("sigma-graph"));
  renderers.rendererCores = new Sigma(new graphology.Graph(), document.getElementById("sigma-cores"));
}

/** Générer un entier entre `min` (inclus) et `max` (inclus). */
function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function afficherGraphe(graphe) {
  const graph = renderers.rendererGraph.graph;
  const nbSommets = graphe.length;

  graph.clear();

  // Afficher les sommets.
  for (let i = 0; i < nbSommets; i++) {
    const x = Math.floor(Math.random() * 10000 + 1);
    const y = Math.floor(Math.random() * 10000 + 1);
    graph.addNode(i, {
      x: x,
      y: y,
      size: 8,
      label: `S${i}`,
      color: "#FF6E0F",
    });
  }

  // Afficher les arêtes.
  for (let i = 0; i < nbSommets; i++) {
    if (!graphe[i]) continue;

    for (let j of graphe[i]) {
      graph.addEdge(i, j, { size: 2, color: "#25A1A8" });
    }
  }
}

function afficherJoliDessin(centres) {
  // centres = [[9], [1, 6, 7, 8], [0, 2, 3, 4, 5]];
  // const sommets_de_centre_X = centres[numero_centre_X]

  let newCentres = [];

  centres.forEach((arr) => {
    const sommet = arr[0];
    const centre = arr[1] - 1;

    if (!newCentres[centre]) newCentres[centre] = [];

    newCentres[centre].push(sommet);
  });

  centres = newCentres;

  console.log(newCentres);

  const graph = renderers.rendererCores.graph;

  graph.clear();

  let diametre = centres.length;

  // Pour chaque numéro de centre...
  centres.forEach((sommets) => {
    const anglePas = 360 / sommets.length;
    let angle = 0;

    const color = `rgb(${randInt(0, 255)}, ${randInt(0, 255)}, ${randInt(0, 255)})`;

    // ... plaçage des sommets autour d'un cercle.
    sommets.forEach((sommet) => {
      const x = Math.cos((angle / 180) * Math.PI) * (diametre / 2);
      const y = Math.sin((angle / 180) * Math.PI) * (diametre / 2);
      angle = (angle + anglePas) % 360;

      graph.addNode(sommet, {
        x: x,
        y: y,
        size: 5,
        color: color,
      });
    });

    // ... reliage des sommets pour former le périmètre du cercle.
    sommets.forEach((sommet, index) => {
      let voisin;

      if (index === sommets.length - 1) {
        voisin = sommets[0];
      } else {
        voisin = sommets[index + 1];
      }

      graph.addEdge(sommet, voisin, { color: color });
    });

    diametre--;
  });

  document.getElementById("label-result").innerText = centres.length;
}

function screenshotJoliDessin() {
  const jpeg = new Image();

  jpeg.onload = () => {
    const pdf = new jspdf.jsPDF({ orientation: "landscape", unit: "px", format: [jpeg.height, jpeg.width] });

    // const w = pdf.internal.pageSize.getWidth();
    // const h = pdf.internal.pageSize.getHeight();

    pdf.addImage(jpeg, "JPEG", 0, 0);

    pdf.save("joli_dessin.pdf");
  };

  const url = sigmaScreenshot(renderers.rendererCores);
  console.log(url);
  jpeg.src = url;
}

/* -------------------------------------------------------------------------- */
/*                               Générer graphe                               */
/* -------------------------------------------------------------------------- */

const genererGraphe = (nbSommets, probability) => {
  let graphe = [];

  for (let i = 0; i < nbSommets; i++) {
    graphe[i] = [];
  }

  for (let i = 0; i < nbSommets; i++) {
    for (let j = 0; j < nbSommets; j++) {
      let num = Math.random() * 101;

      if (num < probability && j != i && graphe[i].indexOf(j) === -1) {
        graphe[i].push(j);
        graphe[j].push(i);
      }
    }
  }

  return graphe;
};

/* -------------------------------------------------------------------------- */
/*                               Dégénérescence                               */
/* -------------------------------------------------------------------------- */

const degenererGraphe = (g) => {
  let nbSommets = g.length;
  let graphe = JSON.parse(JSON.stringify(g));
  let degenerer = [];
  let k = 1;
  let nbSommetsRestant = nbSommets;

  graphe.forEach((element, index) => {
    degenerer[index] = [index];
  });

  // console.log("Graphe dege : ", JSON.parse(JSON.stringify(graphe)));

  while (nbSommetsRestant > 0) {
    let trouver = false;
    for (const [index, element] of Object.entries(graphe)) {
      // graphe.forEach((element, index) => {
      if (element && element.length <= k) {
        // console.log(JSON.parse(JSON.stringify(element)));
        degenerer[index].push(k);
        element.forEach((voisin) => {
          try {
            graphe[voisin].splice(graphe[voisin].indexOf(+index), 1);
          } catch (e) {}
        });
        graphe[index] = null;
        // console.log(nbSommetsRestant);
        nbSommetsRestant--;
        trouver = true;
        break;
      }
    }

    if (!trouver) {
      k++;
    }

    console.log("K", k);
    // console.log("Graphe : ", JSON.parse(JSON.stringify(graphe)));
  }

  console.log(degenerer);

  return degenerer;
};

/* -------------------------------------------------------------------------- */
/*                           Importation de graphes                           */
/* -------------------------------------------------------------------------- */

const importerFichier = (event) => {
  const fichier = event.target.files[0];
  if (!fichier) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const content = event.target.result;

    if (fichier.type === "text/csv") {
      parseCSV(content);
    } else if (fichier.type === "text/plain") {
      parseTXT(content);
    } else {
      alert("Fichier n'est ni un CSV, ni un TXT.");
    }
  };

  reader.readAsText(fichier);
};

const parseCSV = (contenu) => {
  let graphe = [];
  let lines = contenu.split("\n");

  lines.forEach((element) => {
    let colonnes = element.split(",");

    let source = colonnes[0] - 1;
    let voisin = colonnes[1] - 1;

    if (!graphe[source]) graphe[source] = [];
    if (!graphe[voisin]) graphe[voisin] = [];

    if (graphe[source].indexOf(voisin) === -1) {
      graphe[source].push(voisin);
    }

    if (graphe[voisin].indexOf(source) === -1) {
      graphe[voisin].push(source);
    }
  });

  console.log("Graphe :", graphe);

  afficherGraphe(graphe);
  afficherJoliDessin(degenererGraphe(graphe));
};

const parseTXT = (contenu) => {
  let graphe = [];
  let lines = contenu.split("\n");
  lines.splice(0, 4); // Supprimer les 4 premières lignes de commentaire.

  lines.forEach((element) => {
    let colonnes = element.split("\t");

    let source = colonnes[0] - 1;
    let voisin = colonnes[1] - 1;

    if (!graphe[source]) graphe[source] = [];
    if (!graphe[voisin]) graphe[voisin] = [];

    if (graphe[source].indexOf(voisin) === -1) {
      graphe[source].push(voisin);
    }

    if (graphe[voisin].indexOf(source) === -1) {
      graphe[voisin].push(source);
    }
  });

  console.log("Graphe :", graphe);

  afficherGraphe(graphe);
  afficherJoliDessin(degenererGraphe(graphe));
};

document.getElementById("input-import").addEventListener("change", importerFichier);

/* -------------------------------------------------------------------------- */
/*                                   Events                                   */
/* -------------------------------------------------------------------------- */

window.onload = () => {
  setupOptions();
  setupRenderers();
  grapheAleatoire();
};

function grapheAleatoire() {
  console.log("-----------------------------------");
  
  let graphe = genererGraphe(n, probability);
  afficherGraphe(graphe);
  afficherJoliDessin(degenererGraphe(graphe));
}

function setupOptions() {
  // Récupération des options.
  n = +localStorage.getItem("nbSommets") ?? 5;
  document.getElementById("input-nodes").value = n;

  probability = +localStorage.getItem("probability") ?? 100;
  document.getElementById("input-probability").value = probability;
}

document.getElementById("input-nodes").addEventListener("change", (e) => {
  n = +e.target.value;
  localStorage.setItem("nbSommets", n);

  grapheAleatoire();
});

document.getElementById("input-probability").addEventListener("change", (e) => {
  probability = +e.target.value;
  localStorage.setItem("probability", probability);

  grapheAleatoire();
});

document.getElementById("button-random").addEventListener("click", grapheAleatoire);

document.getElementById("button-export").addEventListener("click", screenshotJoliDessin);
