package main

import (
	"fmt"
	"strconv"
)

//KanbanServer holds the data for current accounts and walls for all available/loaded accounts
type KanbanServer struct {
	WallList    map[string]KanbanWall
	AccountList map[string]KanbanAccount
}

func (ks *KanbanServer) addAccount(userEmail string) string {
	accountID := strconv.Itoa(len(ks.AccountList))
	newAccount := KanbanAccount{accountID, userEmail, []string{}}
	ks.AccountList[userEmail] = newAccount
	createAccount(newAccount)
	return accountID
}
func (ks *KanbanServer) updateAccountWalls(accountEmail string, wallID string) {
	account := ks.AccountList[accountEmail]
	account.WallIDList = append(account.WallIDList, wallID)
	ks.AccountList[accountEmail] = account
	updateAccount(account, accountEmail)
}
func (ks *KanbanServer) userWalls(accountID string) []KanbanWall {
	var userWalls []KanbanWall
	for _, val := range ks.AccountList[accountID].WallIDList {
		userWalls = append(userWalls, ks.WallList[val])
	}
	return userWalls
}
func (ks *KanbanServer) addWall(accountID string, wallName string) string {
	wallID := strconv.Itoa(len(ks.WallList))
	ks.WallList[wallID] = KanbanWall{wallID, wallName, 0, map[string]KanbanBoard{}}
	kw := ks.WallList[wallID]
	createWall(kw)
	ks.updateAccountWalls(accountID, wallID)
	return wallID
}
func (ks *KanbanServer) changeWallName(wallID string, wallName string) {
	kw := ks.WallList[wallID]
	kw.Name = wallName
	ks.WallList[wallID] = kw
	updateWall(wallID, &kw)
}

//KanbanAccount holds user data. Contains a list of IDs for walls belonging to the user
type KanbanAccount struct {
	ID         string
	Email      string
	WallIDList []string
}

//KanbanWall holds the data for a wall; a collection of KanbanBoardss containing KanbanCards.
type KanbanWall struct {
	ID        string `json:"id"`
	Name      string `json:"name"`
	CardCt    int
	BoardList map[string]KanbanBoard `json:"boardList"`
}

func (kw *KanbanWall) addBoard(kb KanbanBoard) string {
	kb.ID = strconv.Itoa(len(kw.BoardList))
	kb.Order = len(kw.BoardList)
	fmt.Println(kb)
	kw.BoardList[kb.ID] = kb
	updateWall(kw.ID, kw)
	return kb.ID
}
func (kw *KanbanWall) changeBoardName(boardID string, name string) {
	kb := kw.BoardList[boardID]
	kb.Name = name
	kw.BoardList[boardID] = kb
	updateWall(kw.ID, kw)
}
func (kw *KanbanWall) changeCardTitle(title string, boardID string, cardID string) {
	kc := kw.BoardList[boardID].CardList[cardID]
	kc.Title = title
	kw.BoardList[boardID].CardList[cardID] = kc
	updateWall(kw.ID, kw)
}
func (kw *KanbanWall) changeCardDetails(details string, boardID string, cardID string) {
	kc := kw.BoardList[boardID].CardList[cardID]
	kc.Details = details
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

//Cannot get accurate card ct, aka index...
func (kw *KanbanWall) deleteCard(boardID string, cardID string) {
	delete(kw.BoardList[boardID].CardList, cardID)
	updateWall(kw.ID, kw)
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

//KanbanBoard holds the data for a board; a collection of KanbanCards, belonging to a KanbanWall.
type KanbanBoard struct {
	ID       string                `json:"id"`
	Order    int                   `json:"order"`
	Name     string                `json:"name"`
	CardList map[string]KanbanCard `json:"item"`
}

//KanbanCard holds the data for a card; an entry in a KanbanBoard
type KanbanCard struct {
	ID        string                `json:"id"`
	Order     int                   `json:"order"`
	Title     string                `json:"title"`
	Details   string                `json:"details"`
	CheckList map[string]KanbanTask `json:"tasks"`
}

//KanbanTask holds the data on a checklist item belonging to a KanbanCard
type KanbanTask struct {
	ID      string `json:"id"`
	Details string `json:"details"`
	Checked bool   `json:"checked"`
}
