package main

import (
	"fmt"
	"strconv"
)

type KanbanWall struct {
	ID        string
	Name      string
	BoardList map[string]KanbanBoard
}
type KanbanBoard struct {
	ID       string                `json:"id"`
	Name     string                `json:"title"`
	CardList map[string]KanbanCard `json:"item"`
}

func (kw *KanbanWall) addBoard(kb KanbanBoard) string {
	kb.ID = strconv.Itoa(len(kw.BoardList))
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
func (kw *KanbanWall) addCard(boardID string, kc KanbanCard) string {
	kb := kw.BoardList[boardID]
	kc.ID = strconv.Itoa(len(kb.CardList))
	fmt.Println(kb)
	kb.CardList[kc.ID] = kc
	updateWall("0", kw)
	return kc.ID
}
func (kw *KanbanWall) moveCard(cardID string, originBoardID string, destBoardID string) {
	kw.BoardList[destBoardID].CardList[cardID] = kw.BoardList[originBoardID].CardList[cardID]
	delete(kw.BoardList[originBoardID].CardList, cardID)
	updateWall("0", kw)
}

type KanbanCard struct {
	ID        string `json:"id"`
	Title     string `json:"title"`
	details   string
	checkList map[string]KanbanTask
}

type KanbanTask struct {
	ID      string
	Details string
}
