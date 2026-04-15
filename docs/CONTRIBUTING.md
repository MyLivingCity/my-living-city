# Contributing

## Prerequisites

### Docker

[Install Docker](https://docs.docker.com/engine/install/)

### Node/NPM

Check if NPM is available: `npm --version`

[Install using NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)\
[Install using NVM for Windows](https://github.com/coreybutler/nvm-windows)

### PostgreSQL CLI tools

> [!IMPORTANT]
> Currently, this application uses PostgreSQL version 11.
> To follow along with this document, we only need to install 
> PostgreSQL for its CLI utilities. Install version 11, 12, or 13. 

[Install PostgreSQL](https://www.postgresql.org/download/)

## Setup

In each of the following directories, copy and rename `.env.example` -> `.env` (no file extension):
> `server/` \
> `frontend/`

```
.
├── frontend
│   ├── .env.example
│   └── .env <-
├── server
│   ├── .env.example
│   └── .env <-
└── README.md
```
Assume all values are **required** unless otherwise specified.\
<ins>Use your own or development/sandbox API credentials. **DO NOT** use 
    production environment credentials.</ins>

### Database

When running your development environment as described [here](#development), your
local postgres instance will be automatically seeded based on a database restore file.

Refer to off-repo project documentation for database connection info and 
run the following command after replacing `<...>` with appropriate values:\
`pg_dump -U postgres -h <hostname-or-ip> -p <port> -W -F t <dbname> > db/db_init.tar`

## Development

This project leverages Docker and Docker compose for a consistent and declarative
development environment.

### Development using Docker

Run `docker compose up -d` in a terminal/cmd/shell at the project root to start the 
development environment.

To watch console output, run `docker compose logs -f` in a terminal/cmd/shell.\
If you are using a Linux terminal or git bash on Windows, `grep` can be used to 
filter console output to a specific container or pattern by using \
`docker compose logs -f | grep ^<frontend|server|postgres>` or \
`docker compose logs -f | grep <pattern>`.

ex.\
`docker compose logs -f | grep ^server` to watch only server console output. \
`docker compose logs -f | grep error` to watch for console output that contains 
`error`.

Visit `http://localhost:3000` to view changes to the application as you work. 

> [!IMPORTANT]
> When you are not working, run `docker compose down` to ensure development
> containers are shut down and not taking resources/battery.

If your docker containers do not start for whatever reason, try first tearing
them down using `docker compose down --remove-orphans` and then running
`docker compose build --no-cache` to rebuild them.

## Contribution Guidelines

### Branching policy

Create branches from the latest commit on the `main` branch. (remember to `git pull`)\
Name branches in this pattern `<your name>/<feature-fix-or-change>`.

ex. `pawel/add-button-styles`

The branch name after the first `/` should generally convey what you want to
change when the branch is merged with `main`.

> [!IMPORTANT]
> Once you have completed work on your branch, submit a pull request for review.
> Changes on your branch will not be reviewed until a pull request is submitted.

### Semantic commit messages

Write your commit messages according to 
[this specification](https://www.conventionalcommits.org/en/v1.0.0/).

Commit messages should be present-tense and describe the change.
If your changes are difficult to adequately convey in a single-line commit 
message, consider breaking your changes out into multiple commits by using
[interactive staging](https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging).

ex. `feat: add button to CTA`\
ex. `fix(nav): link not clickable`\
ex. `chore: rewrite article copy`
