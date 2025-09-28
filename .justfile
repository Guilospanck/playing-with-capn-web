# Start WS server that on connection starts a RPC
start_server:
  cd server/ && bun dev

# Start client (connects to WS and calls RPC)
start_client:
  cd client/ && bun dev

# Connect to WS (without RPC) locally
connect_ws:
  bash -c 'source ./scripts/run.dev.sh && connect_ws'

# Lint fixes both Client and Server
lint-fix:
  bash -c 'source ./scripts/run.dev.sh && lint_fix'

# Typechecks both Client and Server 
typecheck:
  bash -c 'source ./scripts/run.dev.sh && typecheck'

# Typechecks Server
typecheck_server:
  bash -c 'source ./scripts/run.dev.sh && typecheck_server'

# Typechecks Client
typecheck_client:
  bash -c 'source ./scripts/run.dev.sh && typecheck_client'

# Run typecheck and lint for both Client and Server
pre-pr: typecheck lint-fix

# Log into DB via sqlite3 CLI
db:
  bash -c 'source ./scripts/run.dev.sh && log_into_db_with_sqlite3_cli'
