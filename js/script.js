"use strict"; // Strikter Modus

/* global variables */
//var json = require('../data/questions.json');
let mathQuestions = []; 
let itQuestions = [];
let generalQuestions = [];
let isMath = false;
let stats;
let activeQuestions;

let i = 0;

window.addEventListener("load", function() {
    fetchJSONFile('../data/questions.json', function(data){
        for(i = 0; i < data.mathematik.length; i++) {
            mathQuestions.push(data.mathematik.at(i));
        }
        for(i = 0; i < data.internettechnologien.length; i++) {
            itQuestions.push(data.internettechnologien.at(i));
        }
        for(i = 0; i < data.allgemein.length; i++) {
            generalQuestions.push(data.allgemein.at(i));
        }
    });

    const radios = document.getElementsByName("thema");
    for(const radio of radios) {
        radio.onclick = function(e) {
            isMath = false;
            stats = {total:0,answered:0,right:0, wrong:0}
            document.getElementById("right").style.width = "50%";
            document.getElementById("wrong").style.width = "50%";

            switch(e.target.value) {
                case "Mathematik":
                    isMath = true;
                    activeQuestions = [...mathQuestions];
                break;
                case "Internettechnologien":
                    activeQuestions = [...itQuestions];
                break;
                case "Allgemein":
                    activeQuestions = [...generalQuestions];
                break;
                default: 
            }
            stats.total = activeQuestions.length;
            newQuestion();
        }
    }

    const buttons = document.getElementById("answer").getElementsByTagName("button");
    for(const button of buttons) {
        // Auswerten
        button.onclick = function(e) {
            stats.answered++;
            switch(button.id) {
                case "Richtig":
                    stats.right++;
                break;
                case "Falsch":
                    stats.wrong++;
                break;
                default:
            }
            // Progressbar anpassen
            document.getElementById("right").style.width = ((stats.right / stats.answered) * 100) + "%";
            document.getElementById("wrong").style.width = ((stats.wrong / stats.answered) * 100) + "%";
            // Neue Frage
            newQuestion();
        }
    }
});

function fetchJSONFile(path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    httpRequest.open('GET', path);
    httpRequest.send();
}

// !TODO FEHLER MANCHMAL KOMMT BEI MATHE EINE Aufgabe doppelt und die andere garnicht
function newQuestion() {
    if(!(stats.total == stats.answered)) {
        // Zufällige Frage bestimmen
        let questionNumber = Math.floor(Math.random()*activeQuestions.length);
        // Frage in Dokument schreiben
        if(isMath) {
            katex.render(activeQuestions[questionNumber].a, document.getElementById("question"), {
                throwOnError: false
            });
        } else {
            document.getElementById("question").innerHTML = activeQuestions[questionNumber].a;
        }
        // Random Sortierung
        let questionSort = [0, 1, 2, 3];
        questionSort.sort(function(a,b){return 0.5 - Math.random()});
        // Antworten an Buttons hängen
        let buttons = document.getElementById("answer").getElementsByTagName("button");
        for(i = 0; i < 4; i++) {
            if(questionSort[i] == 0) {
                buttons[i].id = "Richtig";
            } else {
                buttons[i].id = "Falsch";
            }
            if(isMath) {
                katex.render(activeQuestions[questionNumber].l[questionSort[i]], buttons[i], {
                    throwOnError: false
                });
            } else {
                buttons[i].innerHTML = activeQuestions[questionNumber].l[questionSort[i]];
            }
        }
        // Frage aus Array entfernen
        activeQuestions.splice(activeQuestions[questionNumber], 1);
    } else {
        // !TODO DURCH MODAL DIALOG ERSETZEN
        alert("Statistiken\n" +
              "Richtig: " + stats.right + "\n" +
              "Falsch: " + stats.wrong
        );
    }
}