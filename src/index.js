/** Options de génération de graphe aléatoire. */
const options = {
  /** Nombre de sommets. */
  nbSommets: 100,
  /** Probabilité de génération d'une arête (entre 0 et 100). */
  probabilite: 5,
};

/**
 * Initialiser les options de génération de graphe aléatoire.
 */
function setupOptions() {
  // Récupération des options.
  nbSommets = +localStorage.getItem("nbSommets") ?? 5;
  document.getElementById("input-nodes").value = nbSommets;

  probabilite = +localStorage.getItem("probabilite") ?? 100;
  document.getElementById("input-probability").value = probabilite;
}

/* -------------------------------------------------------------------------- */
/*                                   Events                                   */
/* -------------------------------------------------------------------------- */

window.onload = () => {
  setupOptions();
  setupRenderers();
  genererGraphe(options.nbSommets, options.probabilite);
};

document.addEventListener("graph-load", (e) => {
  console.log("-----------------------------------");

  const graphe = e.detail;

  console.log("Graphe :", graphe);
  console.log("Cacul de la dégénérescence...");

  const centres = degenererGraphe(graphe);

  console.log("Centres :", centres);

  afficherGraphe(graphe);
  afficherNumerosCentre(centres);
});

/* --------------------------------- Inputs --------------------------------- */

document.getElementById("input-nodes").addEventListener("change", (e) => {
  options.nbSommets = e.target.value > 1000 ? 1000 : +e.target.value;
  localStorage.setItem("nbSommets", options.nbSommets);

  genererGraphe(options.nbSommets, options.probabilite);
});

document.getElementById("input-probability").addEventListener("change", (e) => {
  options.probabilite = +e.target.value;
  localStorage.setItem("probabilite", options.probabilite);

  genererGraphe(options.nbSommets, options.probabilite);
});

/* --------------------------------- Boutons -------------------------------- */

document.getElementById("input-import").addEventListener("change", () => importerFichier());

document.getElementById("button-random").addEventListener("click", () => genererGraphe(options.nbSommets, options.probabilite));

document.getElementById("button-export").addEventListener("click", () => exportPDF());
