## Architecture

In order to build the site

1. Using `globby` we get an asynct iterator of all files in `vault/`.
2. Preprocessors are applied to each path,
   which optionally yield preprocessed files for the next phase.
   Emitters should tag preprocessed files with a symbol to mark the originating emitter.
3. All preprocessed input from all emitters is gathered in a single array.
4. Every preprocessed file in the array is passed to _every_ emitter's parser,
   which are intended to emit syntax trees.
   Most emitters should immediately return for all preprocessed files which did not come from the same emitter.
5. All parsed input from all emitters is gathered in a single array.
6. Every parsed file is passed to to every emitter's renderer, which output the html files.
   Again most emitters should guard against other files.
