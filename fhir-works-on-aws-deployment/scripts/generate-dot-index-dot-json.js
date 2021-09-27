// copy/paste this code into a node repl started from the ig folder
// e,g,
// `cd implementationGuides/UKCore.Release1`
// `node`
// then paste

const fs = require('fs');

fs.readdir('./', (e, filelist) => {
    const dotindex = { 'index-version': 1, files: [] };
    const mkfile = (name, json) => {
        const ret = {};
        ret.filename = name;
        if (json.resourceType) ret.resourceType = json.resourceType;
        if (json.id) ret.id = json.id;
        if (json.url) ret.url = json.url;
        if (json.version) ret.version = json.version;
        return ret;
    };

    for (const file of filelist) {
        try {
            dotindex.files.push(mkfile(file, JSON.parse(fs.readFileSync(file))));
        } catch (ex) {}
    }

    fs.writeFileSync('.index.json', JSON.stringify(dotindex, null, 2));
});
