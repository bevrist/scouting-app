package main

import (
	"bytes"
	"encoding/json"
	"encoding/xml"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/natefinch/atomic"
)

// Global Variables
var apiVersion string = "1.0" //the api version this service implements
// env vars
var listenAddress string

//structure of expected JSON data
type ScoutForm struct {
	ID           string
	// Uploaded     bool
	CreationTime int64
	ScoutName    string
	TeamNumber   int
	Dropdown     string
	TextBox      string
	Check1       bool
	Check2       bool
	Radio        string
}

// in-memory array of form objects
var scoutFormList []ScoutForm

//populates in-memory scoutFormList with JSON data from disk
func loadFormsFromDisk() {
	content, err := ioutil.ReadFile("./data/forms.json")
	if err != nil {
		if string(err.Error()) == "open ./data/forms.json: no such file or directory" {
			//create blank file if not exists
			log.Println("WARN: ./data/forms.json does not exist, creating...")
			atomic.WriteFile("./data/forms.json", bytes.NewReader([]byte("[]")))
			content, _ = ioutil.ReadFile("./data/forms.json")
		} else {
			log.Fatal(err)
		}
	}
	// fmt.Printf("./data/forms.json contents: %s\n", content) //FIXME comment/remove this debug
	err = json.Unmarshal(content, &scoutFormList)
	if err != nil {
		log.Println("WARN - loadFormsFromDisk: " + err.Error())
	}
}

//saves in-memory form array to disk
func saveFormsToDisk() {
	scoutFormJSON, _ := json.Marshal(scoutFormList)
	atomic.WriteFile("./data/forms.json", bytes.NewReader(scoutFormJSON))
}

//--------------------------------------------------------------------------------------

//GetScoutingInfoJSONHandler returns JSON list of all scouting data
func GetScoutingInfoJSONHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	//marshal array of scouting forms to json and return
	scoutListJSON, _ := json.Marshal(scoutFormList)
	fmt.Fprint(w, string(scoutListJSON))
}

//GetScoutingInfoXMLHandler returns JSON list of all scouting data
func GetScoutingInfoXMLHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	//marshal array of scouting forms to json and return
	scoutListXML, _ := xml.Marshal(scoutFormList)
	fmt.Fprint(w, string(scoutListXML))
}

//PostScoutingInfoHandler updates list of JSON scouting data with new entries and saves to disk
func PostScoutingInfoHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	rBody, _ := ioutil.ReadAll(r.Body)
	//extract json array and to scoutFormList array
	var newScoutForms []ScoutForm
	err := json.Unmarshal(rBody, &newScoutForms)
	if err != nil {
		log.Println("ERROR - PostScoutingInfoHandler: " + err.Error())
	}
	//delete existing UID entries from scoutFormList so they can be overwritten later
	for _, item := range newScoutForms {
		for i, element := range scoutFormList {
			if item.ID == element.ID {
				//delete element from array by subbing it with last element and reducing array length by 1
				scoutFormList[i] = scoutFormList[len(scoutFormList)-1]
				scoutFormList = scoutFormList[:len(scoutFormList)-1]
				break
			}
		}
	}
	scoutFormList = append(scoutFormList, newScoutForms...)
	//wait for save to disk
	saveFormsToDisk()
	// http.Error(w, "500 Internal Error", http.StatusInternalServerError)
	// returns	//FIXME remove debug fail lines
	// fmt.Println("RECEIVED: " + string(rBody))
	fmt.Fprint(w, "ok - forms received!")
}

func main() {
	//populate environment variables
	listenAddress = os.Getenv("LISTEN_ADDRESS")
	//set default environment variables
	if listenAddress == "" {
		listenAddress = "0.0.0.0:80"
	}
	loadFormsFromDisk()

	//specify routes and start http server
	r := mux.NewRouter()
	r.HandleFunc("/apiVersion", func(w http.ResponseWriter, _ *http.Request) { fmt.Fprint(w, "{\"apiVersion\":"+apiVersion+"}") })
	r.HandleFunc("/scoutInfo/xml", GetScoutingInfoXMLHandler).Methods(http.MethodGet, http.MethodHead)
	r.HandleFunc("/scoutInfo/json", GetScoutingInfoJSONHandler).Methods(http.MethodGet, http.MethodHead)
	r.HandleFunc("/scoutInfo", GetScoutingInfoJSONHandler).Methods(http.MethodGet, http.MethodHead)
	r.HandleFunc("/scoutInfo", PostScoutingInfoHandler).Methods(http.MethodPost)
	r.HandleFunc("/healthz", func(w http.ResponseWriter, _ *http.Request) { fmt.Fprint(w, "ok") })
	//serve static files, this is last to catch all requests not handled above
	r.PathPrefix("/").Handler(http.FileServer(http.Dir("./www/")))
	var handlers http.Handler = r
	log.Println("scout-server listening at: " + listenAddress)
	log.Fatal(http.ListenAndServe(listenAddress, handlers))
}
