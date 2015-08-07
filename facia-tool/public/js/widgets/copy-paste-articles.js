import ko from 'knockout';
import copiedArticle from 'modules/copied-article';
import BaseWidget from 'widgets/base-widget';

export default class CopyPasteArticles extends BaseWidget {
    constructor(baseModel) {
        super();

        baseModel.isPasteActive = ko.observable(false);
        this.listenOn(copiedArticle, 'change', hasArticle => baseModel.isPasteActive(hasArticle));
    }
}
