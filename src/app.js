require("dotenv").config();
const express = require("express");
const NodeCache = require("node-cache");
const getAssessments = require("./get-assessments");
const getSpeciesInformations = require("./get-species-informations");

const app = express();
const PORT = process.env.PORT || 3001; // Changez le port ici
const API_URL_COUNTRIES = "https://restcountries.com/v3.1/all";
const TOKEN = process.env.TOKEN;
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 1 day (86400 seconds)

// Servir les fichiers statiques à partir du répertoire 'public'
app.use(express.static('public'));

app.get("/countries/:countryCode", async (req, res) => {
    try {
        const countryCode = req.params.countryCode;
        const species = await getAssessments(countryCode, TOKEN);
        res.json(species);
        const assessments = await getAssessments(countryCode, TOKEN);
        // Récupération des détails pour chaque sis_taxon_id
        const enrichedAssessments = await Promise.all(
            assessments.assessments.map(async (assessment) => {
                if (assessment.sis_taxon_id) {
                    const speciesDetails = await getSpeciesInformations(assessment.sis_taxon_id, TOKEN);
                    const speciesName = speciesDetails.taxon.common_names.filter(name => name.language === "fre")[0];
                    return speciesName ? speciesName.name : speciesDetails.taxon.scientific_name ;
                }
                return assessment;
            })
        );
        res.json({ names: enrichedAssessments });
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).send("Erreur lors de la récupération des espèces.");
    }
});

// Route principale
app.get("/", async (req, res) => {
    try {
        let countries = cache.get("countries");
        if (!countries) {
            console.log("Fetching countries from API...");
            const response = await fetch(API_URL_COUNTRIES);
            const data = await response.json();
            countries = data.sort((a, b) => a.translations.fra.common.localeCompare(b.translations.fra.common));
            cache.set("countries", countries);
            console.log("Countries fetched and cached.");
        } else {
            console.log("Countries fetched from cache.");
        }

        let html = `
            <html>
            <head>
                <title>Résultats IUCN par pays</title>
                <link href="home.css" rel="stylesheet"/>
                <style>
                    #countrySelect {
                        max-height: 300px;
                        overflow-y: auto;
                    }
                </style>
                <script>
                    async function handleClick(countryCode) {
                        try {
                            const response = await fetch('/countries/' + countryCode);
                            const species = await response.json();
                            const speciesList = species.names.sort((a, b) => a.localeCompare(b));
                            document.getElementById('speciesList').innerText = JSON.stringify(speciesList, null, 2);
                        } catch (error) {
                            console.error("Erreur:", error);
                        }
                    }
                </script>
            </head>
            <body>
                <h1 class='title'>Résultats IUCN par pays</h1>
                <select id="countrySelect" onchange="handleClick(this.value)">
                    ${countries.map(country => `<option value="${country.cca2}">${country.translations.fra.common}</option>`).join('')}
                </select>
                <h2>Liste des espèces en danger</h2>
                <pre id="speciesList"></pre>
            </body>
            </html>
        `;
        res.send(html);
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).send("Erreur lors de la récupération des pays.");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});