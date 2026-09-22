import { recupererSeries, chercherSeriesParId } from "./api.js";

const menuToggle = document.getElementById("menu-toggle");

menuToggle.addEventListener("click", function() {
    const nav = document.getElementById("navigation");
    const isExpanded = this.getAttribute("aria-expanded") === "true";
    this.setAttribute("aria-expanded", String(!isExpanded));
    nav.style.display = isExpanded ? "none" : "block";
});

const cartesSerie = document.getElementById("cartes-serie");

const serieDetails = document.getElementById("serie-details");

if (serieDetails) {
    chargerFicheSerie();
}

if (cartesSerie) {
    const recherche = document.getElementById("recherche-serie");
    const filtreGenre = document.getElementById("filtre-genre");
    const tri = document.getElementById("tri");
    const statutResultats = document.getElementById("statut-resultats");

    let toutesLesSeries = [];
    let controleurChargement;

    function afficherEtat(etat, options = {}) {
        cartesSerie.dataset.etat = etat;
        cartesSerie.setAttribute("aria-busy", String(etat === "chargement"));

        if (etat === "chargement") {
            cartesSerie.innerHTML = `
                <div class="etat-resultats etat-chargement" role="status">
                    <span class="indicateur-chargement" aria-hidden="true"></span>
                    <p>Chargement des séries...</p>
                </div>`;
            return;
        }

        if (etat === "erreur") {
            cartesSerie.innerHTML = `
                <div class="etat-resultats etat-erreur" role="alert">
                    <p>${options.message || "Impossible de charger les séries."}</p>
                    <button id="reessayer" type="button">Réessayer</button>
                </div>`;
            cartesSerie.querySelector("#reessayer").addEventListener("click", chargerSeries);
            return;
        }

        if (etat === "vide") {
            cartesSerie.innerHTML = `
                <div class="etat-resultats etat-vide">
                    <p>Aucune série ne correspond à votre recherche.</p>
                    <button id="effacer-recherche" type="button">Effacer les filtres</button>
                </div>`;
            cartesSerie.querySelector("#effacer-recherche").addEventListener("click", () => {
                recherche.value = "";
                filtreGenre.value = "";
                tri.value = "";
                afficherSeries(toutesLesSeries);
            });
            return;
        }

        cartesSerie.innerHTML = options.series.map(creerCarteSerie).join("");
    }

    function creerCarteSerie(serie) {
        const genres = serie.genres?.join(" • ") || "Genre non renseigné";
        const image = serie.image?.medium || "";
        const annee = serie.premiered ? serie.premiered.slice(0, 4) : "Année inconnue";
        const note = serie.rating?.average ? `${serie.rating.average}/10` : "Note indisponible";

        return `<article class="carte-serie" data-id="${serie.id}" tabindex="0" role="link" aria-label="Voir les détails de ${echapperHtml(serie.name)}">
            ${image ? `<img src="${echapperHtml(image)}" alt="Affiche de ${echapperHtml(serie.name)}" loading="lazy">` : "<div class=\"affiche-indisponible\" aria-hidden=\"true\">Pas d'affiche</div>"}
            <div class="serie-info">
                <h4>${echapperHtml(serie.name)}</h4>
                <p class="genre">${echapperHtml(genres)}</p>
                <p class="annee">${echapperHtml(annee)}</p>
                <p class="note">${echapperHtml(note)}</p>
            </div>
        </article>`;
    }

    function echapperHtml(valeur) {
        return String(valeur).replace(/[&<>"']/g, (caractere) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[caractere]);
    }

    function afficherSeries(series) {
        if (!series.length) {
            afficherEtat("vide");
            statutResultats.textContent = "0 série trouvée.";
            return;
        }

        afficherEtat("succes", { series });
        statutResultats.textContent = `${series.length} série${series.length > 1 ? "s" : ""} trouvée${series.length > 1 ? "s" : ""}.`;
    }

    function appliquerFiltres() {
        const terme = recherche.value.trim().toLowerCase();
        const genre = filtreGenre.value;
        const resultat = toutesLesSeries.filter((serie) => {
            const nom = serie.name.toLowerCase();
            return (!terme || nom.includes(terme)) && (!genre || serie.genres?.includes(genre));
        });
        const ordre = tri.value;

        resultat.sort((premiere, seconde) => {
            if (ordre === "annee-asc" || ordre === "annee-desc") {
                return comparerValeurs(premiere.premiered, seconde.premiered, ordre === "annee-desc");
            }
            if (ordre === "note-asc" || ordre === "note-desc") {
                return comparerValeurs(premiere.rating?.average, seconde.rating?.average, ordre === "note-desc");
            }
            return 0;
        });
        afficherSeries(resultat);
    }

    function comparerValeurs(premiere, seconde, decroissant) {
        const difference = String(premiere || "").localeCompare(String(seconde || ""), undefined, { numeric: true });
        return decroissant ? -difference : difference;
    }

    function remplirGenres(series) {
        const genres = [...new Set(series.flatMap((serie) => serie.genres || []))].sort();
        filtreGenre.innerHTML = '<option value="">Tous les genres</option>';
        genres.forEach((genre) => {
            filtreGenre.insertAdjacentHTML("beforeend", `<option value="${genre}">${genre}</option>`);
        });
    }

    async function chargerSeries() {
        controleurChargement?.abort();
        controleurChargement = new AbortController();
        afficherEtat("chargement");
        statutResultats.textContent = "Chargement des séries en cours.";

        try {
            toutesLesSeries = await recupererSeries(controleurChargement.signal);
            remplirGenres(toutesLesSeries);
            appliquerFiltres();
        } catch (erreur) {
            if (erreur.name !== "AbortError") {
                afficherEtat("erreur", { message: "Impossible de charger les séries. Vérifiez votre connexion puis réessayez." });
                statutResultats.textContent = "Le chargement a échoué.";
            }
        }
    }

    let minuteurRecherche;
    recherche.addEventListener("input", () => {
        clearTimeout(minuteurRecherche);
        const termeRecherche = recherche.value.trim();

        minuteurRecherche = setTimeout(async () => {
            appliquerFiltres();
        }, 300);
    });
    filtreGenre.addEventListener("change", appliquerFiltres);
    tri.addEventListener("change", appliquerFiltres);

    cartesSerie.addEventListener("click", (event) => {
        const carte = event.target.closest(".carte-serie");

        if (carte?.dataset.id) {
            window.location.href = `serie.html?id=${encodeURIComponent(carte.dataset.id)}`;
        }
    });
    chargerSeries();
}

async function chargerFicheSerie() {
    const params = new URLSearchParams(window.location.search);
    const identifiant = params.get("id");

    if (!identifiant) {
        afficherErreurFiche("Identifiant absent", "Aucun identifiant de série n'a été fourni dans l'URL.");
        return;
    }

    if (!/^\d+$/.test(identifiant) || Number(identifiant) < 1) {
        afficherErreurFiche("Identifiant invalide", "L'identifiant de la série doit être un nombre entier positif.");
        return;
    }

    try {
        const serie = await chercherSeriesParId(Number(identifiant));
        afficherFicheSerie(serie);
    } catch (erreur) {
        const message = erreur.code === "INEXISTANTE"
            ? "Cette série n'existe pas dans le catalogue."
            : "La fiche est indisponible pour le moment. Vérifiez votre connexion puis réessayez.";
        afficherErreurFiche(erreur.code === "INEXISTANTE" ? "Série introuvable" : "Fiche indisponible", message, true);
    }
}

function afficherFicheSerie(serie) {
    const nom = valeurOuMention(serie.name, "Nom non renseigné");
    const genres = serie.genres?.length ? serie.genres.join(" • ") : "Genres non renseignés";
    const annee = serie.premiered ? serie.premiered.slice(0, 4) : "Année non renseignée";
    const statut = valeurOuMention(serie.status, "Statut non renseigné");
    const chaine = serie.network?.name || serie.webChannel?.name || "Chaîne de diffusion non renseignée";
    const resume = serie.summary ? serie.summary.replace(/<[^>]*>/g, "").trim() : "Résumé non renseigné";
    const note = Number.isFinite(serie.rating?.average) ? serie.rating.average : null;
    const image = serie.image?.original || serie.image?.medium;
    const etoiles = note === null ? "☆☆☆☆☆" : `${"★".repeat(Math.round(note / 2))}${"☆".repeat(5 - Math.round(note / 2))}`;
    const noteAccessible = note === null ? "Note non renseignée" : `Note de ${note} sur 10`;

    document.title = `StreamFlix - ${nom}`;
    serieDetails.dataset.etat = "succes";
    serieDetails.setAttribute("aria-busy", "false");
    serieDetails.innerHTML = `
        <div id="serie-header">
            <h2>${echapperHtml(nom)}</h2>
            <button type="button">Ajouter à ma liste</button>
        </div>
        ${image ? `<img class="affiche-serie" src="${echapperHtml(image)}" alt="Affiche de ${echapperHtml(nom)}">` : "<div class=\"affiche-indisponible\">Affiche non renseignée</div>"}
        <div class="serie-info">
            <p class="genre"><strong>Genres :</strong> ${echapperHtml(genres)}</p>
            <p class="annee"><strong>Année :</strong> ${echapperHtml(annee)}</p>
            <p class="note"><strong>Note :</strong> <span aria-hidden="true">${etoiles}</span> <span class="texte-accessible">${noteAccessible}</span></p>
            <p class="statut"><strong>Statut :</strong> ${echapperHtml(statut)}</p>
            <p class="chaine"><strong>Chaîne de diffusion :</strong> ${echapperHtml(chaine)}</p>
        </div>
        <div class="serie-resume">
            <h3>Résumé</h3>
            <p>${echapperHtml(resume)}</p>
        </div>`;
}

function afficherErreurFiche(titre, message, permettreReessai = false) {
    serieDetails.dataset.etat = "erreur";
    serieDetails.setAttribute("aria-busy", "false");
    serieDetails.innerHTML = `
        <div class="etat-fiche etat-erreur" role="alert">
            <h2>${titre}</h2>
            <p>${message}</p>
            ${permettreReessai ? '<button id="reessayer-fiche" type="button">Réessayer</button>' : ""}
        </div>`;
    document.getElementById("reessayer-fiche")?.addEventListener("click", chargerFicheSerie);
}

function valeurOuMention(valeur, mention) {
    return typeof valeur === "string" && valeur.trim() ? valeur.trim() : mention;
}

function echapperHtml(valeur) {
    return String(valeur).replace(/[&<>"']/g, (caractere) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[caractere]);
}