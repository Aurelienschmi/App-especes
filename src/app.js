require("dotenv").config();
const express = require("express");
const axios = require("axios");
const NodeCache = require("node-cache");
const getAssessments = require("./get-assessments");
const getSpeciesInformations = require("./get-species-informations");

const app = express();
const PORT = process.env.PORT || 3001;
const API_URL_COUNTRIES = "https://restcountries.com/v3.1/all";
const TOKEN = process.env.TOKEN;
const cache = new NodeCache({ stdTTL: 86400 }); // Cache for 1 day (86400 seconds)

// Servir les fichiers statiques à partir du répertoire 'public'
app.use(express.static('public'));

app.get("/countries/:countryCode", async (req, res) => {
    try {
        const countryCode = req.params.countryCode;
        const assessments = await getAssessments(countryCode, TOKEN);
        const enrichedAssessments = await Promise.all(
            assessments.assessments.slice(0, 10).map(async (assessment) => {
                if (assessment.sis_taxon_id) {
                    const speciesDetails = await getSpeciesInformations(assessment.sis_taxon_id, TOKEN);
                    const speciesName = speciesDetails.taxon.common_names.filter(name => name.language === "fre")[0];
                    return speciesName ? speciesName.name : speciesDetails.taxon.scientific_name;
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
        const response = await axios.get(API_URL_COUNTRIES);
        const data = response.data;
        const countries = data.sort((a, b) => a.translations.fra.common.localeCompare(b.translations.fra.common));

        let html = `
            <html>
            <head>
                <title>Résultats IUCN par pays</title>
                <link rel="stylesheet" type="text/css" href="/home.css">
                <script>
                    async function handleClick(countryCode) {
                        try {
                            const response = await fetch('/countries/' + countryCode);
                            const species = await response.json();
                            const speciesList = document.getElementById('speciesList');
                            speciesList.innerHTML = species.names.map(name => \`
                                <div class="docContainer">
                                    <p>\${name}</p>
                                </div>
                            \`).join('');
                        } catch (error) {
                            console.error("Erreur:", error);
                        }
                    }
                </script>
            </head>
            <body>
                <div class="navbar">
                    <div class="title">Résultats IUCN par pays</div>
                    <div class="buttons">
                        <a href="/" class="home-button">Home</a>
                        <a href="./doc.html" class="doc-button">Doc</a>
                    </div>
                </div>
                <div class="content">
                    <h1 class="sel">Sélectionnez un pays</h1>
                    <select id="countrySelect" onchange="handleClick(this.value)">
                        ${countries.map(country => `<option value="${country.cca2}">${country.translations.fra.common}</option>`).join('')}
                    </select>
                    <div id="speciesList"></div>
                </div>
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