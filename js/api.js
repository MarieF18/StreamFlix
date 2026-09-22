const URL_SERIES = "https://api.tvmaze.com/shows";
const URL_POST = "https://jsonplaceholder.typicode.com/posts";

export async function recupererSeries(signal) {
	const reponse = await fetch(URL_SERIES, { signal });

	if (!reponse.ok) {
		throw new Error("Le catalogue est indisponible pour le moment.");
	}

	return reponse.json();
}

export async function chercherSeriesParId(id, signal) {
    const reponse = await fetch(`${URL_SERIES}/${id}`, { signal });
    if (!reponse.ok) {
        const erreur = new Error("La série demandée n'existe pas dans le catalogue.");
        erreur.code = reponse.status === 404 ? "INEXISTANTE" : "INDISPONIBLE";
        throw erreur;
    }
    return reponse.json();
}

export async function envoyerInfo(payload, signal) {
    const reponse = await fetch(URL_POST, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal
    });

    if (!reponse.ok) {
        throw new Error("La soumission a échoué. Vérifiez votre connexion puis réessayez.");
    }

    return reponse.json();
}