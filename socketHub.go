// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
)

// hub maintains the set of active clients and broadcasts messages to the
// clients.
type Hub struct {
	// Registered clients.
	clients map[*Client]bool

	// Inbound messages from the clients.
	broadcast chan []byte

	// Register requests from the clients.
	register chan *Client

	// Unregister requests from clients.
	unregister chan *Client
}

func newHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

func (h *Hub) run() {
	for {
		select {
		case client := <-h.register:
			h.clients[client] = true
		case client := <-h.unregister:
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
			}
		case msg := <-h.broadcast:
			msgsplit := strings.Split(string(msg), " ~ ~ ")
			if len(msgsplit) != 2 {
				log.Println("Socket Error: Poorly Formatted Message")
			}
			log.Println("Socket msgtype:", msgsplit[0])
			log.Println("Socket msg:", msgsplit[1])
			switch msgsplit[0] {
			case "all":
				h.broadcastAll(msg)
			case "init":
				data, _ := json.Marshal(servKanbanData.BoardList)
				h.broadcastAll([]byte("init ~ ~ " + string(data)))
			case "addCard":
				type CardData struct {
					ID      string
					BoardID string
					Title   string
				}
				var cardData CardData
				err := json.Unmarshal([]byte(msgsplit[1]), &cardData)
				if err != nil {
					log.Println(err)
				}
				fmt.Println("Card Data", cardData)
				newCard := KanbanCard{"0", cardData.Title, "", map[string]KanbanTask{}}
				cardData.ID = servKanbanData.addCard(cardData.BoardID, newCard)
				fmt.Println(cardData)
				broadcast, _ := json.Marshal(cardData)
				h.broadcastAll([]byte("addCard ~ ~ " + string(broadcast)))
			case "addBoard":

			}
		}
	}
}
func (h *Hub) broadcastAll(msg []byte) {
	for client := range h.clients {
		select {
		case client.send <- msg:
		default:
			close(client.send)
			delete(h.clients, client)
		}
	}
}