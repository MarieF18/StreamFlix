const CLE_LISTE = "streamflix-ma-liste";

export function obtenirListe() {
	try {
		const donnees = JSON.parse(localStorage.getItem(CLE_LISTE) || "[]");
		return Array.isArray(donnees) ? donnees : [];
	} catch {
		return [];
	}
}

export function ajouterAListe(serie) {
	const liste = obtenirListe();

	if (!liste.some((element) => element.id === serie.id)) {
		liste.push({ ...serie, priorite:  10 });
		localStorage.setItem(CLE_LISTE, JSON.stringify(liste));
	}

	return liste;
}

export function retirerDeLaListe(id) {
	const liste = obtenirListe().filter((serie) => serie.id !== id);
	localStorage.setItem(CLE_LISTE, JSON.stringify(liste));
	return liste;
}

export function modifierPriorite(id, priorite) {
	const liste = obtenirListe();
	const element = liste.find((serie) => serie.id === id);

	if (element) {
		element.priorite = Math.min(Math.max(Number(priorite) || 1, 1), 10);
		localStorage.setItem(CLE_LISTE, JSON.stringify(liste));
	}

	return liste;
}

export function mettreAJourCompteur() {
	const compteur = document.getElementById("compteur");

	if (compteur) {
		compteur.textContent = obtenirListe().length;
	}
}
