const axios = require('axios');

async function getSpeciesInformations(speciesCode, token) {
    const API_URL_IUCN = `https://api.iucnredlist.org/api/v4/taxa/sis/${speciesCode}`;
    const response = await axios.get(API_URL_IUCN, {
            headers: { 'Authorization': ` ${token}` }
        })
        .then(response => response.data)
        .catch (error => {
            console.log(error)
        });
    return response;
};

module.exports = getSpeciesInformations;