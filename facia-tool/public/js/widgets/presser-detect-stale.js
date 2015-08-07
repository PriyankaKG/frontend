import ko from 'knockout';
import mediator from 'utils/mediator';
import BaseWidget from 'widgets/base-widget';

export default class AutoComplete extends BaseWidget {
    constructor() {
        super();

        this.alert = ko.observable(false);

        this.listenOn(mediator, 'presser:stale', message => this.alert(message));
        this.listenOn(mediator, 'capi:error', message => this.alert(message));
    }

    pressLiveFront() {
        this.clearAlerts();
        mediator.emit('presser:live');
    }

    clearAlerts() {
        this.alert(false);
        mediator.emit('alert:dismiss');
    }
}
