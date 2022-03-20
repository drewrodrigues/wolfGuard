# Background

## /client

This is where the frontend lives. Anything you 'see' in the browser is from code written in this directory.

### Technologies used:

- `TypeScript` is a superset of JavaScript that allows us to easily add types for everything. This makes it easier to worth with other's code and know which methods we can call on objects and what properties we have acess to. Also, with TypeScript, there's less of a chance that we run into runtime errors because of type checking.
- `React` is a frontend state management library. It's allows us to easily update UI state and break out UI into components.
- `Tailwind` is a library which allows us to easily write css within html by using specific classnames. This reduces css maintenance and allows us to move quicker.
- `Socket.io-client` connects the client to the server to receive live updates for live trading.

## /common

This folder contains types that are common to both the client and server. This is specific to TypeScript so we don't have to create interfaces and types in both client and server.

## /server

The server is where we interact with our postgresql database, handle requests from the client (responding with data from the database and from the interactive broker API to provide live updates), have utilities for loading the database with data and scraping data.

Technologies used:

- `TypeScript`
- `Express` is a backend framework which provides common utilities for routing, handling request/response cycles, etc.
- `Socket.io`
- `Interactive Broker API` allows us to request historical bar data & account information, as well create orders to trade.
- `Pupeteer` is a library which provides a simple API so we can scrape data and interact with a web browser through node.
- `Postgresql`
- `Prisma` is a ORM that abstracts much of SQL so we can make calls like `db.bars.all` to get bars from the database instead of a writing a line of raw SQL such as `SELECT * FROM BARS`.

# Setup

- Download Postgres.app https://postgresapp.com/ and make sure it's running
- Setup nvm
- Install node version 14.17.4
- Install yarn: `npm install -g yarn`
- Install brew
- Run `brew install psql` (this is a command line interface for interacting with a postgres db)
- Create the DB running `yarn db:setup`
- Seed your db by running `yarn db:seed` from `/server`

# Running the Project

1. Ensure packages are update to date and installed. Run `yarn install` from `/client`, `/server` and from the root `/`.
2. To run the server, run `yarn start` in `/server`.
3. To run the client, run `yarn start` in `/client`. Client will have a prompt to use a different port, type `y` (this needs to be fixed later).
