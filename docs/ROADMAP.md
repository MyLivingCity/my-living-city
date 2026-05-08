# Recommendations

> [!NOTE]
> Please read CONTRIBUTING.md before proceeding through this guide. 
> Reference TROUBLESHOOTING.md to fix some known bugs.

This file is meant to act as a to-do list for future teams to provide structure to their 
work on MyLivingCity, starting with backend. We recommend starting with the backend because
we've put a most of our time into getting it setup. A large chunk of what needed to be refactored
from the development branch's backend has been done, and the foundation for making it easier for
future devs to pick the project up and go has been set. We recommend that the next team adjusts
these recommendations as they accomplish things.

## Backend To-Do's:
 - Tackle any bugs that may have seeped through from our project to yours.
 - Finish remaining contracts, handlers, hooks, etc.
 - Adjust names to be more precise (then adjust wherever they're used)
 - Normalize/Refine schema validation
 - De-nest server directory in apps/backend when possible
 - Move from Prisma to Drizzle (drizzle uses Zod schema to define the database)
 - Normalize the Database
 - Setup a Docker production build for `/apps/backend` and `/apps/frontend`

## Frontend To-Do's:
- Refactor the frontend
- Avoid simply copying frontend files over, the old frontend needs to be reworked
- Create a style guide for future contributors to follow
- Consider a move from bootstrap to tailwind (low priority but styling is flexible)

## To-Don't:
 - While refactoring, don't work on/push to the `development` branch
 - Don't make changes to the old frontend/backend (`/frontend`, `/server`)
 - Don't relocate contracts folder
 - Click through the Google Drive docs (use the search function)

## Misc To-Do's: 
 - Follow CONTRIBUTING.md/CONTRACTS.md/TROUBLESHOOTING.md/DEVELOPMENT.md
 - Follow our presentation document in the Google Drive
 - If you need to document the project, and the information is not sensitive, commit it in `/docs` to keep documentation version controlled (use markdown `.md`)
 - Email prior contributors, ask Nic for their contact information. The BCIT SSD 2025/26 team initiated the project-wide refactor.
 - Add to the environment variables documentation and expand on these .md files
   where necessary
 - Utilize short-lived (unmerged for 1-2 days max) feature branches to avoid merge conflicts
 - Write unit/integration tests to support future development
 - Reduce magic numbers by defining constants in easy to access places
 - When in doubt, Google/AI/email previous contributors.
