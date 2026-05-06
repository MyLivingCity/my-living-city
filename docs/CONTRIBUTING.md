# Contributing

During development, we recommend using git bash or WSL2 for tasks requiring 
the terminal; you are likely to encounter issues while using 
Windows Powershell or CMD.

## Prerequisites

### Docker

[Install Docker](https://docs.docker.com/engine/install/)

### Node/NPM/PNPM

Check if NPM is available: `npm --version`\
Check if PNPM is available: `pnpm --version`

[Install Node using NVM](https://github.com/nvm-sh/nvm?tab=readme-ov-file#installing-and-updating)\
[Install Node using NVM for Windows](https://github.com/coreybutler/nvm-windows)\
[Install PNPM](https://pnpm.io/installation)
[PNPM Workspaces Details](https://pnpm.io/workspaces)

### PostgreSQL CLI tools

> [!NOTE]
> We only need to install PostgreSQL for its CLI utilities.
> Install version 11, 12, or 13. 

[Install PostgreSQL](https://www.postgresql.org/download/)


## Setup

#### 1. In EACH of the following directories, copy and rename `.env.example` -> `.env` (no file extension):
> `server/` \
> `frontend/` \
> `apps/frontend/` \
> `apps/backend/` 

```
.
├── server
│   ├── .env.example
│   └── .env <-
└── README.md
```
Assume all values are **required** unless otherwise specified.\
<ins>Use your own or development/sandbox API credentials. **DO NOT** use 
    production environment credentials.</ins>

#### 2. In the project root, run
* `pnpm install` to install all dependancies for the project and generate \
the prisma client.

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

> [!IMPORTANT]
> During the major refactor, both the pre-refactor and refactor applications can 
> be composed as demonstrated in this section. By default, `pnpm compose ...`
> targets the new in-development application, whereas `pnpm compose:old ...`
> targets the pre-refactor application. Use `pnpm compose:both ...` to compose,
> develop, and interact with both applications.

Run `pnpm compose watch` in a terminal/cmd/shell at the project root to start the 
development environment and watch for code changes.

To view application console output, run `pnpm compose logs -f` in a terminal/cmd/shell.\
If you are using a Linux terminal or git bash on Windows, `grep` can be used to 
filter console output to a specific container or pattern by using \
`pnpm compose logs -f | grep ^<container-name>` or \
`pnpm compose logs -f | grep <pattern>`.

> [!NOTE]
> When filtering container logs for a specific container, the container's name 
> depends on which application environment it is a part of.
> ex. in the legacy env the backend api is named `server` but in the new env it
> is named `mlc-backend`.

ex.\
`pnpm compose logs -f | grep ^server` to watch only server console output. \
`pnpm compose logs -f | grep error` to watch for console output that contains 
`error`.

#### Frontend access
New application `pnpm compose`: `http://localhost:4000`.\
Pre-refactor `pnpm compose:old`: `http://localhost:3000`.

> [!IMPORTANT]
> When you are not working, run `pnpm compose:both down` to ensure development
> containers are shut down and not taking resources/battery.

If your docker containers do not start for whatever reason, try first tearing
them down using `pnpm compose:both down --remove-orphans` and then running
`pnpm compose:both build --no-cache` to rebuild them.


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
