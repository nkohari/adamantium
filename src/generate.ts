import * as ts from 'typescript';
import * as util from 'util';
import createProject from './createProject';
import analyze from './analyze';
import augment from './augment';

function inspect(obj, depth = null) {
  console.log(util.inspect(obj, false, depth, false));
}

let project = createProject(process.argv.slice(2), {
  outDir: '.output',
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
})

let analysis = analyze(project);

console.log(`Found ${analysis.forges.length} forges and ${Object.keys(analysis.components).length} components`)
inspect(analysis.components);

augment(project, analysis);
project.emit();
