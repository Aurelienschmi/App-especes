require("dotenv").config();
const getSpecies = require("./get-species.js");
const express = require("express");

const app = express();
const PORT = 3000;
const API_URL_COUNTRIES = "https://restcountries.com/v3.1/all";
const TOKEN = process.env.TOKEN;

app.get("/species/:countryCode", async (req, res) => {
    try {
        const countryCode = req.params.countryCode;
        const species = await getSpecies(countryCode, TOKEN);
        res.json(species);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).send("Erreur lors de la récupération des espèces.");
    }
});

// Route principale
app.get("/", async (req, res) => {
    try {
        const response = await fetch(API_URL_COUNTRIES);
        const data = await response.json();
        const countries = data.sort((a,b) => a.translations.fra.common.localeCompare(b.translations.fra.common))

        let html = `
            <html>
            <head>
                <title>Résultats IUCN par pays</title>
                <script>
                    async function handleClick(countryCode) {
                        try {
                            const response = await fetch('/species/' + countryCode);
                            const species = await response.json();
                            console.log("Species for country code", countryCode, ":", species);
                        } catch (error) {
                            console.error("Erreur lors de la récupération des espèces:", error);
                        }
                    }
                </script>
            </head>
            <body>
                <h1>Résultats IUCN par pays</h1>
                <ul>
        `;
        countries.forEach(country => {
            html += `<li onClick="handleClick('${country.cca2}')">${country.translations.fra.common} : ${country.cca2}</li>`;
        });
        html += `
                </ul>
            </body>
            </html>
        `;

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