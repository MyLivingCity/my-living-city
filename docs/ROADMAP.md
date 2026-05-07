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


> [!NOTE]
> The mono-repo structure of My Living City is meant to be leveraged to complete the project.
> The project's backend has been largely adjusted, but still needs work.
> The development plan for the next team is meant to centralize on finishing this refactor
> enabling the next team to progress through the frontend. 

> [!IMPORTANT]
> Tackle the technical debt before getting into frontend development to make the
> frontend development experience a lot smoother.

## Backend To-Do's:
 - Tackle any bugs that may have seeped through from our project to yours.
 - Finish remaining contracts, handlers, hooks, etc.
 - Adjust names to be more precise (then adjust wherever they're used)
 - Normalize/Refine schema validation
 - De-nest server directory in apps/backend when possible
 - Move from Prisma to Drizzle
 - Normalize the Database
 - Create new compose files for old-new frontend/backend
 - Distribute tarball to Google Drive to avoid Microsoft tar issues
 - Create unit/integration tests to ensure the app works as expected
 - Create a dictionary of terms (functions, etc.) relevant to the project

## Frontend To-Do's:
- Look at potentially fully redoing the frontend 
- Finish Subgroup frontend refactor (already started)
- Pick a component in the old frontend, copy its contents, create a corresponding
  file in the same location in the new front end, paste the contents, and adjust 
  as needed (other components will likely need to be brought to the new frontend)
- Refactor in-line styling into a cohesive CSS file
- Create a style guide for future students and devs to follow

## To-Don't:
 - Don't work on/push to development branch in your terminal OR on Github itself
 - Don't make changes to the old frontend/backend in the mono repo, indicative by their location
   towards the bottom of the folder structure
 - Don't relocate contracts folder
 - Click through the Google Drive docs (use the search function)
 - Don't rely on archived docs from the Google Drive

## Misc To-Do's: 
 - Follow CONTRIBUTING.md/CONTRACTS.md/TROUBLESHOOTING.md/DEVELOPMENT.md
 - Follow our presentation document in the Google Drive
 - Email prior contributors (including us), ask Nic for their contact information
 - Add to the environment variables documentation and expand on these .md files
   where necessary
 - Utilize short-lived feature branches to avoid merge conflicts
 - Replace magic numbers
 - When in doubt, Google/AI.

 > [!NOTE]
 > The second part of the refactor will involve ACTUAL coding with meaningful changes.
 > This will include deduplicating and further decoupling the code.
 > Try to remain patient with migrating files over and adjusting them until then.
