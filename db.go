package main

import (
	"log"
	"os"

	mgo "gopkg.in/mgo.v2"
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
	mongoPopulate()
}
func mongoPopulate() {
	servKanbanData = KanbanWall{0, "Default", []KanbanBoard{
		KanbanBoard{0, "Todo", []KanbanCard{
			KanbanCard{0, "Test", "", []KanbanTask{}},
		},
		},
	},
	}
}
