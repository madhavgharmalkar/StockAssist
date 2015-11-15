package main

import (
	"fmt"
	_ "github.com/ChimeraCoder/anaconda"
	"github.com/gorilla/mux"
	_ "html/template"
	"log"
	"net/http"
	"os"
)

func main() {
	r := mux.NewRouter()
	api := createTwitterAPI()

	port := os.Getenv("HTTP_PLATFORM_PORT")

	r.HandleFunc("/twitter", twitterHandler(api))
	r.HandleFunc("/", indexHandler)
	http.Handle("/", r)

	log.Println("Server listening at localhost:" + port)
	http.ListenAndServe(":"+port, nil)

}

func indexHandler(w http.ResponseWriter, r *http.Request) {
	// templ, err := template.ParseFiles("templates/index.html")
	// if err != nil {
	// 	handleWebErr(w, err)
	// 	return
	// }

	// err = templ.Execute(w, nil)
	// if err != nil {
	// 	handleWebErr(w, err)
	// 	return
	// }

	fmt.Fprint(w, "Madhav is awesome")

}

func handleWebErr(w http.ResponseWriter, err error) {
	log.Panic(err)
	http.Error(w, "Internal server error: "+err.Error(), 500)
}
