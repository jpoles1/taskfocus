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
func renderRedirect(redirMsg string, redirURL string, w http.ResponseWriter) {
	err := template.ExecuteWriter(w, "redirect.hbs", map[string]interface{}{"redirMsg": redirMsg, "redirURL": redirURL}, renderOpts) // yes you can pass simple maps instead of structs
	if err != nil {
		w.Write([]byte(err.Error()))
	}
}
func faviconServer(w http.ResponseWriter, r *http.Request) {
	http.ServeFile(w, r, "res/favicon.ico")
}
func homePage(w http.ResponseWriter, r *http.Request) {
	state = randToken()
	session, _ := store.Get(r, "gAuth")
	var googleLoginURL string
	if session.Values["email"] != nil {
		googleLoginURL = "/focus/" + session.Values["email"].(string)
	} else {
		session.Values["state"] = state
		session.Save(r, w)
		googleLoginURL = conf.AuthCodeURL(state)
	}
	renderPage("home.hbs", map[string]string{}, map[string]interface{}{"googleLoginURL": googleLoginURL}, w)
}

//Takes an account ID, and request containing a session, confirms they match
func userPage(w http.ResponseWriter, r *http.Request) {
	urlparams := mux.Vars(r)
	accountID := urlparams["accountID"]
	if !validateAccount(accountID, w, r) {
		return
	}
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
func contains(s []string, e string) bool {
	for _, a := range s {
		if a == e {
			return true
		}
	}
	return false
}
func validateAccount(accountID string, w http.ResponseWriter, r *http.Request) bool {
	session, _ := store.Get(r, "gAuth")
	sessionID := session.Values["email"]
	if sessionID == nil {
		renderRedirect("Login required.", "/api/login", w)
		return false
	}
	sessionIDString := string(session.Values["email"].(string))
	if accountID != sessionIDString {
		renderRedirect("Access Denied.", "/focus/"+sessionIDString, w)
		return false
	}
	return true
}
func wallPage(w http.ResponseWriter, r *http.Request) {
	urlparams := mux.Vars(r)
	accountID := urlparams["accountID"]
	wallID := urlparams["wallID"]
	if !validateAccount(accountID, w, r) {
		return
	}
	if _, ok := servKanbanData.AccountList[accountID]; ok {
		_, ok := servKanbanData.WallList[wallID]
		if ok && contains(servKanbanData.AccountList[accountID].WallIDList, wallID) {
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
