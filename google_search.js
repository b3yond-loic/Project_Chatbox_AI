

const axios = require('axios');
const { GoogleAuth } = require('google-auth-library');

const auth = new GoogleAuth({
    keyFile: './service-account-key.json',
    scopes: ['https://www.googleapis.com/auth/cloud-platform']
});

const CSE_ID = '**************';

async function search(query) {
    try {
        const client = await auth.getClient();
        const accessToken = await client.getAccessToken();

        const url = `https://www.googleapis.com/customsearch/v1?cx=${CSE_ID}&q=${encodeURIComponent(query)}`;
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${accessToken.token}`
            }
        });
        
        const results = response.data.items.slice(0, 5).map(item => ({
            title: item.title,
            snippet: item.snippet
        }));
        
        return results;
    } catch (error) {
        console.error("Erreur lors de la recherche Google:", error.response?.data || error.message);
        return null;
    }
}

module.exports = { search };
