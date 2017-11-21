/**
 * Imports
 */

const CertStreamClient = require('certstream');
const fs = require('fs');

/**
 * Variables
 */

let keywords = fs.readFileSync('./keywords.txt').toString().split("\r\n");
keywords = keywords.filter(function(n){ return n != '' && !n.startsWith("#") }); 

async function checkDomain(domain) {
    for (let word of keywords) {
        if (domain.toLowerCase().indexOf(word.trim().toLowerCase()) >= 0) {
            return word;
        }
    }
    return '';
}

async function bootstrap() {
    let client = new CertStreamClient(async function(message) {
        if (message['message_type'] === 'heartbeat') { return; }
        if (message['message_type'] === 'certificate_update') {
            let domains = message['data']['leaf_cert']['all_domains'];
            for (let domain of domains) {
                let data = await checkDomain(domain);
                if (data != '') {
                    console.log(`Found suspicious domain: ${domain}, matches: ${data}`);
                }
            }
        }
    });
    client.connect();
}

bootstrap();
