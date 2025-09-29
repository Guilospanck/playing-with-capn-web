#!/bin/bash
set -e
set -m

connect_ws(){
  npx wscat -c ws://localhost:4444/ws?id=1
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
  lint_fix_server
  cd ../
  lint_fix_client
}

typecheck(){
  typecheck_server
  cd ../
  typecheck_client
}

# Some commands:
# .tables (show tables)
# .quit (quit the CLI)
log_into_db_with_sqlite3_cli() {
  cd server/ 
  sqlite3 -cmd ".headers on" -cmd ".mode column" -cmd ".nullvalue null" -cmd "select * from User;" mydb.sqlite
}
