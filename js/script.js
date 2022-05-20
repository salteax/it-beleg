"use strict"; // Strikter Modus

/* global variables */
//var json = require('../data/questions.json');
let mathQuestions = []; 
let itQuestions = [];
let generalQuestions = [];
let restQuestions = [];
let isMath = false;
let expanded = false;
let stats;
let activeQuestions;
let questionPath = '../data/questions.json'
let i = 0;

function restObject(question, answers) {
    this.a = question;
    this.l = answers;
}

window.addEventListener("load", function() {
    fetchJSONFile(false, questionPath, function(data){
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

    fetchJSONFile(true, "https://irene.informatik.htw-dresden.de:8888/api/quizzes", function(data){
        for(i = 0; i < data.content.length; i++) {
            restQuestions.push(new restObject(data.content.at(i).text, data.content.at(i).options));
        }
    });

    // Lösungen, funktioniert aber nicht
    /*fetchJSONFile(true, "https://irene.informatik.htw-dresden.de:8888/api/quizzes/completed", function(data){
        console.log(data.content);
    });*/

    const topicButtons = document.getElementsByClassName("thema");
    for(const topic of topicButtons) {
        topic.onclick = function(e) {
            isMath = false;
            stats = {total:0,answered:0,right:0, wrong:0};
            document.getElementById("task").style.display = 'flex';
            document.getElementById("stats").style.display ='none';
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
                case "Rest":
                    activeQuestions = [...restQuestions];
                break;
                default:
            }
            stats.total = activeQuestions.length;
            newQuestion();
            document.getElementById("answer").style.display = "flex";
            expand(); // damit der User weniger verwirrt ist
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

    document.getElementById("arrow-button").addEventListener("click", expand);
});

function fetchJSONFile(isRest, path, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };
    
    httpRequest.open('GET', path, true);
    // nur notwendig wenn Rest-Schnittstelle angegangen werden soll
    if(isRest) {
        let mail = "s81801@informatik.htw-dresden.de";
        let pw = "81801";
        httpRequest.setRequestHeader("Authorization", "Basic " + window.btoa(mail + ":" + pw)); // Prof. Vogts Lösung aus dem Rocket Chat
    }
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
        // Statistiken
        document.getElementById("task").style.display = 'none';
        document.getElementById("stats").style.display ='flex';

        document.getElementById("right-questions").innerHTML = stats.right;
        document.getElementById("wrong-questions").innerHTML = stats.wrong;
        document.getElementById("total-questions").innerHTML = stats.total;
    }
}

function expand() {
    if(!expanded) {
        document.getElementById("sidebar").style.width = "100%";
        document.getElementById("topic").style.display = "flex";
        document.getElementById("topic").style.width = "100%";
        document.getElementById("arrow").innerHTML = "<";
        expanded = true;
    } else {
        document.getElementById("sidebar").style.width = "25px";
        document.getElementById("topic").style.display = "none";
        document.getElementById("topic").style.width = "0%";
        document.getElementById("arrow").innerHTML = ">";
        expanded = false;
    }
}