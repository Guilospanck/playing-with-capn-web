# Cap'n web

Simple app implementing [Cap'n Web](https://github.com/cloudflare/capnweb/).

## Installing

Install [bun](https://bun.sh) and then `cd` into `client` and `server` and run `bun i` in each one of them to install dependencies.

## Running

With [`just`](https://github.com/casey/just):

```shell
# one terminal
just start_server
# another terminal
just start_client
```

Without `just`:

```shell
# one terminal
cd server/ && bun run dev
# another terminal
cd client/ && bun run build && npx http-server -p 3000 . 
```

After doing that, the server will be available at the port 4444 and the client at the 3000.
Go to `http://localhost:3000` and test it.
