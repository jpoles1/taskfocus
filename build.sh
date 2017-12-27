#!/bin/bash
echo Building Linux Version...
go build -o taskfocus.sh
echo Building Windows Version
GOOS=windows GOARCH=386 go build -o taskfocus.exe
