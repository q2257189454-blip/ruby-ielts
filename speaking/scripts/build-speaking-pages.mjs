import {build} from "esbuild";
import {createHash} from "node:crypto";
import {copyFile,mkdir,readFile,writeFile} from "node:fs/promises";
import path from "node:path";
import {fileURLToPath} from "node:url";

const source=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const manifest=JSON.parse(await readFile(path.join(source,"package.json"),"utf8"));
const isPublicPackage=manifest.name==="ielts-speaking-notebook";
const target=process.argv[2]?path.resolve(process.argv[2]):isPublicPackage?source:path.join(source,"outputs/speaking");
const components=["Bank.tsx","Common.tsx","Detail.tsx","Home.tsx","Materials.tsx","NotebookView.tsx","Phrasebook.tsx","Practice.tsx","model.ts","types.ts","workbook.ts"];
const files=["scripts/build-speaking-pages.mjs","github-pages/main.tsx","github-pages/index.html","app/globals.css","content/phrases.ts","content/bank.json","public/favicon.svg",...components.map(file=>"components/speaking/"+file)];

async function copy(sourceFile,targetFile=sourceFile){
  const from=path.join(source,sourceFile),to=path.join(target,targetFile);
  if(from===to)return;
  await mkdir(path.dirname(to),{recursive:true});
  await copyFile(from,to);
}
if(target!==source){
  await Promise.all(files.map(file=>copy(file)));
  await copy(isPublicPackage?"package.json":"github-pages/package.public.json","package.json");
  await copy(isPublicPackage?"README.md":"github-pages/README.md","README.md");
}
await mkdir(path.join(target,"assets"),{recursive:true});
async function contentVersion(filename) {
  const bytes=await readFile(path.join(target,filename));
  return createHash("sha256").update(bytes).digest("hex").slice(0,16);
}
const bankVersion=await contentVersion("content/bank.json");
const css=await readFile(path.join(source,"app/globals.css"),"utf8");
await writeFile(path.join(target,"assets/notebook.css"),css);
await build({
  absWorkingDir:source,entryPoints:["github-pages/main.tsx"],outfile:path.join(target,"assets/notebook.js"),
  bundle:true,minify:true,charset:"utf8",jsx:"automatic",platform:"browser",format:"esm",target:"es2022",legalComments:"eof",define:{"process.env.NODE_ENV":'"production"'},
  plugins:[{name:"speaking-content",setup(builder){
    builder.onResolve({filter:/^@\/content\/phrases$/},()=>({path:path.join(source,"content/phrases.ts")}));
    builder.onResolve({filter:/^@\/content\/bank\.json$/},()=>({path:"question-bank",namespace:"speaking-data"}));
    builder.onLoad({filter:/.*/,namespace:"speaking-data"},()=>({contents:`
      const response=await fetch(new URL("../content/bank.json?v=${bankVersion}",import.meta.url));
      if(!response.ok)throw new Error("题库加载失败");
      export default await response.json();
    `}));
  }}],
});

const scriptVersion=await contentVersion("assets/notebook.js");
const template=await readFile(path.join(source,"github-pages/index.html"),"utf8");
const cssVersion=await contentVersion("assets/notebook.css");
const index=template.replaceAll("./assets/notebook.js","./assets/notebook.js?v="+scriptVersion).replaceAll("./assets/notebook.css","./assets/notebook.css?v="+cssVersion);
await writeFile(path.join(target,"index.html"),index);
