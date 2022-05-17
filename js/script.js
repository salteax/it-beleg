"use strict"; // Strikter Modus

/* global variables */
//var json = require('../data/questions.json');
var mathArray;

window.addEventListener("load", function() {
    jsonToArray();
});

function jsonToArray() {
    fetch('../data/questions.json')
    .then(function(response) {
        return response.json();
    })
    .then(function(data) {
        console.log(data.mathematik);
    });
}

// IDEE JSONTOARRAY als Hauptfunktion mit Argument von Radio Box im letzten then switch case und dementsprechend laden