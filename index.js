const axios = require('axios');
const crypto = require('crypto');

exports.handler = async (event) => {
    let SVID = event.queryStringParameters.svid;
    let HASH = event.queryStringParameters.hash;


    //let SVID = "0DZY4";
    //let HASH_ok = "77c88b9ccdf0efc73fe7863548ed5032";
    //let HASH_saso = "408028d7f4f82bff0392ad668bca1e64";

    let survey_json = await decryptor(HASH, SVID);
    survey_json = JSON.parse(survey_json);
    

    let psid = survey_json.result.find(j => j.alias === 'psid').answer[0];
    let pid = survey_json.result.find(j => j.alias === 'pid').answer[0];

    let all_label = survey_json.result.map(j => j.answerLabel);

    let isSaso = all_label.every(l => !l.includes('saso'));

    let redirect_url = "";

    if (isSaso) {
        redirect_url = `https://abc.com?rst=2&psid=${psid}`;
    } else {
        redirect_url = `https://abc.com?rst=1&psid=${psid}&high=${(56606 * Number.parseInt(pid)) - 51381}`;
    }

    const response = {
        statusCode: 301,
        headers: {
            Location: redirect_url
        }
    };
    return response;
};

const decryptor = async function (hash, svid) {
    let SURVEYCAKE_DOMAIN = "domain";
    let VERSION = "v0";


    let hash_key = "c2e11e3948e3b2f5";
    let iv_key = "4619980eb0f64b85";

    let resp = await axios.get(`https://${SURVEYCAKE_DOMAIN}/webhook/${VERSION}/${svid}/${hash}`);

    let data = resp.data;

    const decipher = crypto.createDecipheriv(
        'AES-128-CBC',
        hash_key,
        iv_key
    );

    let json = decipher.update(
        data,
        'base64',
        'utf8'
    );

    json += decipher.final('utf8');

    return json;
};