define('app/views/script_add', ['app/views/controlled'],
    //
    //  Script Add View
    //
    //  @returns Class
    //
    function(ControlledComponent) {

        'use strict';

        var DEFAULT_URL = 'http://';
        var DEFAULT_GITHUB_URL = 'https://github.com/owner/repo';
        var DEFAULT_SCRIPT = '#!/bin/bash\necho "hello world"';
        var DEFAULT_ANSIBLE_SCRIPT = '- name: Dummy ansible playbook\n' +
            '   hosts: localhost\n' +
            '   tasks:\n' +
            '    - name: Dummy task\n' +
            '      debug:\n' +
            '        msg: "Hello World"\n';

        return App.ScriptAddComponent = ControlledComponent.extend({

            //
            //  Properties
            //

            layoutName: 'script_add',
            controllerName: 'scriptAddController',

            scriptTypes: [{
                label: 'Ansible Playbook',
                value: 'ansible'
            }, {
                label: 'Executable',
                value: 'executable'
            }],

            scriptSources: [{
                label: 'Github',
                value: 'github'
            }, {
                label: 'URL',
                value: 'url',
            }, {
                label: 'Inline',
                value: 'inline'
            }],

            scriptSchedulers: [{
                label: 'Now',
                value: 'now'
            }, {
                label: 'One-Off',
                value: 'one_off',
            }, {
                label: 'Interval',
                value: 'interval'
            }, {
                label: 'Crontab',
                value: 'crontab'
            }],

            scriptPeriods: [{
                label: 'seconds',
                limit: 60,
            }, {
                label: 'minutes',
                limit: 60
            }, {
                label: 'hours',
                limit: 24
            }, {
                label: 'days',
                limit: 30
            }],
            scriptEveryOptions: [],


            //
            //  Computed Properties
            //

            isReady: function() {
                var script = Mist.scriptAddController.get('newScript');
                var name = script.get('name');
                var type = script.get('type');
                var source = script.get('source');
                if (!type || !source || !name)
                    return false;
                if (source.value == 'inline')
                    return script.get('script');
                return script.get('url');
            }.property(
                'Mist.scriptAddController.newScript.name',
                'Mist.scriptAddController.newScript.source',
                'Mist.scriptAddController.newScript.type',
                'Mist.scriptAddController.newScript.url',
                'Mist.scriptAddController.newScript.script'
            ),

            isInline: function() {
                return Mist.scriptAddController.newScript.source.value == 'inline';
            }.property('Mist.scriptAddController.newScript.source'),

            isURL: function() {
                return Mist.scriptAddController.newScript.source.value == 'url';
            }.property('Mist.scriptAddController.newScript.source'),

            isGitHub: function() {
                return Mist.scriptAddController.newScript.source.value == 'github';
            }.property('Mist.scriptAddController.newScript.source'),

            isOneOff: function() {
                return Mist.scriptAddController.newScript.scheduler.value == 'one_off';
            }.property('Mist.scriptAddController.newScript.scheduler'),

            isInterval: function() {
                return Mist.scriptAddController.newScript.scheduler.value == 'interval';
            }.property('Mist.scriptAddController.newScript.scheduler'),

            isCron: function() {
                return Mist.scriptAddController.newScript.scheduler.value == 'crontab';
            }.property('Mist.scriptAddController.newScript.scheduler'),

            load: function() {
                Ember.run.next(function() {
                    $("#add-script").collapsible({
                        expand: function(event, ui) {
                            Mist.scriptAddController.open();

                            var id = $(this).attr('id'),
                                overlay = id ? $('#' + id + '-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('ui-screen-hidden').addClass('in');
                            }
                            $(this).children().next().hide();
                            $(this).children().next().slideDown(250);
                        }
                    });
                });
            }.on('didInsertElement'),


            unload: function() {
                Ember.run.next(function() {
                    $("#add-script").collapsible({
                        collapse: function(event, ui) {
                            Mist.scriptAddController.close();

                            $(this).children().next().slideUp(250);
                            var id = $(this).attr('id'),
                                overlay = id ? $('#' + id + '-overlay') : false;
                            if (overlay) {
                                overlay.removeClass('in').addClass('ui-screen-hidden');
                            }
                        }
                    });
                });
            }.on('willDestroyElement'),


            //
            //  Methods
            //

            clear: function() {
                this.closeDropdown('type');
                this.closeDropdown('source');
            },

            renderFields: function() {
                Ember.run.schedule('afterRender', this, function() {
                    $('body').enhanceWithin();
                });
            },

            selectType: function(type) {
                this.closeDropdown('type');
                Mist.scriptAddController.get('newScript').set('type', type);
                this.setScript();
            },

            setScript: function() {
                var newScript = Mist.scriptAddController.get('newScript');
                var type = newScript.get('type');
                if (type.value == 'ansible')
                    newScript.set('script', DEFAULT_ANSIBLE_SCRIPT);
                if (type.value == 'executable')
                    newScript.set('script', DEFAULT_SCRIPT);
            },

            selectSource: function(source) {
                this.closeDropdown('source');
                this.showSourceBundle(source);
                var newScript = Mist.scriptAddController.get('newScript');
                newScript.set('source', source);
                if (source.value == 'url')
                    newScript.set('url', DEFAULT_URL);
                if (source.value == 'github')
                    newScript.set('url', DEFAULT_GITHUB_URL);
                if (source.value == 'inline')
                    this.setScript();

                this.renderFields();
            },

            selectScheduler: function(scheduler) {
                this.closeDropdown('scheduler');
                Mist.scriptAddController.get('newScript').set('scheduler', scheduler);
                this.renderFields();
            },

            selectPeriod: function(period) {
                this.closeDropdown('period');
                Mist.scriptAddController.setProperties({
                    'newScript.interval.period': period,
                    'newScript.interval.every': 1
                });
                this.setEveryOptions(period.limit, 1);
                this.renderFields();
            },

            selectEvery: function(every) {
                this.closeDropdown('every');
                Mist.scriptAddController.get('newScript').set('interval.every', every);
                this.renderFields();
            },

            closeDropdown: function(el) {
                this.$('#script-add-' + el + ' .mist-select').collapsible('collapse');
            },

            setEveryOptions: function(end, start, step) {
                var start = start || 0,
                    step = step || 1,
                    result = [],
                    item = start;

                while (item <= end) {
                    result.push(item);
                    item += step;
                }

                this.set('scriptEveryOptions', result);
            },

            showSourceBundle: function(source) {
                this.$('.' + source.value).slideDown();
                this.$('#script-add-description').slideDown();
            },


            //
            //  Actions
            //

            actions: {
                clickOverlay: function() {
                    $('#add-script').collapsible('collapse');
                },

                selectType: function(type) {
                    this.selectType(type);
                },

                selectSource: function(source) {
                    this.selectSource(source);
                },

                selectScheduler: function(scheduler) {
                    this.selectScheduler(scheduler);
                },

                selectPeriod: function(period) {
                    this.selectPeriod(period);
                },

                selectEvery: function(every) {
                    this.selectEvery(every);
                },

                backClicked: function() {
                    Mist.scriptAddController.close();
                },

                addClicked: function() {
                    Mist.scriptAddController.add();
                }
            },
        });
    }
);
