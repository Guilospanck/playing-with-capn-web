#!/bin/bash
set -e
set -m

connect_ws(){
	npx wscat -c ws://localhost:3000/rpc?id=1
}
