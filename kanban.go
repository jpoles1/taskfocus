package main

import (
	"fmt"
	"strconv"
)

type KanbanServer struct {
	WallList map[string]KanbanWall
}

func (ks *KanbanServer) userWalls(accountID string) []KanbanWall {
	var userWalls []KanbanWall
	for _, val := range ks.WallList {
		userWalls = append(userWalls, val)
	}
	return userWalls
}

type KanbanAccount struct {
	ID         string
	Email      string
	Uname      string
	WallIDList []string
}
type KanbanWall struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CardCt    int
	BoardList map[string]KanbanBoard `json:"boardList"`
}
type KanbanBoard struct {
	ID       string                `json:"id"`
	Order    int                   `json:"order"`
	Name     string                `json:"name"`
	CardList map[string]KanbanCard `json:"item"`
}

func (kw *KanbanWall) addBoard(kb KanbanBoard) string {
	kb.ID = strconv.Itoa(len(kw.BoardList))
	kb.Order = len(kw.BoardList)
	fmt.Println(kb)
	kw.BoardList[kb.ID] = kb
	updateWall(kw.ID, kw)
	return kb.ID
}
func (kw *KanbanWall) changeBoardTitle(boardID string, title string) {
	kb := kw.BoardList[boardID]
	kb.Name = title
	kw.BoardList[boardID] = kb
	updateWall(kw.ID, kw)
}
func (kw *KanbanWall) changeCardTitle(title string, boardID string, cardID string) {
	kc := kw.BoardList[boardID].CardList[cardID]
	kc.Title = title
	kw.BoardList[boardID].CardList[cardID] = kc
	updateWall(kw.ID, kw)
}
func (kw *KanbanWall) addCard(kc KanbanCard, boardID string) (string, int) {
	kb := kw.BoardList[boardID]
	kc.ID = strconv.Itoa(kw.CardCt)
	kc.Order = len(kb.CardList)
	fmt.Println(kb)
	kb.CardList[kc.ID] = kc
	kw.CardCt++
	updateWall(kw.ID, kw)
	return kc.ID, kc.Order
}
func (kw *KanbanWall) moveCardBoard(cardID string, originBoardID string, destBoardID string) {
	kw.BoardList[destBoardID].CardList[cardID] = kw.BoardList[originBoardID].CardList[cardID]
	delete(kw.BoardList[originBoardID].CardList, cardID)
	updateWall(kw.ID, kw)
}
func (kw *KanbanWall) moveCardOrder(cardID string, destBoardID string, orderBefore int, orderAfter int) {
	fmt.Println("OBefore", orderBefore)
	for cID, oldCard := range kw.BoardList[destBoardID].CardList {
		if oldCard.Order >= orderAfter {
			oldCard.Order = oldCard.Order + 1
		}
		kw.BoardList[destBoardID].CardList[cID] = oldCard
	}
	oldCard := kw.BoardList[destBoardID].CardList[cardID]
	oldCard.Order = orderBefore
	kw.BoardList[destBoardID].CardList[cardID] = oldCard
	fmt.Println(kw.BoardList[destBoardID])
	updateWall(kw.ID, kw)
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
