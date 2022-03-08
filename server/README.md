1. Setup database with `npx prisma migrate dev`

### PSQL Cheat Sheet
Install `postgresql` through brew

Run `psql` at command line
```bash
# list dbs
\l

# connect db
\c <dbname here>
# - example
\c smarttraderdev

## once connected

# display tables
\dt