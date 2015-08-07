import ko from 'knockout';
import _ from 'underscore';
import Promise from 'Promise';
import * as vars from 'modules/vars';
import {register} from 'models/widgets';
import * as wait from 'test/utils/wait';

export default function (html) {
    register();
    const DOM_ID = 'test_dom_' + Math.round(Math.random() * 10000);

    document.body.innerHTML += `
        <div id="${DOM_ID}">
            ${html}
        </div>
    `;

    let container = document.getElementById(DOM_ID);
    return {
        container,
        apply: (model, waitWidget) => {
            return new Promise(resolve => {
                _.defaults(model, {
                    testColumn: { registerMainWidget: () => {}},
                    identity: { email: 'someone@theguardian.com' },
                    isPasteActive: ko.observable(),
                    frontsList: ko.observableArray()
                });

                if (waitWidget) {
                    wait.event('widget:load').then(resolve);
                } else {
                    setTimeout(resolve, 10);
                }
                vars.setModel(model);
                ko.applyBindings(model, container);
            });
        },
        dispose: () => {
            ko.cleanNode(container);
            container.parentNode.removeChild(container);
        }
    };
}
