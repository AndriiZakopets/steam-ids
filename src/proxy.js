import fs from 'fs';
import HttpsProxyAgent from 'https-proxy-agent';

const proxiesFile = fs.readFileSync('./src/proxies.json');
const proxies = JSON.parse(proxiesFile);
let i = 0;

function getProxyHttpsAgent() {
    i = i++ % proxies.length;
    const proxy = proxies[i];
    const s = proxy.split(':');
    return new HttpsProxyAgent({host: s[0], port: s[1], auth: `${s[2]}:${s[3]}`});
}

function proxyInterceptor(config) {
    config.httpsAgent = getProxyHttpsAgent();
    return config
}

export default proxyInterceptor;
export const proxyCount = proxies.length;
