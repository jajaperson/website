# My webite

Under construction...

## Architecture

In order to build the site

1. Using `globby` we get an asynct iterator of all files in `vault/`.
2. Preprocessors are applied to each path to extract metadata and determine
   the paths of files to be updated. This information is gathered into an
   array.
3. The file metadata objects are passed to the renderers one by one, as well as
   the entire array of metadata (for things like cross-linking).
