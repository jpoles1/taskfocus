package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func apiExportWall(w http.ResponseWriter, r *http.Request) {
	jsontxt, err := json.Marshal(servKanbanData)
	if err != nil {
		log.Println("Error: " + err.Error())
		return
	}
	w.Write(jsontxt)
}
func apiAddCard(w http.ResponseWriter, r *http.Request) {
	jsontxt, err := json.Marshal(servKanbanData)
	if err != nil {
		log.Println("Error: " + err.Error())
		return
	}
	w.Write(jsontxt)
}
