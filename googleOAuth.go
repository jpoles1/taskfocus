package main

import (
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/sessions"
	"golang.org/x/oauth2"
)

// Credentials which stores google ids.
type Credentials struct {
	Cid     string `json:"cid"`
	Csecret string `json:"csecret"`
}

// User is a retrieved and authentiacted user.
type User struct {
	Sub           string `json:"sub"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Profile       string `json:"profile"`
	Picture       string `json:"picture"`
	Email         string `json:"email"`
	EmailVerified string `json:"email_verified"`
	Gender        string `json:"gender"`
}

var cred Credentials
var conf *oauth2.Config
var state string
var store = sessions.NewCookieStore([]byte("secret"))

func randToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return base64.StdEncoding.EncodeToString(b)
}

func initOAuth() {
	oAuthID := os.Getenv("OAUTH_ID")
	if oAuthID == "" {
		log.Fatal("GOAUTH_ID field required in .env to setup Google OAuth integration.")
	}
	oAuthSecret := os.Getenv("OAUTH_SECRET")
	if oAuthSecret == "" {
		log.Fatal("GOAUTH_SECRET field required in .env to setup Google OAuth integration.")
	}
	oAuthRedirectURL := os.Getenv("OAUTH_REDIRECT_BASEURL")
	if oAuthRedirectURL == "" {
		log.Fatal("OAUTH_REDIRECT_BASEURL field required in .env to setup Google OAuth integration.")
	}
	conf = &oauth2.Config{
		ClientID:     oAuthID,
		ClientSecret: oAuthSecret,
		RedirectURL:  oAuthRedirectURL + "api/googleOAuth",
		Scopes: []string{
			"https://www.googleapis.com/auth/userinfo.email", // You have to select your own scope from here -> https://developers.google.com/identity/protocols/googlescopes#google_sign-in
		},
		Endpoint: oauth2.Endpoint{
			AuthURL:  "https://accounts.google.com/o/oauth2/auth",
			TokenURL: "https://accounts.google.com/o/oauth2/token",
		},
	}
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	// Handle the exchange code to initiate a transport.
	session, _ := store.Get(r, "gAuth")
	retrievedState := session.Values["state"]
	authState, ok := r.URL.Query()["state"]
	if !ok {
		log.Println("Err: Count not find Google authentication state.")
	}
	if retrievedState != authState[0] {
		renderRedirect("Invalid session state!", "/", w)
		return
	}
	authCode, ok := r.URL.Query()["code"]
	if !ok {
		log.Println("Err: Count not find Google authentication code.")
	}
	tok, err := conf.Exchange(oauth2.NoContext, authCode[0])
	if err != nil {
		renderRedirect("Bad Request!", "/", w)
		return
	}

	client := conf.Client(oauth2.NoContext, tok)
	email, err := client.Get("https://www.googleapis.com/oauth2/v3/userinfo")
	if err != nil {
		renderRedirect("Bad Request!", "/", w)
		return
	}
	defer email.Body.Close()
	data, _ := ioutil.ReadAll(email.Body)
	var userInfo User
	err = json.Unmarshal(data, &userInfo)
	if err != nil {
		log.Println(err)
	}
	log.Println("Email body: ", string(data))
	kanbanAccount, ok := servKanbanData.AccountList[userInfo.Email]
	session.Values["email"] = userInfo.Email
	session.Save(r, w)
	if !ok {
		fmt.Println("New Login!", userInfo.Email)
		servKanbanData.addAccount(userInfo.Email)
		renderRedirect("Opening new account", "/focus/"+userInfo.Email, w)
	} else {
		fmt.Println("Existing account!", kanbanAccount)
		renderRedirect("Opening your account", "/focus/"+userInfo.Email, w)
	}
}
