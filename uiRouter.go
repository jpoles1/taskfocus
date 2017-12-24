package main

import (
	"net/http"

	template "github.com/kataras/go-template"
)

var renderOpts = map[string]interface{}{"layout": "layouts/base.hbs"}

func renderPage(templateName string, pageData map[string]interface{}, w http.ResponseWriter) {
	err := template.ExecuteWriter(w, templateName, pageData, renderOpts) // yes you can pass simple maps instead of structs
	if err != nil {
		w.Write([]byte(err.Error()))
	}
}
func homePage(w http.ResponseWriter, r *http.Request) {
	renderPage("kanban.hbs", map[string]interface{}{}, w)
}
func testPage(w http.ResponseWriter, r *http.Request) {
	err := template.ExecuteWriter(w, "test.hbs", map[string]interface{}{}) // yes you can pass simple maps instead of structs
	if err != nil {
		w.Write([]byte(err.Error()))
	}
}
