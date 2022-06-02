"use strict"; // Strikter Modus

/* Globale Variablen */
let questionPath = "../data/questions.json";
let url = "https://irene.informatik.htw-dresden.de:8888/api/quizzes/";
let activeQuestions = [];
let questionNumber;
let selectedID;
let isMath = false;
let isRest = false;
let expanded = false;
let stats;
let i = 0;

// Konstruktor für REST Array
class restObject {
    constructor(id, question, answers) {
        this.id = id;
        this.a = question;
        this.l = answers;
    }
}

window.addEventListener("load", function() {
    const topicButtons = document.getElementsByClassName("thema");
    for(const topic of topicButtons) {
        topic.onclick = function(e) {
            // Sachen zurücksetzen auf Standart
            isMath = false;
            isRest = false;
            stats = {total:0,answered:0,right:0, wrong:0};
            activeQuestions = [];
            document.getElementById("task").style.display = "flex";
            document.getElementById("stats").style.display = "none";
            document.getElementById("right").style.width = "50%";
            document.getElementById("wrong").style.width = "50%";
            // Array wo aktive Fragen drin stehen befüllen
            switch(e.target.value) {
                case "Mathematik":
                    isMath = true;
                    fetchJSONFile(false, questionPath, function(data){
                        for(i = 0; i < data.mathematik.length; i++) {
                            activeQuestions.push(data.mathematik.at(i));
                        }
                    });
                break;
                case "Internettechnologien":
                    fetchJSONFile(false, questionPath, function(data){
                        for(i = 0; i < data.internettechnologien.length; i++) {
                            activeQuestions.push(data.internettechnologien.at(i));
                        }
                    });
                break;
                case "Allgemein":
                    fetchJSONFile(false, questionPath, function(data){
                        for(i = 0; i < data.allgemein.length; i++) {
                            activeQuestions.push(data.allgemein.at(i));
                        }
                    });
                break;
                case "Rest":
                    isRest = true;
                    fetchREST("GET", url, null, function(data){
                        for(i = 0; i < data.content.length; i++) {
                            activeQuestions.push(new restObject(data.content.at(i).id, data.content.at(i).text, data.content.at(i).options));
                        }
                    });
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
            if(isRest) {
                fetchREST("POST", (url+selectedID+"/solve"), (parseInt(button.id)+1), function(data){
                    if (data.success) {
                        stats.right++;
                    } else {
                        stats.wrong++;
                    }
                });
            } else {
                switch(button.id) {
                    case "Richtig":
                        stats.right++;
                    break;
                    case "Falsch":
                        stats.wrong++;
                    break;
                    default:
                }
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

function newQuestion() {
    if(!(stats.total == stats.answered)) {
        // Zufällige Frage bestimmen
        questionNumber = Math.floor(Math.random()*(activeQuestions.length-1));
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
        // Für REST ID zu Frage festlegen
        if(isRest) {
            selectedID = activeQuestions[questionNumber].id;
        }
        // Antworten an Buttons hängen
        let buttons = document.getElementById("answer").getElementsByTagName("button");
        for(i = 0; i < 4; i++) {
            if(isRest) {
                buttons[i].id = questionSort[i];
            } else {
                if(questionSort[i] == 0) {
                    buttons[i].id = "Richtig";
                } else {
                    buttons[i].id = "Falsch";
                }
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
        activeQuestions.splice(activeQuestions.indexOf(activeQuestions[questionNumber]), 1);
    } else {
        // Statistik anzeigen
        document.getElementById("task").style.display = "none";
        document.getElementById("stats").style.display ="flex";
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
    httpRequest.open("GET", path, false);
    httpRequest.send();
}

function fetchREST(requestType, path, answer, callback) {
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState === 4) {
            if (httpRequest.status === 200) {
                var data = JSON.parse(httpRequest.responseText);
                if (callback) callback(data);
            }
        }
    };

    let email = "s81801@informatik.htw-dresden.de";
    let pw = "81801";
    let answerSend = "";

    httpRequest.open(requestType, path, false);
    httpRequest.setRequestHeader("Content-Type", "application/json");
    httpRequest.setRequestHeader("Authorization", "Basic " + window.btoa(email + ":" + pw)); // Prof. Vogts 

    if(requestType === "POST") {
        httpRequest.setRequestHeader("Access-Control-Allow-Origin", "*"); 
        httpRequest.setRequestHeader("Access-Control-Allow-Headers", "*");
        answerSend = '[' +  answer +  ']';
    }

    httpRequest.send(answerSend);
}