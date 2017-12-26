package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

var mongoURI string
var mongoDB *mgo.Session

func mongoLoad() {
	mongoURI = os.Getenv("MONGO_URI")
	if mongoURI == "" {
		log.Fatal("No MongoDB URI supplied in .env config file!")
	}
	var err error
	mongoDB, err = mgo.Dial(mongoURI)
	if err != nil {
		log.Fatal("Failed to connect to provided MongoDB URI:\n", err)
	}
	retreiveWall()
}
func retreiveWall() {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	var wallSlice []KanbanWall
	mongoSesh.DB("heroku_v5zcbp27").C("walls").Find(bson.M{}).All(&wallSlice)
	wallList := make(map[string]KanbanWall)
	for _, wall := range wallSlice {
		wall.CardCt = 0
		for _, board := range wall.BoardList {
			wall.CardCt += len(board.CardList)
		}
		wallList[wall.ID] = wall
	}
	if len(wallList) < 1 {
		mongoPopulate()
		return
	}
	servAccounts["1"] = KanbanAccount{
		ID:         "1",
		WallIDList: []string{"0"},
	}
	servKanbanData = KanbanServer{wallList}
	servjson, err := json.Marshal(servKanbanData)
	if err != nil {
		log.Println("Error: " + err.Error())
		return
	}
	fmt.Println(string(servjson))

}
func mongoPopulate() {
	wall1 := KanbanWall{"0", "Default", 0, map[string]KanbanBoard{
		"0": KanbanBoard{"0", 0, "Todo", map[string]KanbanCard{
		//"0": KanbanCard{"0", 0, "New Task", "", map[string]KanbanTask{}},
		}},
	}}
	servKanbanData = KanbanServer{map[string]KanbanWall{"0": wall1}}
	createWall(wall1)
}

func createWall(kw KanbanWall) {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	err := mongoSesh.DB("heroku_v5zcbp27").C("walls").Insert(kw)
	if err != nil {
		fmt.Println("Failure to insert poll document:\n", err)
	}
}
func updateWall(wallID string, kw *KanbanWall) {
	mongoSesh := mongoDB.Copy()
	defer mongoSesh.Close()
	err := mongoSesh.DB("heroku_v5zcbp27").C("walls").Update(bson.M{"id": wallID}, kw)
	if err != nil {
		fmt.Println("Failure to insert poll document:\n", err)
	}
}
