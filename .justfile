# Start WS server that on connection starts a RPC
start_server:
  cd server/ && bun dev

# Start client (connects to WS and calls RPC)
start_client:
  cd client/ && bun run index.ts

# Connect to WS (without RPC) locally
connect_ws:
  bash -c 'source ./scripts/run.dev.sh && connect_ws'
