import * as Lint from 'tslint';
import * as ts from 'typescript';
import {sprintf} from 'sprintf-js';
import {ComponentMetadata} from './angular/metadata';
import {Failure} from './walkerFactory/walkerFactory';
import {all, validateComponent} from './walkerFactory/walkerFn';
import {Maybe, F2} from './util/function';
import {IOptions} from 'tslint';
import {Ng2Walker} from './angular/ng2Walker';

export class Rule extends Lint.Rules.AbstractRule {

  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'component-class-suffix',
    type: 'style',
    description: `Classes decorated with @Component must have suffix "Component" (or custom) in their name.`,
    descriptionDetails: `See more at https://angular.io/styleguide#!#02-03.`,
    rationale: `Consistent conventions make it easy to quickly identify and reference assets of different types.`,
    options: {
      type: 'array',
      items: {
        type: 'string',
      }
    },
    optionExamples: [
      `true`,
      `[true, "Component", "View"]`
    ],
    optionsDescription: `Supply a list of allowed component suffixes. Defaults to "Component".`,
    typescriptOnly: true,
  };

    static FAILURE: string = 'The name of the class %s should end with the suffix %s ($$02-03$$)';

    static walkerBuilder: F2<ts.SourceFile, IOptions, Ng2Walker> =
        all(
            validateComponent((meta: ComponentMetadata, suffixList?: string[]) =>
                Maybe.lift(meta.controller)
                    .fmap(controller => controller.name)
                    .fmap(name => {
                        const className = name.text;
                        const _suffixList = suffixList.length > 0 ? suffixList : ['Component'];
                        if (!Rule.validate(className, _suffixList)) {
                            return [new Failure(name, sprintf(Rule.FAILURE, className, _suffixList))];
                        }
                    })
            ));

    static validate(className: string, suffixList: string[]): boolean {
      return suffixList.some(suffix => className.endsWith(suffix));
    }

    public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
        return this.applyWithWalker(
            Rule.walkerBuilder(sourceFile, this.getOptions())
        );
    }
}


