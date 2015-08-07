import ko from 'knockout';
import _ from 'underscore';
import Promise from 'Promise';
import findFirstById from 'utils/find-first-by-id';
import Front from 'models/config/front';
import frontCount from 'utils/front-count';
import ColumnWidget from 'widgets/column-widget';

export default class FrontConfig extends ColumnWidget {
    constructor(params, element) {
        super(params, element);
        this.pinnedFront = ko.observable();
        this.fronts = ko.observableArray();
        this.collections = ko.observableArray();

        this.populate();
        this.subscribeOn(this.baseModel.state, this.populate);
        this.loaded = Promise.resolve();
    }

    populate() {
        this.fronts(
            _.chain(this.baseModel.frontsList())
            .map(config => {
                let existingFront = findFirstById(this.fronts, config.id);
                if (existingFront){
                    existingFront.updateConfig(config);
                    return existingFront;
                } else {
                    return new Front(config);
                }
            })
            .value()
        );
    }

    createFront() {
        var front, num = frontCount(this.baseModel.state().config.fronts, this.baseModel.priority);

        if (num.count < num.max) {
            front = new Front({priority: this.baseModel.priority, isHidden: true});
            front.setOpen(true);
            this.pinnedFront(front);
            this.fronts.unshift(front);
        } else {
            window.alert('The maximum number of fronts (' + num.max + ') has been exceeded. Please delete one first, by removing all its collections.');
        }
    }

    openFront(front) {
        _.each(this.fronts(), f => {
            if (f.id() === front.id) {
                f.setOpen(true, false, true);
            } else {
                f.setOpen(false, false, false);
            }
        });
    }
}
