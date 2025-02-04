require("dotenv").config();
const express = require("express");
const axios = require("axios");
const geoip = require("geoip-country");
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

async function getLanguage(ip) {
    const location = geoip.lookup(ip);
    return location ? location.languages[0] : 'en';
}

app.get('/get-ip/', async (req, res) => {
    if (!cache.get('language')) {
        const ip = await axios.get('https://api.ipify.org?format=json')
        .then(response => response.data)
        .catch(error => console.error(error));
        res.json({ ip });
    }
});

app.get('/get-language/:ip', async (req, res) => {
    let language = cache.get('language');
    if (!language) {
        const ip = req.params.ip;
        const language = await getLanguage(ip);
        cache.set('language', language);
        console.log(language)
        res.json({ language });
    } else {
        res.json({ language });
    }
});

app.get("/countries/:countryCode", async (req, res) => {
    try {
        const countryCode = req.params.countryCode;
        const cacheKey = `assessments_${countryCode}`;
        let assessments = cache.get(cacheKey);
        if (!assessments) {
            assessments = await getAssessments(countryCode, TOKEN);
            cache.set(cacheKey, assessments);
        }

        const enrichedAssessments = await Promise.all(
            assessments.assessments.slice(0, 10).map(async (assessment) => {
                if (assessment.sis_taxon_id) {
                    const speciesCacheKey = `species_${assessment.sis_taxon_id}`;
                    let speciesDetails = cache.get(speciesCacheKey);

                    if (!speciesDetails) {
                        speciesDetails = await getSpeciesInformations(assessment.sis_taxon_id, TOKEN);
                        cache.set(speciesCacheKey, speciesDetails);
                    }
                    const speciesName = speciesDetails.taxon.common_names.find(name => name.language === "fre")?.name
                        || speciesDetails.taxon.scientific_name;
                    const speciesYear = speciesDetails.assessments[0]?.year_published || "Inconnu";
                    const speciesExtinct = speciesDetails.assessments[0]?.possibly_extinct;
                    const speciesExtinctInTheWild = speciesDetails.assessments[0]?.possibly_extinct_in_the_wild;

                    return { name: speciesName, year: speciesYear, extinct: speciesExtinct, extinctInTheWild: speciesExtinctInTheWild };
                }
                return null;
            })
        );
        res.json({ names: enrichedAssessments.filter(Boolean) });
    } catch (error) {
        console.error("Erreur:", error);
        res.status(500).send("Erreur lors de la récupération des espèces.");
    }
});

app.get("/cache", (req, res) => {
    const keys = cache.keys();
    const cacheContent = keys.map(key => ({ key, value: cache.get(key) }));
    res.json(cacheContent);
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
                <link rel="stylesheet" type="text/css" href="/styles.css">
                <script>
                    async function getIp() {
                        const response = await fetch('/get-ip/');
                        const data = await response.json();
                        return data.ip || '';
                    }

                    async function getLanguage(ip) {
                        const response = await fetch('/get-language/' + ip.ip);
                        const data = await response.json();
                        return data.language;
                    }
                    async function handleClick(countryCode) {
                        if (!countryCode) return;
                        try {
                            const response = await fetch('/countries/' + countryCode);
                            const species = await response.json();

                            const speciesListElement = document.getElementById('speciesList');
                            speciesListElement.innerHTML = species.names.length 
                                ? species.names
                                    .sort((a, b) => a.name.localeCompare(b.name))
                                    .map(s => \`<div class="docContainer"><strong>\${s.name}</strong> (Année: \${s.year}), Presence dans la nature: \${s.extinctInTheWild}, Presence :\${s.extinct}</div>\`)
                                    .join('')
                                : "<p>Aucune donnée disponible.</p>";
                        } catch (error) {
                            console.error("Erreur:", error);
                        }
                    }

                    async function init() {
                        const ip = await getIp();
                        const language = await getLanguage(ip);
                        console.log(language)
                        document.getElementById('language').innerText = language;
                        // You can use the countryCode here if needed
                    }

                    window.onload = init;
                </script>
            </head>
            <body>
                <div class="navbar">
                    <div class="title">Résultats IUCN par pays</div>
                    <div class="buttons">
                        <a href="/" class="home-button">Home</a>
                        <a href="/doc.html" class="doc-button">Doc</a>
                        <p>Langue: <span id="language"></span></p>
                    </div>
                </div>
                <div class="content">

                    <div class="container">

                        <h1 class="sel">Sélectionnez un pays</h1>
                        <select id="countrySelect" onchange="handleClick(this.value)">
                            ${countries.map(country => `<option class="select" value="${country.cca2}">${country.translations.fra.common}</option>`).join('')}
                        </select>

                    </div>
                    
                    <div class="containerList">
                        <p>Resultat :</p>
                        <div id="speciesList"></div>
                    </div>

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