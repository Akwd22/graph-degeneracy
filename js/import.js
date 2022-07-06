/**
 * Gestionnaire d'importation d'un fichier.
 * @param {Event} event
 */
function importerFichier(event) {
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
}

/**
 * Parser un fichier CSV importé.
 * @param {string} contenu Contenu du fichier.
 * @event Document#graph-load
 */
function parseCSV(contenu) {
  let graphe = {};
  let lines = contenu.split("\n");

  // Retirer les lignes qui ne sont pas un couple (nombre, nombre).
  lines = lines.filter((line) => (line.match(/^\d+,\d+/) ? true : false));

  lines.forEach((line) => {
    let colonnes = line.split(",");

    let source = colonnes[0] - 1;
    let voisin = colonnes[1] - 1;

    if (source === voisin) return; // Dans certains fichiers, des sommets sont voisin avec eux-mêmes.

    if (!graphe[source]) graphe[source] = [];
    if (!graphe[voisin]) graphe[voisin] = [];

    if (graphe[source].indexOf(voisin) === -1) {
      graphe[source].push(voisin);
    }

    if (graphe[voisin].indexOf(source) === -1) {
      graphe[voisin].push(source);
    }
  });

  const event = new CustomEvent("graph-load", { detail: graphe });
  document.dispatchEvent(event);
}

/**
 * Parser un fichier texte importé.
 * @param {string} contenu Contenu du fichier.
 * @fires Document#graph-load
 */
function parseTXT(contenu) {
  let graphe = {};
  let lines = contenu.split("\n");

  // Retirer les lignes qui ne sont pas un couple (nombre, nombre).
  lines = lines.filter((line) => (line.match(/^\d+[\t ]\d+/) ? true : false));

  lines.forEach((line) => {
    let colonnes = line.split(/[\t ]/);

    let source = colonnes[0] - 1;
    let voisin = colonnes[1] - 1;

    if (source === voisin) return; // Dans certains fichiers, des sommets sont voisin avec eux-mêmes.

    if (!graphe[source]) graphe[source] = [];
    if (!graphe[voisin]) graphe[voisin] = [];

    if (graphe[source].indexOf(voisin) === -1) {
      graphe[source].push(voisin);
    }

    if (graphe[voisin].indexOf(source) === -1) {
      graphe[voisin].push(source);
    }
  });

  const event = new CustomEvent("graph-load", { detail: graphe });
  document.dispatchEvent(event);
}
