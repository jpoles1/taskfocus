package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func socketAddCard(data string, h *Hub) {
	type CardData struct {
		ID      string
		Order   int
		BoardID string
		Title   string
	}
	var cardData CardData
	err := json.Unmarshal([]byte(data), &cardData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Add Card", cardData)
	newCard := KanbanCard{"0", 0, cardData.Title, "", map[string]KanbanTask{}}
	if len(cardData.BoardID) > 0 {
		cardData.ID, cardData.Order = servKanbanData.addCard(cardData.BoardID, newCard)
		fmt.Println(cardData)
		broadcast, _ := json.Marshal(cardData)
		h.broadcastAll([]byte("addCard ~ ~ " + string(broadcast)))
	}
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
	fmt.Println("Add Board", boardData)
	newBoard := KanbanBoard{"0", 0, boardData.Title, map[string]KanbanCard{}}
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
	fmt.Println("Change Board Title:", titleData)
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
	fmt.Println("Move Card:", moveData)
	if moveData.OriginBoardID != moveData.DestBoardID {
		servKanbanData.moveCard(moveData.CardID, moveData.OriginBoardID, moveData.DestBoardID)
	}
	h.broadcastAll([]byte("moveCard ~ ~ " + data))
}
