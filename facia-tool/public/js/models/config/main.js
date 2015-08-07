import ko from 'knockout';
import _ from 'underscore';
import * as vars from 'modules/vars';
import View from 'models/view';
import ListManager from 'modules/list-manager';
import cloneWithKey from 'utils/clone-with-key';
import Collection from 'models/config/collection';
import newItems from 'models/config/new-items';
import persistence from 'models/config/persistence';

export default class Config extends View {
    constructor() {
        super();
        this.listManager = new ListManager(newItems);

        this.setModel({
            title: ko.observable((vars.priority || vars.CONST.defaultPriority) + ' fronts configuration'),
            navSections: vars.pageConfig.navSections,
            collectionsMap: {},
            collections: ko.observableArray(),
            fronts: ko.observableArray(),
            pending: ko.observable(),
            types: _.pluck(vars.CONST.types, 'name'),
            priority: vars.priority
        });

        persistence.on('before update', function () {
            this.model.pending(true);
        });
        persistence.on('after update', function () {
            this.emit('config:needs:update', (res) => {
                this.update(res);
                this.model.pending(false);
            });
        });
    }

    update(res) {
        super.update(res);
        var model = this.model,
            config = res.config;

        model.collectionsMap = {};
        _.map(config.collections, (collection, id) => {
            model.collectionsMap[id] = new Collection(cloneWithKey(collection, id));
        });

        model.fronts(
           _.chain(config.fronts)
            .keys()
            .filter(function(id) { return vars.priority === config.fronts[id].priority; })
            .sortBy(function(id) { return id; })
            .filter(function(id) { return id; })
            .map(function(id) {
                return cloneWithKey(config.fronts[id], id);
            })
           .value()
        );
    }
}
