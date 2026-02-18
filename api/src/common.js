const { Client } = require('pg');
const moment = require("moment");
const Hashids = require("hashids");

function delay(ms) {
    const date = Date.now();
    let currentDate = null;
 
    while (currentDate - date < ms) {
        currentDate = Date.now();
    } ;
}

function strzero( nNumero, nTamanho ) {
    let cStringRetorno = nNumero.toString();

    cStringRetorno = cStringRetorno.padStart( nTamanho, '0');

    return cStringRetorno;
}


module.exports = { delay, strzero };