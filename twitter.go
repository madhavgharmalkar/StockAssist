package main

import (
	"encoding/json"
	"fmt"
	"github.com/ChimeraCoder/anaconda"
	"net/http"
	"net/url"
	"regexp"
)

func createTwitterAPI() *anaconda.TwitterApi {
	anaconda.SetConsumerKey("kD5XhDRiIIUiNYRBscq6kX2Md")
	anaconda.SetConsumerSecret("YM42rHYRwpjbsVnouby8hMGVzIwsM9K3cmL9QSDO6LZDXCkP6E")

	return anaconda.NewTwitterApi("1187755194-pGYjl11NT1WIEFG79lD4sDxtdpz4bv9nso1UYU1", "reaw9i6pf2HzcY47m4lOCUHrjGaKN0sbUQW5Nsl3XvCKZ")
}

func twitterSearch(twitter *anaconda.TwitterApi, query string) ([]anaconda.Tweet, error) {

	v := url.Values{}
	//v.Set("f", "news")
	v.Set("lang", "en")
	v.Set("count", "100")

	result, err := twitter.GetSearch(query, v)
	if err != nil {
		return result.Statuses, err
	}
	return result.Statuses, nil
}

func tweetsToText(tweets []anaconda.Tweet) []string {

	var results []string

	for _, tweet := range tweets {
		results = append(results, tweet.Text)
	}
	return results
}

func jsonTweets(tweets []anaconda.Tweet) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var results []string

		for _, tweet := range tweets {
			results = append(results, tweet.Text)
		}

		msg, err := json.Marshal(results)
		if err != nil {
			handleWebErr(w, err)
			return
		}

		fmt.Fprint(w, string(msg))

	}
}

func twitterHandler(api *anaconda.TwitterApi) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {

		re := regexp.MustCompile("(http|ftp|https)://([\\w_-]+(?:(?:\\.[\\w_-]+)+))([\\w.,@?^=%&:/~+#-]*[\\w@?^=%&/~+#-])?")

		query := r.URL.Query().Get("q")

		v := url.Values{}
		//v.Set("f", "news")
		v.Set("lang", "en")
		v.Set("count", "20")

		result, err := api.GetSearch(query, v)
		if err != nil {
			handleWebErr(w, err)
			return
		}

		var results []string

		for _, tweet := range result.Statuses {
			results = append(results, re.ReplaceAllLiteralString(tweet.Text, ""))
		}

		msg, err := json.Marshal(results)
		if err != nil {
			handleWebErr(w, err)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, string(msg))

	}
}
