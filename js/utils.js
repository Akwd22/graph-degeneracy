/**
 * Retourner la longueur d'un objet.
 * @param {object} object Objet concerné.
 * @returns Nombre de propriétés dans l'objet.
 */
function getObjectLength(object) {
  return Object.keys(object).length;
}

/**
 * Générer un entier entre `min` (inclus) et `max` (inclus).
 * @param {number} min Borne minimum.
 * @param {number} max Borne maximale.
 * @returns Entier généré aléatoirement.
 */
function randInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
