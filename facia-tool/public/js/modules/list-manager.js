import _ from 'underscore';
import {CONST} from 'modules/vars';
import mediator from 'utils/mediator';
import alert from 'utils/alert';
import urlAbsPath from 'utils/url-abs-path';
import removeById from 'utils/remove-by-id';

function alertBadContent(msg) {
    alert(msg ? msg : 'Sorry, but you can\'t add that item');
}

export default class ListManager {
    constructor(newItems) {
        var listeners = mediator.scope();
        listeners.on('collection:updates', (opts) => {

            var options = _.extend({}, opts, newItems);
            if (opts.alternateAction) {
                this.alternateAction(options);
            } else {
                this.listManager(options);
            }
        });
        this.listeners = listeners;
    }

    dispose() {
        this.listeners.dispose();
    }

    listManager(opts) {
        var position,
            newItems,
            insertAt;

        if (opts.mediaItem) {
            if (_.isFunction(opts.mediaHandler)) {
                opts.mediaHandler(opts);
            } else {
                alertBadContent('Unhandled media item');
            }
            return;
        }

        position = opts.targetItem && _.isFunction(opts.targetItem.id) ? opts.targetItem.id() : undefined;

        removeById(opts.targetGroup.items, urlAbsPath(opts.sourceItem.id));

        insertAt = opts.targetGroup.items().indexOf(opts.targetItem) + (opts.isAfter || 0);
        insertAt = insertAt === -1 ? opts.targetGroup.items().length : insertAt;

        newItems = opts.newItemsConstructor(opts.sourceItem.id, opts.sourceItem, opts.targetGroup);

        if (!newItems[0]) {
            alertBadContent();
            return;
        }

        opts.targetGroup.items.splice(insertAt, 0, newItems[0]);

        opts.newItemsValidator(newItems, opts.targetContext)
        .fail(function(err) {
            _.each(newItems, function(item) { opts.targetGroup.items.remove(item); });
            alertBadContent(err);
        })
        .done(function() {
            if (opts.targetGroup.parent) {
                opts.newItemsPersister(newItems, opts.sourceContext, opts.sourceGroup, opts.targetContext, opts.targetGroup, position, opts.isAfter);
            }
        });
    }

    alternateAction(opts) {
        if (opts.targetGroup.parentType === 'Article') {
            var id = urlAbsPath(opts.sourceItem.id);

            if (id.indexOf(CONST.internalContentPrefix) !== 0) {
                return;
            }

            var newItems = opts.newItemsConstructor(urlAbsPath(id), null, opts.targetGroup);

            if (!newItems[0]) {
                alertBadContent();
                return;
            }

            opts.mergeItems(newItems[0], opts.targetGroup.parent, opts.targetContext);
        }
    }
}
