// Usage : node scripts/generate-password-hash.js VotreMotDePasse
// Affiche le hash bcrypt a coller dans le script SQL de seed (colonne mot_de_passe).
const bcrypt = require('bcrypt');

const motDePasse = process.argv[2];

if (!motDePasse) {
  console.error('Usage: node scripts/generate-password-hash.js <mot_de_passe>');
  process.exit(1);
}

bcrypt.hash(motDePasse, 10).then((hash) => {
  console.log(hash);
});
