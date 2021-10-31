import axios from 'axios';
import fs from 'fs';
import querystring from 'querystring';
import HttpsProxyAgent from 'https-proxy-agent';

const proxiesFile = fs.readFileSync('./src/proxies.json');
const proxies = JSON.parse(proxiesFile);
let i = 0;

function proxyAxios(url, options, method) {
    i = (i + 1) % proxies.length;
    const proxy = proxies[i];
    const s = proxy.split(':');
    const httpsAgent = new HttpsProxyAgent({host: s[0], port: s[1], auth: `${s[2]}:${s[3]}`});

    if (method === 'post') {
        return axios(url, {
            data: querystring.stringify(options.data),
            method: 'POST',
            httpsAgent,
            timeout: 15000,
        });
    }

    return axios.get(url, {
        ...options,
        httpsAgent,
        timeout: 5000,
    });
}

export default proxyAxios;
