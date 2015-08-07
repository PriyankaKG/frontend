import Promise from 'Promise';
import BaseClass from 'models/base-class';
import mediator from 'utils/mediator';

class BaseWidget extends BaseClass {
    constructor() {
        super();
        Promise.resolve().then(() => {
            mediator.emit('widget:load', this);
        });
    }
}

export default BaseWidget;
