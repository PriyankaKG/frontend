import ko from 'knockout';
import _ from 'underscore';
import $ from 'jquery';
import * as cache from 'modules/cache';
import * as droppable from 'modules/droppable';
import * as vars from 'modules/vars';
import * as widgets from 'models/widgets';
import mediator from 'utils/mediator';
import mockjax from 'test/utils/mockjax';
import textInside from 'test/utils/text-inside';
import inject from 'test/utils/inject';

// Store the original settimeout
var yeld = setTimeout;

describe('Clipboard', function () {
    beforeAll(function () {
        setUpTests();
    });
    beforeEach(function () {
        jasmine.clock().install();
    });
    afterAll(function () {
        clearTests();
    });
    afterEach(function () {
        jasmine.clock().uninstall();
    });

    it('loads items from the history', function (done) {
        function testDraggingAnArticle (clipboard) {
            // Local storage was cleared, the clipboard should be empty
            expect(getArticles().length).toBe(0);

            dragArticle({
                id: 'internal-code/page/first'
            }, clipboard, function () {
                expect(getArticles().length).toBe(1);
                expect(getArticles()[0].headline).toBe('Bananas are yellow');

                // Destroy the clipboard and initialize again
                injectClipboard(testLoadingFromStorage);
            });
        }

        function testLoadingFromStorage (clipboard) {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('Bananas are yellow');

            dragArticle({
                id: 'internal-code/page/first'
            }, clipboard, function () {
                dragArticle({
                    id: 'https://github.com/piuccio',
                    meta: {
                        headline: 'GitHub',
                        snapType: 'link'
                    }
                }, clipboard, testRemovingItems);
            });
        }

        function testRemovingItems (clipboard) {
            expect(getArticles().length).toBe(2);
            expect(getArticles()[0].headline).toBe('Bananas are yellow');
            expect(getArticles()[1].headline).toBe('GitHub');

            // Delete and item and check that it's not in storage anymore
            removeArticle({
                id: 'internal-code/page/first'
            }, clipboard, function () {
                injectClipboard(testLoadingAfterDelete);
            });
        }

        function testLoadingAfterDelete (clipboard) {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('GitHub');

            changeHeadline(0, 'Open Source', clipboard);
            expect(getArticles()[0].headline).toBe('Open Source');

            injectClipboard(testChangingMetadata);
        }

        function testChangingMetadata () {
            expect(getArticles().length).toBe(1);
            expect(getArticles()[0].headline).toBe('Open Source');

            done();
        }

        injectClipboard(testDraggingAnArticle);
    });
});

var injectedClipboard;
function injectClipboard (callback) {
    if (injectedClipboard) {
        injectedClipboard.dispose();
        jasmine.clock().tick(10);
    }

    injectedClipboard = inject(`
        <clipboard-widget params="position: 0, column: $data"></clipboard-widget>
    `);
    injectedClipboard.apply(vars.model, true).then(callback);

    jasmine.clock().tick(10);
}

function getArticles () {
    var articles = [];
    $('trail-widget').each(function (i, elem) {
        articles.push({
            headline: textInside($(elem).find('.element__headline')),
            dom: $(elem)
        });
    });
    return articles;
}

function dragArticle (article, clipboard, callback) {
    mediator.emit('drop', {
        sourceItem: article,
        sourceGroup: null
    }, clipboard.group, clipboard.group);
    // Let knockout refresh the HTML
    yeld(function () {
        jasmine.clock().tick(vars.CONST.detectPendingChangesInClipboard);
        callback(clipboard);
    }, 10);
}

function removeArticle (article, clipboard, callback) {
    var actualArticle = _.find(clipboard.group.items(), function (item) {
        return item.id() === article.id;
    });
    clipboard.group.omitItem(actualArticle);
    yeld(function () {
        jasmine.clock().tick(vars.CONST.detectPendingChangesInClipboard);
        callback(clipboard);
    }, 10);
}

function changeHeadline (position, newHeadline, clipboard) {
    var article = clipboard.group.items()[position];
    article.meta.headline(newHeadline);
    jasmine.clock().tick(vars.CONST.detectPendingChangesInClipboard);
}

var mockjaxId;
function setUpTests () {
    window.localStorage.clear();
    droppable.init();
    widgets.register();
    cache.put('contentApi', 'internal-code/page/first', {
        'webUrl': 'http://theguardian.com/banana',
        'fields': {
            'headline': 'Bananas are yellow'
        }
    });
    if (!vars.model) {
        vars.setModel({
            switches: ko.observable({
                'facia-tool-sparklines': false
            }),
            identity: { email: 'fabio.crisci@theguardian.com' },
            isPasteActive: ko.observable()
        });
    }
    mockjaxId = mockjax({
        url: '/api/proxy/piuccio*',
        responseText: {}
    });
}

function clearTests () {
    droppable.dispose();
    injectedClipboard.dispose();
    mockjax.clear(mockjaxId);
}
