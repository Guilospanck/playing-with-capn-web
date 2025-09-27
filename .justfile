# Start dev
dev: start_server

start_server:
  cd server/ && bun dev

# Connect to WS locally
connect_ws:
  bash -c 'source ./scripts/run.dev.sh && connect_ws'
