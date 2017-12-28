package main

import (
	"encoding/json"
	"log"
	"net/http"
)

func apiLogout(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "gAuth")
	session.Values["state"] = nil
	session.Values["email"] = nil
	session.Save(r, w)
	renderRedirect("Logging out...", "/", w)
}
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
