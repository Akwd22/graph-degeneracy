/**
 * Dégénérer un graphe.
 * @param {object} graphe Graphe à dégénérer.
 * @returns Tableau de couples (numéro de sommet, numéro de centre).
 */
function degenererGraphe(graphe) {
  const nbSommets = getObjectLength(graphe);
  graphe = JSON.parse(JSON.stringify(graphe)); // Dupliquer le graphe.

  const degenerer = {};
  let k = 1;
  let nbSommetsRestant = nbSommets;

  // Initialisation du tableau de dégénérescence.
  for (const numSommet in graphe) {
    degenerer[numSommet] = [+numSommet];
  }

  while (nbSommetsRestant > 0) {
    let trouver = false;

    for (const numSommet in graphe) {
      const voisins = graphe[numSommet];

      if (voisins && voisins.length <= k) {
        degenerer[numSommet].push(k); // Affecter le numéro de centre au sommet.

        // Supprimer le sommet de tous les voisins.
        voisins.forEach((voisin) => {
          graphe[voisin].splice(graphe[voisin].indexOf(+numSommet), 1);
        });

        graphe[numSommet] = null; // Marquer le sommet comme traité.
        nbSommetsRestant--;
        trouver = true;

        break;
      }
    }

    // Si aucun sommet n'a été supprimé dans cette itération, alors on passe au centre suivant.
    if (!trouver) {
      k++;
    }

    console.log("K :", k);
  }

  return degenerer;
}

/**
 * Générer un graphe aléatoirement.
 * @param {number} nbSommets Nombre de sommets.
 * @param {number} probabilite Probabilité d'un arêtes (entre 0 et 100).
 * @fires Document#graph-load
 */
function genererGraphe(nbSommets, probabilite) {
  const graphe = [];

  for (let i = 0; i < nbSommets; i++) {
    graphe[i] = [];
  }

  for (let i = 0; i < nbSommets; i++) {
    for (let j = 0; j < nbSommets; j++) {
      const num = Math.random() * 101;

      if (num < probabilite && j != i && graphe[i].indexOf(j) === -1) {
        graphe[i].push(j);
        graphe[j].push(i);
      }
    }
  }

  const event = new CustomEvent("graph-load", { detail: graphe });
  document.dispatchEvent(event);
}
