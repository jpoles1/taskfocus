package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func socketInitWall(data string, h *Hub) {
	type InitData struct {
		WallID string
	}
	var initData InitData
	err := json.Unmarshal([]byte(data), &initData)
	if err != nil {
		log.Println(err)
	}
	outData, _ := json.Marshal(servKanbanData.WallList[initData.WallID].BoardList)
	h.broadcastAll([]byte("init ~ ~ " + string(outData)))
}
func socketAddWall(data string, h *Hub) {
	type WallData struct {
		AccountID string
		WallName  string
	}
	var wallData WallData
	err := json.Unmarshal([]byte(data), &wallData)
	if err != nil {
		log.Println(err)
	}
	servKanbanData.addWall(wallData.AccountID, wallData.WallName)
	outData, _ := json.Marshal(wallData)
	h.broadcastAll([]byte("addWall ~ ~ " + string(outData)))
}
func socketAddCard(data string, h *Hub) {
	type CardData struct {
		ID      string
		Order   int
		WallID  string
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
		kw := servKanbanData.WallList[cardData.WallID]
		cardData.ID, cardData.Order = kw.addCard(newCard, cardData.BoardID)
		servKanbanData.WallList[cardData.WallID] = kw
		fmt.Println(cardData)
		broadcast, _ := json.Marshal(cardData)
		h.broadcastAll([]byte("addCard ~ ~ " + string(broadcast)))
	}
}
func socketAddBoard(data string, h *Hub) {
	type BoardData struct {
		ID     string
		WallID string
		Title  string
	}
	var boardData BoardData
	err := json.Unmarshal([]byte(data), &boardData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Add Board", boardData)
	newBoard := KanbanBoard{"0", 0, boardData.Title, map[string]KanbanCard{}}
	kw := servKanbanData.WallList[boardData.WallID]
	boardData.ID = kw.addBoard(newBoard)
	fmt.Println(boardData)
	broadcast, _ := json.Marshal(boardData)
	h.broadcastAll([]byte("addBoard ~ ~ " + string(broadcast)))
}
func socketChangeBoardName(data string, h *Hub) {
	type NameData struct {
		WallID  string
		BoardID string
		Name    string
	}
	var nameData NameData
	err := json.Unmarshal([]byte(data), &nameData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Change Board Name:", nameData)
	kw := servKanbanData.WallList[nameData.WallID]
	kw.changeBoardName(nameData.BoardID, nameData.Name)
	servKanbanData.WallList[nameData.WallID] = kw
	h.broadcastAll([]byte("changeBoardName ~ ~ " + data))
}
func socketChangeCardTitle(data string, h *Hub) {
	type TitleData struct {
		CardID  string
		BoardID string
		WallID  string
		Title   string
	}
	var titleData TitleData
	err := json.Unmarshal([]byte(data), &titleData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Change Card Title:", titleData)
	kw := servKanbanData.WallList[titleData.WallID]
	kw.changeCardTitle(titleData.Title, titleData.BoardID, titleData.CardID)
	fmt.Println(titleData)
	h.broadcastAll([]byte("changeCardTitle ~ ~ " + data))
}
func socketMoveCard(data string, h *Hub) {
	type MoveData struct {
		CardID        string
		WallID        string
		OriginBoardID string
		DestBoardID   string
		OrderBefore   int
		OrderAfter    int
	}
	var moveData MoveData
	err := json.Unmarshal([]byte(data), &moveData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Move Card:", moveData)
	kw := servKanbanData.WallList[moveData.WallID]
	if moveData.OriginBoardID != moveData.DestBoardID {
		kw.moveCardBoard(moveData.CardID, moveData.OriginBoardID, moveData.DestBoardID)
	}
	kw.moveCardOrder(moveData.CardID, moveData.DestBoardID, moveData.OrderBefore, moveData.OrderAfter)
	h.broadcastAll([]byte("moveCard ~ ~ " + data))
}
