import _ from 'underscore';
import ko from 'knockout';
import newItems from 'models/collections/new-items';
import View from 'models/view';
import copiedArticle from 'modules/copied-article';
import modalDialog from 'modules/modal-dialog';
import ListManager from 'modules/list-manager';
import * as vars from 'modules/vars';
import mediator from 'utils/mediator';
import parseQueryParams from 'utils/parse-query-params';
import * as sparklines from 'utils/sparklines';

export default class Fronts extends View {
    constructor() {
        super();
        this.listManager = new ListManager(newItems);

        this.setModel({
            title: ko.observable('fronts'),
            alert: ko.observable(),
            modalDialog: modalDialog,
            fronts: ko.observableArray(),
            isPasteActive: ko.observable(false),
            isSparklinesEnabled: ko.pureComputed(() => {
                return sparklines.isEnabled();
            }),
            pressLiveFront: () => {
                this.model.clearAlerts();
                mediator.emit('presser:live');
            },
            clearAlerts: () => {
                this.model.alert(false);
                mediator.emit('alert:dismiss');
            }
        });

        this.listenOn(mediator, 'presser:stale', message => this.model.alert(message));
        this.listenOn(copiedArticle, 'change', hasArticle => this.model.isPasteActive(hasArticle));
    }

    dispose() {
        this.listManager.dispose();
        super.dispose();
    }

    update(res) {
        super.update(res);
        var fronts;

        var frontInURL = parseQueryParams().front;
        fronts = frontInURL === 'testcard' ? ['testcard'] :
            _.chain(res.config.fronts)
            .map(function(front, path) {
                return front.priority === vars.model.priority ? path : undefined;
            })
            .without(undefined)
            .without('testcard')
            .difference(vars.CONST.askForConfirmation)
            .sortBy(function(path) { return path; })
            .value();

        if (!_.isEqual(this.model.fronts(), fronts)) {
            this.model.fronts(fronts);
        }
    }
}
