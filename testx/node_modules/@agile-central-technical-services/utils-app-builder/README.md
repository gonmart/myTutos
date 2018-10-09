# @agile-central-technical-services/utils-app-builder

![This is a screenshot](https://github.com/RallyTechServices/utils-app-builder/raw/master/screenshot.png)


## Installation
1. Install using npm (or yarn) `npm install @agile-central-technical-services/utils-app-builder`
2. Add the file to the `javascript` section of `config.json`
    ```
     "javascript": [
        "node_modules/@agile-central-technical-services/utils-treegrid-derived-columns/index.js",
        ...
    ```
## Example usage

```

## Developer Notes
To Update
1. `npm version patch` - This will update the package.json to a new version and create a git tag (e.g. `v1.0.1`). It will also run the `postversion` script
to push the changes and tag to GitHub.
2. `npm publish --access public` - This will publish the new version to npmjs.org
3. Create the new release in [`utils-treegrid-derived-columns/releases'](https://github.com/RallyTechServices/utils-treegrid-derived-columns/releases)

