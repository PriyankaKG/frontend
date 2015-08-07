import ko from 'knockout';
import _ from 'underscore';
import * as vars from 'modules/vars';
import BaseWidget from 'widgets/base-widget';

export default class CopyPasteArticles extends BaseWidget {
    constructor(baseModel) {
        super();

        baseModel.types = ko.observableArray(_.pluck(vars.CONST.types, 'name'));
    }
}
