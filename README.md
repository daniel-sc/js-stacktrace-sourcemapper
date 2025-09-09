# js-stacktrace-sourcemapper

A simple CLI script to map stack traces of minified js/ts to original files and method names via source maps.

## Installation

```bash
# clone the repo:
git clone git@github.com:daniel-sc/js-stacktrace-sourcemapper.git
cd js-stacktrace-sourcemapper
# install dependencies:
bun install
# or
npm install && node_modules/.bin/tsc remap.ts
```

## Usage

```bash
bun run remap.ts <stacktrace-file>
# or
node remap.js <stacktrace-file>
# or
deno run --compat --allow-net --allow-read remap.ts <stacktrace-file>
```

Alternatively, the stacktrace can be provided via stdin.

## Example

Minified stack trace:
```
Error: NG0911
    at mf (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:9266)
    at Qo.onDestroy (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:21214)
    at new Jo (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:33856)
    at sp (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:34594)
    at aD (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:34264)
    at e._subscribe (https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js:1:14564)
    at e._trySubscribe (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5248)
    at https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5191
    at cn (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:2231)
    at e.subscribe (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5107)
```
Command:
```bash
bun run remap.ts stacktrace.txt
```
Output:
```
bun run .\remap.ts .\stack.txt
[DEBUG] Script started
[DEBUG] Input length: 809
[DEBUG] Starting remapping
[DEBUG] Preloading source maps
[DEBUG] Loading source map for https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js
[DEBUG] getSourceMapConsumer for https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js
[DEBUG] Fetching URL: https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js
[DEBUG] Fetched 265619 bytes from https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js
[DEBUG] Extracting sourceMappingURL
[DEBUG] sourceMappingURL found: chunk-YIFPV4U7.js.map
[DEBUG] Resolved source map URL: https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js.map
[DEBUG] Fetching URL: https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js.map
[DEBUG] Fetched 2831319 bytes from https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js.map
[DEBUG] Created SourceMapConsumer for https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js
[DEBUG] Loading source map for https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js
[DEBUG] getSourceMapConsumer for https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js
[DEBUG] Fetching URL: https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js
[DEBUG] Fetched 165037 bytes from https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js
[DEBUG] Extracting sourceMappingURL
[DEBUG] sourceMappingURL found: chunk-SN376BRJ.js.map
[DEBUG] Resolved source map URL: https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js.map
[DEBUG] Fetching URL: https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js.map
[DEBUG] Fetched 516586 bytes from https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js.map
[DEBUG] Created SourceMapConsumer for https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js
[DEBUG] Remapping frames
[DEBUG] Line: Error: NG0911
[DEBUG] Line:     at mf (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:9266)
[DEBUG] Mapped at mf (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:9266) -> at mf (node_modules/@angular/core/fesm2022/core.mjs:3388:10)
[DEBUG] Line:     at Qo.onDestroy (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:21214)
[DEBUG] Mapped at Qo.onDestroy (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:21214) -> at storeLViewOnDestroy (node_modules/@angular/core/fesm2022/core.mjs:5904:4)    
[DEBUG] Line:     at new Jo (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:33856)
[DEBUG] Mapped at new Jo (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:33856) -> at onDestroy (node_modules/@angular/core/fesm2022/core.mjs:8671:43)
[DEBUG] Line:     at sp (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:34594)
[DEBUG] Mapped at sp (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:34594) -> at sp (node_modules/@angular/core/fesm2022/core.mjs:8729:19)
[DEBUG] Line:     at aD (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:34264)
[DEBUG] Mapped at aD (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:7:34264) -> at afterRenderImpl (node_modules/@angular/core/fesm2022/core.mjs:8705:9)
[DEBUG] Line:     at e._subscribe (https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js:1:14564)
[DEBUG] Mapped at e._subscribe (https://cargodigital.sbbcargo.com/fr/chunk-SN376BRJ.js:1:14564) -> at afterNextRender (node_modules/@sbb-esta/angular/fesm2022/autocomplete.mjs:715:8)
[DEBUG] Line:     at e._trySubscribe (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5248)
[DEBUG] Mapped at e._trySubscribe (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5248) -> at _subscribe (node_modules/rxjs/dist/esm/internal/Observable.js:34:20)       
[DEBUG] Line:     at https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5191
[DEBUG] Mapped at https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5191 -> at _trySubscribe (node_modules/rxjs/dist/esm/internal/Observable.js:28:114)
[DEBUG] Line:     at cn (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:2231)
[DEBUG] Mapped at cn (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:2231) -> at cb (node_modules/rxjs/dist/esm/internal/util/errorContext.js:24:4)
[DEBUG] Line:     at e.subscribe (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5107)
[DEBUG] Mapped at e.subscribe (https://cargodigital.sbbcargo.com/fr/chunk-YIFPV4U7.js:3:5107) -> at errorContext (node_modules/rxjs/dist/esm/internal/Observable.js:23:6)
[DEBUG] Completed remapping
Error: NG0911
    at mf (node_modules/@angular/core/fesm2022/core.mjs:3388:10)
    at storeLViewOnDestroy (node_modules/@angular/core/fesm2022/core.mjs:5904:4)
    at onDestroy (node_modules/@angular/core/fesm2022/core.mjs:8671:43)
    at sp (node_modules/@angular/core/fesm2022/core.mjs:8729:19)
    at afterRenderImpl (node_modules/@angular/core/fesm2022/core.mjs:8705:9)
    at afterNextRender (node_modules/@sbb-esta/angular/fesm2022/autocomplete.mjs:715:8)
    at _subscribe (node_modules/rxjs/dist/esm/internal/Observable.js:34:20)
    at _trySubscribe (node_modules/rxjs/dist/esm/internal/Observable.js:28:114)
    at cb (node_modules/rxjs/dist/esm/internal/util/errorContext.js:24:4)
    at errorContext (node_modules/rxjs/dist/esm/internal/Observable.js:23:6)
```

## Alternate Format Support

This tool also supports Firefox-style stack frames of the form:

```
I@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:3:35165
Mc@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:7:8322
onDestroy@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:7:12992
ao@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:7:91814
JC@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:7:92471
@https://cargodigital.sbbcargo.com/de/chunk-QPFVX7ZD.js:5:7001
_trySubscribe@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:3:5260
@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:3:5206
Rn@https://cargodigital.sbbcargo.com/de/chunk-J6REQCBN.js:3:2232
```

When remapped, these lines are rewritten to their original sources, preserving the `name@file:line:column` style (or `@file:line:column` when no function name is present).

## Caching

To avoid repeated network requests, fetched JavaScript files and source maps are cached on disk.

- Default cache directory: `.sourcemapper-cache` (created alongside the script)
- Override via env var: set `STACKTRACE_SOURCEMAP_CACHE_DIR` to a custom path

On subsequent runs, resources are read from the cache if present, so a fully cached stacktrace requires no network access.


## Status

This was a quick hack to get the job done. 
It works for me, but it is not a polished solution. 
Feel free to improve it and send a PR.
