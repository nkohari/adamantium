import * as ts from 'typescript';
import * as util from 'util';
import {createProject} from './lang';
import {createPlan, findStubMethodCalls, rewriteStubMethodCalls} from './tasks';

function inspect(obj, depth = null) {
  console.log(util.inspect(obj, false, depth, false));
}

let project = createProject(process.argv.slice(2), {
  outDir: '.output',
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});

const calls = findStubMethodCalls(project);
const plan = createPlan(project, calls);
