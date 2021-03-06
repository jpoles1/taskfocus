package main

import (
	"encoding/json"
	"fmt"
	"log"
)

func socketInitWall(data string, c *Client) {
	type InitData struct {
		WallID string
	}
	var initData InitData
	err := json.Unmarshal([]byte(data), &initData)
	if err != nil {
		log.Println(err)
	}
	outData, _ := json.Marshal(servKanbanData.WallList[initData.WallID].BoardList)
	c.send <- []byte("init ~ ~ " + string(outData))
}
func socketAddWall(data string, c *Client) {
	type WallData struct {
		WallID    string
		AccountID string
		WallName  string
	}
	var wallData WallData
	err := json.Unmarshal([]byte(data), &wallData)
	if err != nil {
		log.Println(err)
	}
	wallData.WallID = servKanbanData.addWall(wallData.AccountID, wallData.WallName)
	outData, _ := json.Marshal(wallData)
	c.send <- []byte("addWall ~ ~ " + string(outData))
}
func socketChangeWallName(data string, h *Hub) {
	type WallData struct {
		WallID string
		Name   string
	}
	var wallData WallData
	err := json.Unmarshal([]byte(data), &wallData)
	if err != nil {
		log.Println(err)
	}
	servKanbanData.changeWallName(wallData.WallID, wallData.Name)
	h.broadcastChannel(wallData.WallID, []byte("changeWallName ~ ~ "+data))
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
	newCard := KanbanCard{"0", 0, cardData.Title, "", 0, map[string]KanbanTask{}}
	if len(cardData.BoardID) > 0 {
		kw := servKanbanData.WallList[cardData.WallID]
		cardData.ID, cardData.Order = kw.addCard(newCard, cardData.BoardID)
		servKanbanData.WallList[cardData.WallID] = kw
		fmt.Println(cardData)
		broadcast, _ := json.Marshal(cardData)
		h.broadcastChannel(cardData.WallID, []byte("addCard ~ ~ "+string(broadcast)))
	}
}
func socketDeleteCard(data string, h *Hub) {
	type CardData struct {
		CardID  string
		WallID  string
		BoardID string
	}
	var cardData CardData
	err := json.Unmarshal([]byte(data), &cardData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Delete Card", cardData)
	kw := servKanbanData.WallList[cardData.WallID]
	kw.deleteCard(cardData.BoardID, cardData.CardID)
	servKanbanData.WallList[cardData.WallID] = kw
	h.broadcastChannel(cardData.WallID, []byte("deleteCard ~ ~ "+data))
}
func socketAddBoard(data string, h *Hub) {
	type BoardData struct {
		ID     string
		WallID string
		Name   string
	}
	var boardData BoardData
	err := json.Unmarshal([]byte(data), &boardData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Add Board", boardData)
	newBoard := KanbanBoard{"0", 0, boardData.Name, map[string]KanbanCard{}}
	kw := servKanbanData.WallList[boardData.WallID]
	boardData.ID = kw.addBoard(newBoard)
	fmt.Println(boardData)
	broadcast, _ := json.Marshal(boardData)
	h.broadcastChannel(boardData.WallID, []byte("addBoard ~ ~ "+string(broadcast)))
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
	h.broadcastChannel(nameData.WallID, []byte("changeBoardName ~ ~ "+data))
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
	h.broadcastChannel(titleData.WallID, []byte("changeCardTitle ~ ~ "+data))
}

func socketChangeCardDetails(data string, h *Hub) {
	type DetailsData struct {
		CardID  string
		BoardID string
		WallID  string
		Details string
	}
	var detailsData DetailsData
	err := json.Unmarshal([]byte(data), &detailsData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Change Card Details:", detailsData)
	kw := servKanbanData.WallList[detailsData.WallID]
	kw.changeCardDetails(detailsData.Details, detailsData.BoardID, detailsData.CardID)
	h.broadcastChannel(detailsData.WallID, []byte("changeCardDetails ~ ~ "+data))
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
	h.broadcastChannel(moveData.WallID, []byte("moveCard ~ ~ "+data))
}

//Checklist Manipulation
func socketAddChecklistItem(data string, h *Hub) {
	type TaskData struct {
		CardID   string
		BoardID  string
		WallID   string
		TaskText string
		TaskID   string
	}
	var taskData TaskData
	err := json.Unmarshal([]byte(data), &taskData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Add card task:", taskData)
	kw := servKanbanData.WallList[taskData.WallID]
	taskID := kw.addCheckListItem(taskData.TaskText, taskData.BoardID, taskData.CardID)
	taskData.TaskID = taskID
	broadcast, _ := json.Marshal(taskData)
	h.broadcastChannel(taskData.WallID, []byte("addCheckListItem ~ ~ "+string(broadcast)))
}
func socketUpdateChecklistItem(data string, h *Hub) {
	type TaskData struct {
		TaskID  string
		BoardID string
		CardID  string
		WallID  string
		Checked bool
	}
	var taskData TaskData
	err := json.Unmarshal([]byte(data), &taskData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Add card task:", taskData)
	kw := servKanbanData.WallList[taskData.WallID]
	kw.updateCheckListItem(taskData.Checked, taskData.BoardID, taskData.CardID, taskData.TaskID)
	h.broadcastChannel(taskData.WallID, []byte("updateCheckListItem ~ ~ "+data))
}
func socketDeleteChecklistItem(data string, h *Hub) {
	type TaskData struct {
		TaskID  string
		BoardID string
		CardID  string
		WallID  string
	}
	var taskData TaskData
	err := json.Unmarshal([]byte(data), &taskData)
	if err != nil {
		log.Println(err)
	}
	fmt.Println("Add card task:", taskData)
	kw := servKanbanData.WallList[taskData.WallID]
	kw.deleteCheckListItem(taskData.BoardID, taskData.CardID, taskData.TaskID)
	h.broadcastChannel(taskData.WallID, []byte("deleteCheckListItem ~ ~ "+data))
}
