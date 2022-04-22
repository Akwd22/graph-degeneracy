const renderers = {
  rendererGraph: null,
  rendererCores: null,
};

/**
 * Initialiser les canvas d'affichage.
 */
function setupRenderers() {
  renderers.rendererGraph = new Sigma(new graphology.Graph(), document.getElementById("sigma-graph"));
  renderers.rendererCores = new Sigma(new graphology.Graph(), document.getElementById("sigma-cores"));
}

/**
 * Afficher un graphe.
 * @param {object} graphe Graphe à afficher.
 */
function afficherGraphe(graphe) {
  const graph = renderers.rendererGraph.graph;

  graph.clear();

  // Afficher les sommets.
  for (const sommet in graphe) {
    const x = Math.floor(Math.random() * 10000 + 1);
    const y = Math.floor(Math.random() * 10000 + 1);
    graph.addNode(sommet, {
      x: x,
      y: y,
      size: 8,
      label: `S${sommet}`,
      color: "#FF6E0F",
    });
  }

  // Afficher les arêtes.
  for (const sommet in graphe) {
    if (!graphe[sommet]) continue;

    for (let voisin of graphe[sommet]) {
      graph.addEdge(sommet, voisin, { size: 2, color: "#25A1A8" });
    }
  }
}

/**
 * Afficher le dessin des numéros de centre.
 * @param {Array} centres Numéros de centre.
 */
function afficherNumerosCentre(centres) {
  // Transformer structure de données `centres`.
  const newCentres = [];

  for (const arr of Object.values(centres)) {
    const sommet = arr[0];
    const centre = arr[1] - 1;

    if (!newCentres[centre]) newCentres[centre] = [];

    newCentres[centre].push(sommet);
  }

  centres = newCentres;

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

  // Afficher la dégénérescence.
  document.getElementById("label-result").innerText = centres.length;
}

/**
 * Exporter le dessin des numéros de centre en PDF.
 */
function exportPDF() {
  const jpeg = new Image();

  jpeg.onload = () => {
    const pdf = new jspdf.jsPDF({ orientation: "landscape", unit: "px", format: [jpeg.height / 2, jpeg.width / 2] });

    pdf.addImage(jpeg, "JPEG", 0, 0, jpeg.height / 2, jpeg.width / 2);
    pdf.save("joli_dessin.pdf");
  };

  const url = sigmaScreenshot(renderers.rendererCores, 768, 768);
  jpeg.src = url;
}
