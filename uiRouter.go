package main

import (
	"fmt"
	"net/http"

	"github.com/gorilla/mux"
	template "github.com/kataras/go-template"
)

var renderOpts = map[string]interface{}{"layout": "layouts/base.hbs"}

func renderPage(templateName string, partials map[string]string, pageData map[string]interface{}, w http.ResponseWriter) {
	var partialData = map[string]string{}
	for partialName, partialFile := range partials {
		tempOut, err := template.ExecuteString(partialFile, pageData)
		if err != nil {
			tempOut = "Uh oh, template could not be loaded:" + err.Error()
		}
		partialData[partialName] = tempOut
	}
	pageData["partials"] = partialData
	err := template.ExecuteWriter(w, templateName, pageData, renderOpts) // yes you can pass simple maps instead of structs
	if err != nil {
		w.Write([]byte(err.Error()))
	}
}
func renderRedirect(redirMsg string, redirUrl string, w http.ResponseWriter) {
	err := template.ExecuteWriter(w, "redirect.hbs", map[string]interface{}{"redirMsg": redirMsg, "redirUrl": redirUrl}, renderOpts) // yes you can pass simple maps instead of structs
	if err != nil {
		w.Write([]byte(err.Error()))
	}
}
func faviconServer(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "res/favicon.ico")
}
func homePage(w http.ResponseWriter, r *http.Request) {
	renderPage("home.hbs", map[string]string{}, map[string]interface{}{}, w)
}
func userPage(w http.ResponseWriter, r *http.Request) {
	urlparams := mux.Vars(r)
	accountID := urlparams["accountID"]
	fmt.Println("UID", accountID, servKanbanData.AccountList)
	if val, ok := servKanbanData.AccountList[accountID]; ok {
		fmt.Println(val)
		renderPage(
			"user.hbs",
			map[string]string{"nav": "nav.hbs"},
			map[string]interface{}{
				"partials":  map[string]interface{}{},
				"accountID": accountID, "userWalls": servKanbanData.userWalls(accountID),
			}, w)
	} else {
		renderRedirect("Invalid UID", "/", w)
	}
}
func wallPage(w http.ResponseWriter, r *http.Request) {
	urlparams := mux.Vars(r)
	accountID := urlparams["accountID"]
	wallID := urlparams["wallID"]
	if _, ok := servKanbanData.AccountList[accountID]; ok {
		if _, ok := servKanbanData.WallList[wallID]; ok {
			renderPage(
				"kanban.hbs",
				map[string]string{"nav": "nav.hbs", "modal": "modal.hbs"},
				map[string]interface{}{
					"partials":  map[string]interface{}{},
					"accountID": accountID,
					"wallID":    wallID,
					"wallName":  servKanbanData.WallList[wallID].Name,
					"userWalls": servKanbanData.userWalls(accountID),
				}, w)
		} else {
			renderRedirect("Invalid WallID", "/focus/"+accountID, w)
		}
	} else {
		renderRedirect("Invalid UID", "/", w)
	}
}

func testPage(w http.ResponseWriter, r *http.Request) {
	err := template.ExecuteWriter(w, "test.hbs", map[string]interface{}{}) // yes you can pass simple maps instead of structs
	if err != nil {
		w.Write([]byte(err.Error()))
	}
}
