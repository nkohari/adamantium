import * as ts from 'typescript';
import {Plan} from './model';
import {createProject, createInspector} from './framework';
import {findMagicMethodCalls, resolveDependencyGraph, augmentSource} from './tasks';
let {sys} = ts;

let project = createProject(process.argv.slice(2), {
  outDir: '.output',
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});

const inspector = createInspector(project);

const plan = new Plan();
findMagicMethodCalls(project, plan);
resolveDependencyGraph(project, plan);

sys.write(JSON.stringify(inspector.inspectPlan(plan), null, 2) + sys.newLine);

augmentSource(project, plan);
project.emit();
