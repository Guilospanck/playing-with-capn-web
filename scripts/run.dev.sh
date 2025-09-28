#!/bin/bash
set -e
set -m

connect_ws(){
	npx wscat -c ws://localhost:3000/ws?id=1
}

lint_fix_server(){
  echo "Linting server..."
  cd server/ && bun run lint:fix
}

lint_fix_client(){
  echo "Linting client..."
  cd client/ && bun run lint:fix
}

typecheck_server(){
  echo "Typechecking server..."
  cd server/ && bun run typecheck
}

typecheck_client(){
  echo "Typechecking client..."
  cd client/ && bun run typecheck
}

lint_fix(){
  lint_fix_client
  cd ../
  lint_fix_server
}

typecheck(){
  typecheck_client
  cd ../
  typecheck_server
}
