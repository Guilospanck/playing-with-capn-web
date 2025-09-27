# Start server
start_server:
  cd server/ && bun dev

# Start client
start_client:
  cd client/ && bun run index.ts

# Connect to WS (without RPC) locally
connect_ws:
  bash -c 'source ./scripts/run.dev.sh && connect_ws'
