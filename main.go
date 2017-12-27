package main

import (
	"flag"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/fatih/color"
	"github.com/gorilla/mux"
	template "github.com/kataras/go-template"
	"github.com/kataras/go-template/handlebars"
	uuid "github.com/satori/go.uuid"
	"github.com/subosito/gotenv"
)

var nodeIdentifier = uuid.NewV4().String()
var servKanbanData = KanbanServer{}

func init() {
	gotenv.Load()
	mongoLoad()
}
func main() {
	// Process handlebars templates
	template.AddEngine(handlebars.New()).Directory("./views", ".hbs")
	err := template.Load()
	if err != nil {
		panic("While parsing the template files: " + err.Error())
	}
	//Request routing
	router := mux.NewRouter()
	//Resources
	router.PathPrefix("/res").Handler(http.StripPrefix("/res", http.FileServer(http.Dir("res/"))))
	//UI routing
	router.HandleFunc("/", homePage).Methods("GET")
	router.HandleFunc("/favicon.ico", faviconServer).Methods("GET")
	router.HandleFunc("/focus/{accountID}", userPage).Methods("GET")
	router.HandleFunc("/focus/{accountID}/{wallID}", wallPage).Methods("GET")
	//API routing
	router.HandleFunc("/api/exportWall", apiExportWall).Methods("GET")
	//API sockets
	hub := newHub()
	go hub.run()
	router.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
	//Start the engines
	portPtr := flag.String("p", "3333", "Server Port")
	flag.Parse()
	port := ":" + *portPtr
	if os.Getenv("PORT") != "" {
		port = ":" + os.Getenv("PORT")
	}
	color.Green("Starting server on port: %s", port[1:])
	color.Green("Access server locally at: http://127.0.0.1:%s", port[1:])
	//Handling system signals
	log.Fatal(http.ListenAndServe(port, router))
	fmt.Println("Terminating Kanban Server...")
}
