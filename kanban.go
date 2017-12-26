package main

import (
	"fmt"
	"strconv"
)

type KanbanWall struct {
	ID        string
	Name      string
	cardCt    int
	BoardList map[string]KanbanBoard
}
type KanbanBoard struct {
	ID       string                `json:"id"`
	Order    int                   `json:"order"`
	Name     string                `json:"title"`
	CardList map[string]KanbanCard `json:"item"`
}

func (kw *KanbanWall) addBoard(kb KanbanBoard) string {
	kb.ID = strconv.Itoa(len(kw.BoardList))
	kb.Order = len(kw.BoardList)
	fmt.Println(kb)
	kw.BoardList[kb.ID] = kb
	updateWall("0", kw)
	return kb.ID
}
func (kw *KanbanWall) changeBoardTitle(boardID string, title string) {
	kb := kw.BoardList[boardID]
	kb.Name = title
	kw.BoardList[boardID] = kb
	updateWall("0", kw)
}
func (kw *KanbanWall) addCard(boardID string, kc KanbanCard) (string, int) {
	kb := kw.BoardList[boardID]
	kc.ID = strconv.Itoa(kw.cardCt)
	kc.Order = len(kb.CardList)
	fmt.Println(kb)
	kb.CardList[kc.ID] = kc
	kw.cardCt++
	updateWall("0", kw)
	return kc.ID, kc.Order
}
func (kw *KanbanWall) moveCard(cardID string, originBoardID string, destBoardID string) {
	kw.BoardList[destBoardID].CardList[cardID] = kw.BoardList[originBoardID].CardList[cardID]
	delete(kw.BoardList[originBoardID].CardList, cardID)
	updateWall("0", kw)
}

type KanbanCard struct {
	ID        string `json:"id"`
	Order     int    `json:"order"`
	Title     string `json:"title"`
	details   string
	checkList map[string]KanbanTask
}

type KanbanTask struct {
	ID      string
	Details string
}
