package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func socketAddCard(data string, h *Hub) {
	type CardData struct {
		ID      string
		BoardID string
		Title   string
	}
	var cardData CardData
	err := json.Unmarshal([]byte(data), &cardData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Card Data", cardData)
	newCard := KanbanCard{"0", cardData.Title, "", map[string]KanbanTask{}}
	cardData.ID = servKanbanData.addCard(cardData.BoardID, newCard)
	fmt.Println(cardData)
	broadcast, _ := json.Marshal(cardData)
	h.broadcastAll([]byte("addCard ~ ~ " + string(broadcast)))
}
func socketAddBoard(data string, h *Hub) {
	type BoardData struct {
		ID    string
		Title string
	}
	var boardData BoardData
	err := json.Unmarshal([]byte(data), &boardData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Board Data", boardData)
	newBoard := KanbanBoard{"0", boardData.Title, map[string]KanbanCard{}}
	boardData.ID = servKanbanData.addBoard(newBoard)
	fmt.Println(boardData)
	broadcast, _ := json.Marshal(boardData)
	h.broadcastAll([]byte("addBoard ~ ~ " + string(broadcast)))
}
func socketChangeBoardTitle(data string, h *Hub) {
	type TitleData struct {
		BoardID string
		Title   string
	}
	var titleData TitleData
	err := json.Unmarshal([]byte(data), &titleData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Change Board Title Data", titleData)
	servKanbanData.changeBoardTitle(titleData.BoardID, titleData.Title)
	fmt.Println(titleData)
	h.broadcastAll([]byte("changeBoardTitle ~ ~ " + data))
}
func socketMoveCard(data string, h *Hub) {
	type MoveData struct {
		CardID        string
		OriginBoardID string
		DestBoardID   string
	}
	var moveData MoveData
	err := json.Unmarshal([]byte(data), &moveData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Change Board Title Data", moveData)
	servKanbanData.moveCard(moveData.CardID, moveData.OriginBoardID, moveData.DestBoardID)
	fmt.Println(moveData)
	h.broadcastAll([]byte("moveCard ~ ~ " + data))
}
