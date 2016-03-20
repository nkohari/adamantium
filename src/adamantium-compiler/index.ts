import * as ts from 'typescript';
import * as util from 'util';
import {Plan, createProject, createInspector} from './framework';
import {findMagicMethodCalls, resolveDependencyGraph, augmentSource} from './tasks';

let project = createProject(process.argv.slice(2), {
  outDir: '.output',
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});

const inspector = createInspector(project);

const plan = new Plan();
findMagicMethodCalls(project, plan);
resolveDependencyGraph(project, plan);

console.log('Plan:', util.inspect(inspector.inspectPlan(plan), false, null));

augmentSource(project, plan);
project.emit();
