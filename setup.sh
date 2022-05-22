#!/bin/bash 

if [[ $1 == "createUser" ]]; then
    if [[ $# -ne 3 ]]; then
        echo "Bei Nutzung von 'createUser', bitte Email und Passwort eingeben"
        exit 1
    else
        curl -X POST -H "Content-Type: application/json" https://irene.informatik.htw-dresden.de:8888/api/register --data '{"email":"'$2'", "password": "'$3'"}'
    fi
elif [[ $1 == "createQuiz" ]]; then
    if [[ $# -ne 3 ]]; then
        echo "Bei Nutzung von 'createQuiz', bitte Email und Passwort eingeben"
        exit 1
    else
        curl --user $2:$3 -X POST -H "Content-Type: application/json" -d '{"title":"Aladdin", "text":"In welcher Stadt lebt Aladdin?", "options": ["Agrabah", "Baserdi", "Djelly", "Costella"], "answer": [1]}' https://irene.informatik.htw-dresden.de:8888/api/quizzes
        curl --user $2:$3 -X POST -H "Content-Type: application/json" -d '{"title":"Simpsons", "text":"Was ist der Vorname von Chief Wiggum", "options": ["Boris", "Clancy", "Arthur", "David"], "answer": [2]}' https://irene.informatik.htw-dresden.de:8888/api/quizzes
        curl --user $2:$3 -X POST -H "Content-Type: application/json" -d '{"title":"Universum", "text":"Was ist die Antwort auf die Frage nach dem Leben, dem Universum und Allem?", "options": ["2000", "73", "42", "8"], "answer": [3]}' https://irene.informatik.htw-dresden.de:8888/api/quizzes
    fi
elif [[ $1 == "getSolutions" ]]; then 
    if [[ $# -ne 3 ]]; then
        echo "Bei Nutzung von 'getSolutions', bitte Email und Passwort eingeben"
        exit 1
    else
        curl --user $2:$3 -X GET  https://irene.informatik.htw-dresden.de:8888/api/quizzes/completed
    fi
elif [[ $1 == "createPDF" ]]; then 
    if ! command -v pdflatex &> /dev/null
    then
        echo "pdflatex existiert nicht!"
        exit 1
    else
        pdflatex -output-directory=tex ./tex/lernportfolio.tex
        mv ./tex/lernportfolio.pdf .
        xdg-open lernportfolio.pdf
    fi
fi