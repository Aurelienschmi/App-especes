const axios = require("axios");

async function getAssessments(countryCode, token) {
    const API_URL_IUCN = `https://api.iucnredlist.org/api/v4/countries/${countryCode}`;
    if (!countryCode) {
        return {error : "Code de pays manquant."};
    }
    if (countryCode.length !== 2 || !/^[A-Z]+$/.test(countryCode)) {
        return {error : "Code de pays invalide."};
    }
    const response = await axios.get(API_URL_IUCN, {
        headers: { 'Authorization': ` ${token}` }
    })
    .then(response => response.data)
    .catch (error => {
        console.log(error)
    });
    return response;
};

module.exports = getAssessments;