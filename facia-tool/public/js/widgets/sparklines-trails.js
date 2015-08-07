import ko from 'knockout';
import * as sparklines from 'utils/sparklines';
import BaseWidget from 'widgets/base-widget';

export default class CopyPasteArticles extends BaseWidget {
    constructor(baseModel) {
        super();

        baseModel.isSparklinesEnabled = ko.pureComputed(() => sparklines.isEnabled());
    }
}
