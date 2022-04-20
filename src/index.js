let n = 2;
let probabilite = 100;

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
      graph.addEdge(i, j, { size: 2, color: "#818181" });
    }
  }

  // Effacer l'ancien graphe s'il y en avait un.
  // if (renderers.rendererGraph) {
  //   renderers.rendererGraph.graph.clear();
  // } else {
  //   renderers.rendererGraph = new Sigma(graph, document.getElementById("sigma-graph"));
  // }
}

function afficherJoliDessin(centres) {
  centres = [[1, 2, 3, 4, 5], [6, 7, 8, 9, 10, 11], [12, 13, 14, 15], [16]];
  // const sommets_de_centre_X = centres[numero_centre_X]

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
        size: 10,
        label: `S${sommet}`,
        color: color,
      });
    });

    // ... reliage des sommets pour former le périmètre du cercle.
    sommets.forEach((sommet) => {
      let voisin;

      if (sommet === sommets[sommets.length - 1]) {
        voisin = sommets[0];
      } else {
        voisin = sommet + 1;
      }

      graph.addEdge(sommet, voisin, { color: color });
    });

    diametre--;
  });

  // Effacer l'ancien graphe s'il y en avait un.
  // if (renderers.rendererCores) {
  //   renderers.rendererCores.graph.clear();
  // }

  // renderers.rendererCores = new Sigma(graph, document.getElementById("sigma-cores"));
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

const genererGraphe = (nbSommets, probabilite) => {
  let graphe = [];

  for (let i = 0; i < nbSommets; i++) {
    graphe[i] = [];
  }

  for (let i = 0; i < nbSommets; i++) {
    for (let j = 0; j < nbSommets; j++) {
      let num = Math.random() * 101;

      if (num < probabilite && j != i && graphe[i].indexOf(j) === -1) {
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
  degenererGraphe(graphe);
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
  degenererGraphe(graphe);
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
  let graphe = genererGraphe(n, probabilite);
  // let graphe = parseTXT(`# Graphe du sujet
  // # Graphe du sujet
  // # Graphe du sujet
  // # Graphe du sujet
  // 1	2
  // 1	3
  // 1	5
  // 1	6
  // 1	4
  // 2	7
  // 2	1
  // 7	5
  // 7	8
  // 7	6
  // 7	2
  // 8	6
  // 8	9
  // 8	7
  // 9	6
  // 9	8
  // 6	10
  // 6	4
  // 6	1
  // 6	5
  // 6	7
  // 6	8
  // 6	9
  // 10	6
  // 4	6
  // 4	3
  // 4	1
  // 3	5
  // 3	1
  // 3	4
  // 5	6
  // 5	3
  // 5	1
  // 5	7`);
  afficherGraphe(graphe);
  
  const centres = degenererGraphe(graphe);
  afficherJoliDessin();
};

function setupOptions() {
  // Récupération des options.
  n = +localStorage.getItem("nbSommets") ?? 5;
  document.getElementById("input-nodes").value = n;

  probabilite = +localStorage.getItem("probability") ?? 100;
  document.getElementById("input-probability").value = probabilite;
}

document.getElementById("input-nodes").addEventListener("change", (e) => {
  n = +e.target.value;
  localStorage.setItem("nbSommets", n);

  grapheAleatoire();
});

document.getElementById("input-probability").addEventListener("change", (e) => {
  const probability = +e.target.value;
  localStorage.setItem("probability", probability);

  grapheAleatoire();
});

document.getElementById("button-random").addEventListener("click", grapheAleatoire);

document.getElementById("button-export").addEventListener("click", screenshotJoliDessin);
