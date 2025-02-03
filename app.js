require("dotenv").config();
const getSpecies = require("./get-species.js");
const express = require("express");

const app = express();
const PORT = 3000;
const API_URL_COUNTRIES = "https://restcountries.com/v3.1/all";
const API_URL_IUCN = "https://api.iucnredlist.org/api/v4/countries";
const TOKEN = process.env.TOKEN;

// Route principale
app.get("/", async (req, res) => {
    try {
        // 1. Récupérer la liste des pays
        const response = await fetch(API_URL_COUNTRIES);
        const countries = await response.json();

        // 2. Extraire les codes `cca2`
        const countryCodes = countries.map(country => country.cca2).filter(Boolean);
        const countryNames = countries.map(country => country.translations.fra.common).sort((a,b) => a.localeCompare(b));

        // 4. Générer une page HTML avec les résultats
        let html = "<h1>Résultats IUCN par pays</h1><ul>";
        countryNames.forEach(entry => {
            html += `<li>${entry}</li>`;
        });
        html += "</ul>";

        const species = await getSpecies("FR",TOKEN);

        res.send(html);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).send("Erreur lors de la récupération des données.");
    }
});

// Lancer le serveur
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});