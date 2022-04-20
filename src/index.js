let n = 2;
let probabilite = 100;

/* -------------------------------------------------------------------------- */
/*                               Afficher Graphe                              */
/* -------------------------------------------------------------------------- */

function afficherGraphe(graphe) {
  const graph = new graphology.Graph();
  const nbSommets = graphe.length;

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

  const container = document.getElementById("sigma");
  container.innerHTML = ""; // Vider le conteneur.

  const renderer = new Sigma(graph, container);
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
  degenererGraphe(graphe);
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

  window.onload();
});

document.getElementById("input-probability").addEventListener("change", (e) => {
  const probability = +e.target.value;
  localStorage.setItem("probability", probability);

  window.onload();
});

document.getElementById("button-refresh").addEventListener("click", window.onload);
