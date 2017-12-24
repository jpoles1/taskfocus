package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type KanbanWall struct {
	ID        int
	Name      string
	BoardList []KanbanBoard
}
type KanbanBoard struct {
	ID       int          `json:"id"`
	Name     string       `json:"title"`
	CardList []KanbanCard `json:"item"`
}

func (kb *KanbanBoard) addCard(kc KanbanCard) {
	kb.CardList = append(kb.CardList, kc)
}

type KanbanCard struct {
	ID        int    `json:"id"`
	Title     string `json:"title"`
	details   string
	checkList []KanbanTask
}

func createCard(w http.ResponseWriter, r *http.Request) {
	jsontxt, err := json.Marshal(servKanbanData)
	if err != nil {
		log.Println("Error: " + err.Error())
		return
	}
	w.Write(jsontxt)
}

type KanbanTask struct {
	Details string
}
