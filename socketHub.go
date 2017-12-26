// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
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
				socketInitWall(msgsplit[1], h)
			case "addCard":
				socketAddCard(msgsplit[1], h)
			case "addBoard":
				socketAddBoard(msgsplit[1], h)
			case "changeBoardTitle":
				socketChangeBoardTitle(msgsplit[1], h)
			case "changeCardTitle":
				socketChangeCardTitle(msgsplit[1], h)
			case "moveCard":
				socketMoveCard(msgsplit[1], h)
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
