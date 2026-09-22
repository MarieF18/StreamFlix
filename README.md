# StreamFlix

## Presentation du projet

StreamFlix est un site web statique de consultation de series TV. Il permet de parcourir un catalogue, rechercher une serie, filtrer par genre, trier les resultats et ouvrir une fiche detaillee. Les etats chargement, succes, vide et erreur sont pris en charge. Les notes sont affichees sous forme d'etoiles avec un equivalent textuel accessible.

Les donnees proviennent de l'API TVmaze. L'interface est realisee en HTML, CSS et JavaScript natif avec des modules ES.

## Prerequis

- Un navigateur recent prenant en charge les modules JavaScript ES (`type="module"`).
- Une connexion Internet pour l'API TVmaze et les images distantes.
- Python 3, ou un autre serveur HTTP statique.

Aucune dependance npm n'est necessaire.

## Procedure de lancement

Depuis le dossier racine :

```powershell
python -m http.server 8000
```

Ouvrir ensuite [http://localhost:8000/index.html](http://localhost:8000/index.html).

Exemple de fiche detaillee :

```text
http://localhost:8000/serie.html?id=1
```

## Arborescence

```text
StreamFlix/
|-- index.html          # Catalogue, recherche, filtres et tri
|-- liste.html          # Page Ma liste
|-- serie.html          # Fiche detaillee d'une serie
|-- README.md
|-- assets/
|   `-- images/         # Ressources images locales
|-- css/
|   |-- style.css       # Styles principaux
|   `-- responsive.css  # Styles responsive
`-- js/
	|-- api.js          # Appels aux APIs distantes
	|-- main.js         # Navigation et logique de rendu
	`-- utils.js        # Utilitaires
```

## Endpoints consommes

| Methode | Endpoint | Usage |
| --- | --- | --- |
| `GET` | `https://api.tvmaze.com/shows` | Catalogue, genres et resultats |
| `GET` | `https://api.tvmaze.com/shows/{id}` | Fiche detaillee selon `?id={id}` |

Le module `js/api.js` definit aussi `POST https://jsonplaceholder.typicode.com/posts` pour une demonstration, mais cet endpoint n'est pas appele par l'interface actuelle et ne fournit pas de stockage reel.

## Limites connues

- Le catalogue depend de TVmaze et d'une connexion Internet.
- Les donnees sont rechargees a chaque ouverture : aucun cache local n'est implemente.
- « Ma liste » est encore une maquette statique ; l'ajout, la suppression et la persistance ne sont pas implementes.
- Il n'y a ni backend, ni compte utilisateur.
- Le projet ne contient pas de tests automatises, de `package.json` ou de pipeline CI.
- Les images distantes peuvent etre absentes ou indisponibles.
- Les cartes possedent `tabindex="0"` et `role="link"`, mais la touche Entree ne declenche pas encore la navigation.

## Releve des tests navigateurs

Tests manuels realises dans un navigateur :

| Scenario | Resultat |
| --- | --- |
| Catalogue charge | Reussi : les cartes sont affichees |
| Recherche sans resultat | Reussi : message vide et bouton « Effacer les filtres » |
| Erreur reseau du catalogue | Reussi : message explicite et bouton « Reessayer » |
| Clic sur une carte | Reussi : redirection vers `serie.html?id=...` |
| Fiche sans `id` | Reussi : erreur « Identifiant absent » |
| Fiche avec `id=abc` | Reussi : erreur « Identifiant invalide » |
| Fiche avec un identifiant inexistant | Reussi : erreur « Serie introuvable » et bouton de reessai |
| Fiche avec `id=1` | Reussi : donnees detaillees affichees |
| Note de la fiche | Reussi : etoiles visibles et equivalent textuel accessible |

Validation complementaire : `node --check js/main.js` et `node --check js/api.js` ne signalent aucune erreur de syntaxe.

## Resultat de l'audit d'accessibilite

Audit manuel du HTML rendu et du parcours clavier :

- les champs de recherche ont des labels associes ;
- les zones de statut utilisent `aria-live` et les chargements utilisent `role="status"` ;
- les erreurs utilisent `role="alert"` ;
- les boutons ont des libelles explicites ;
- les affiches de series disposent d'un texte alternatif ;
- la note en etoiles possede un equivalent textuel masque visuellement ;
- les cartes peuvent recevoir le focus avec `tabindex="0"`.

Le resultat est **partiellement satisfaisant**. Le point restant principal est l'activation clavier des cartes : le clic souris est gere, mais la touche Entree doit encore declencher la meme navigation. Aucun audit automatise Lighthouse ou axe n'a ete execute ; les contrastes et le parcours clavier complet restent donc a verifier avec ces outils.

## IA - Chat GPT

Pour gain de temps utilisation de l'IA pour le système d'étoile (que je ne savais pas faire) ainsi que tous les messages d'erreur, le traitement des images et la création du reste du README