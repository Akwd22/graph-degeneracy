let n = 2;
let probabilite = 100;

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
      size: 10,
      label: `S${i}`,
      color: "cyan",
    });
  }

  // Afficher les arêtes.
  for (let i = 0; i < nbSommets; i++) {
    if (!graphe[i]) continue;

    for (let j of graphe[i]) {
      graph.addEdge(i, j);
    }
  }

  const container = document.getElementById("sigma");
  container.innerHTML = ""; // Vider le conteneur.

  const renderer = new Sigma(graph, container);
}

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

const importerFichier = (event) => {
  const fichier = event.target.files[0];
  if (!fichier) return;

  const reader = new FileReader();

  reader.onload = (event) => {
    const content = event.target.result;
    parseFichier(content);
  };

  reader.readAsText(fichier);
};

const parseFichier = (contenu) => {
  let graphe = [];
  let lines = contenu.split("\n");

  lines.forEach((element) => {
    let colones = element.split(",");

    let source = colones[0] - 1;
    let voisin = colones[1] - 1;

    if (!graphe[source]) graphe[source] = [];
    if (!graphe[voisin]) graphe[voisin] = [];

    if (graphe[source].indexOf(voisin) === -1) {
      graphe[source].push(voisin);
    }

    if (graphe[voisin].indexOf(source) === -1) {
      graphe[voisin].push(source);
    }
  });

  console.log(graphe);

  afficherGraphe(graphe);
};

/* -------------------------------------------------------------------------- */
/*                                   Events                                   */
/* -------------------------------------------------------------------------- */

window.onload = () => {
  setupOptions();
  console.log("-----------------------------------");

  let graphe = genererGraphe(n, probabilite);
  afficherGraphe(graphe);
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

document
  .getElementById("button-refresh")
  .addEventListener("click", window.onload);

document
  .getElementById("input-import")
  .addEventListener("change", importerFichier, false);
