package main

import (
	"fmt"
	"log"
	"os"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var mongoURI string
var mongoDB *mgo.Session

func mongoLoad() {
	mongoURI = os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		log.Fatal("No MongoDB URI supplied in .env config file!")
	}
	var err error
	mongoDB, err = mgo.Dial(mongoURI)
	if err != nil {
		log.Fatal("Failed to connect to provided MongoDB URI:\n", err)
	}
	servKanbanData = KanbanServer{}
	retreiveAccounts()
	retreiveWalls()
}
func retreiveAccounts() {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	var accountSlice []KanbanAccount
	mongoSesh.DB("heroku_v5zcbp27").C("accounts").Find(bson.M{}).All(&accountSlice)
	accountList := make(map[string]KanbanAccount)
	for _, account := range accountSlice {
		accountList[account.Email] = account
	}
	servKanbanData.AccountList = accountList
}
func createAccount(ka KanbanAccount) {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	err := mongoSesh.DB("heroku_v5zcbp27").C("accounts").Insert(ka)
	if err != nil {
		fmt.Println("Failure to insert account document:\n", err)
	}
}
func updateAccount(ka KanbanAccount, accountEmail string) {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	err := mongoSesh.DB("heroku_v5zcbp27").C("accounts").Update(bson.M{"email": accountEmail}, ka)
	if err != nil {
		fmt.Println("Failure to update account document:\n", err)
	}
}
func retreiveWalls() {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	var wallSlice []KanbanWall
	mongoSesh.DB("heroku_v5zcbp27").C("walls").Find(bson.M{}).All(&wallSlice)
	wallList := make(map[string]KanbanWall)
	for _, wall := range wallSlice {
		if wall.CardCt == 0 {
			wall.CardCt = 0
			for _, board := range wall.BoardList {
				wall.CardCt += len(board.CardList)
			}
		}
		wallList[wall.ID] = wall
	}
	servKanbanData.WallList = wallList
}
func createWall(kw KanbanWall) {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	err := mongoSesh.DB("heroku_v5zcbp27").C("walls").Insert(kw)
	if err != nil {
		fmt.Println("Failure to insert wall document:\n", err)
	}
}
func updateWall(wallID string, kw *KanbanWall) {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	err := mongoSesh.DB("heroku_v5zcbp27").C("walls").Update(bson.M{"id": wallID}, kw)
	if err != nil {
		fmt.Println("Failure to update wall document:\n", err)
	}
}
