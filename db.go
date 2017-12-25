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
	var wallList []KanbanWall
	mongoSesh.DB("heroku_v5zcbp27").C("walls").Find(bson.M{}).All(&wallList)
	fmt.Println(wallList)
	if len(wallList) < 1 {
		mongoPopulate()
		return
	}
	servKanbanData = wallList[0]
}
func mongoPopulate() {
	servKanbanData = KanbanWall{"0", "Default", map[string]KanbanBoard{
		"0": KanbanBoard{"0", "Todo", map[string]KanbanCard{
		//"0": KanbanCard{"0", "New Task", "", map[string]KanbanTask{}},
		}},
	}}
	createWall(servKanbanData)
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
