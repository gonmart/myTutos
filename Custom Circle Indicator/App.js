Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: "app",

    scopeType: 'iteration',

    layout: {
        type: 'hbox',
        pack: 'center'
    },

    onScopeChange: function (timeboxScope) {
        this._wait = new Ext.LoadMask(this, {});
        this.removeAll();

        Ext.create('Rally.data.wsapi.artifact.Store', {
            models: ['userstory', 'defect'],
            autoLoad: true,
            fetch: ['ScheduleState', 'PlanEstimate', 'Project', 'Name',
                'FormattedID', 'Blocked', 'c_Status', 'State'
            ],
            groupField: 'Project',
            getGroupString: function (instance) {
                return instance.get('Project').Name;
            },
            filters: timeboxScope.getQueryFilter(),
            limit: Infinity,
            listeners: {
                load: this._onLoad,
                scope: this
            }
        });
    },

    _onLoad: function (store, records) {
        var groups = store.getGroups();
        var data = {};

        groups.unshift({
            children: records,
            name: this.getContext().getProject().Name
        });

        var slices = [{
            'Deployed': {
                c_Status: 'Deployed'
            },
            'Accepted': {
                c_Status: 'Accepted'
            },
            'Ready for Acceptance': {
                c_Status: 'Ready for Acceptance'
            },
            'UAT': {
                c_Status: 'UAT'
            },
            'SDET Review': {
                c_Status: 'SDET Review'
            },
            'Code Review': {
                c_Status: 'Code Review'
            },
            'QA/SDET': {
                c_Status: 'QA/SDET'
            },
            'Development': {
                c_Status: 'Development'
            },
            'To-Do': {
                c_Status: 'To-Do'
            }
        }, {
            'Deployed': {
                ScheduleState: 'Deployed'
            },
            'Accepted': {
                ScheduleState: 'Accepted'
            },
            'Completed': {
                ScheduleState: 'Completed'
            },
            'In-Progress Blocked': {
                ScheduleState: 'In-Progress',
                'Blocked': true
            },
            'In-Progress': {
                ScheduleState: 'In-Progress',
                'Blocked': false
            }, 
            'Defined': {
                ScheduleState: 'Defined'
            },
            'New': {
                ScheduleState: 'New'
            }
        }, {
            'Open': {
                State: 'Open'
            },
            'Reopened': {
                State: 'Reopened'
            },
            'Resolved': {
                State: 'Resolved'
            },
            'Closed': {
                State: 'Closed'
            },
            'Deferred': {
                State: 'Deferred'
            },
            'Hybrid': {
                State: 'Hybrid'
            },
            'Postponed': {
                State: 'Postponed'
            },
            'Rejected': {
                State: 'Rejected'
            },
            'Submitted': {
                State: 'Submitted'
            }
        }];

        _.each(groups, function (group) {
            var list = _.pluck(group.children, 'raw');

            if (group.name === this.getContext().getProject().Name && list.length !== records.length) {
                return;
            }

            data[group.name] = [{}, {}, {}];
            _.each(slices[0], function (properties, sliceName) {
                data[group.name][0][sliceName] = _.chain(list)
                    .where(properties)
                    .reduce(function (sum, rec) {
                        return sum + rec.PlanEstimate;
                    }, 0)
                    .value();
            });
            _.each(slices[1], function (properties, sliceName) {
                data[group.name][1][sliceName] = _.chain(list)
                    .where(properties)
                    .reduce(function (sum, rec) {
                        return sum + rec.PlanEstimate;
                    }, 0)
                    .value();
            });

            var defectlist = _.filter(list, function (item) {
                return item._type == 'Defect';

            });

            _.each(slices[2], function (properties, sliceName) {
                data[group.name][2][sliceName] = _.chain(defectlist)
                    .where(properties)
                    .reduce(function (sum, rec) {
                        return sum + 1;
                    }, 0)
                    .value();
            });

        }, this);

        this._createChart(data);
    },

    _createChart: function (data) {
        var that = this;
        var colors = [{
            'Deployed': '#006BD3',
            'Accepted': '#FF8200',
            'Ready for Acceptance': '#8DC63F', 
            'SDET Review': '#1E7C00',
            'UAT': '#005EB8',
            'QA/SDET': '#FAD200',
            'Code Review': '#ff5500',
            'Development': '#F6A900', 
            'To-Do': '#337EC6'
        }, {
            'Deployed': '#006BD3',
            'Accepted': '#8dc63f',
            'Completed': '#00a9e0',
            'In-Progress': '#ffc000',
            'In-Progress Blocked': 'red',
            'Defined': '#F0F0F0',
            'New': '#660099'
        }, {
            'Open': 'Red',
            'Reopened': 'Orange',
            'Resolved': 'Gray',
            'Closed': '#8dc63f',
            'Deferred': 'Yellow',
            'Hybrid': 'Blue',
            'Postponed': 'Brown',
            'Rejected': 'Black',
            'Submitted': 'Purple'
        }];
        var wipSlice = 'Development';
        var center = ['50%', '50%'];
        var size = Math.min(window.innerHeight, window.innerWidth);
        that.add(_.map(data, function (group, projectName) {
            
            var outer = group[0];
            var inner = group[1];
            var innerinner = group[2];

            var wip = outer[wipSlice] / _.reduce(outer, function (sum, pts) {
                return sum + pts;
            }, 0);
            var wipColor = 'orange';

            if (wip < 0.12 || wip > 0.38) {
                wipColor = 'red';
            }

            if ((outer['To-Do'] === 0 || wip >= 0.2) && wip <= 0.3) {
                wipColor = 'green';
            }


            //My/Ken's Code
            var outertotal = _.reduce(outer, function (sum, a) {
                return sum + a;
            }, 0);
            // End of my/Ken's Code

            //console.log(projectName, innerinner);

            return Ext.create('Rally.ui.chart.Chart', {
                height: window.innerHeight - 20,
                width: size + 80,
                chartData: {
                    series: [{
                            name: 'Plan Est',
                            data: _.map(outer, function (sum,
                                slice) {
                                return {
                                    name: 'Status: ' +
                                        slice,
                                    y: sum,
                                    color: colors[0][
                                        slice
                                    ]
                                };
                            }),
                            center: center,
                            size: size / 2,
                            innerSize: size / 2 * 0.7,
                            dataLabels: {
                                formatter: function () {
                                    var percentage = +(Math
                                        .round(this.percentage +
                                            'e+1') +
                                        'e-1');
                                    return this.y > 0 ?
                                        this.point.name.substr(
                                            'Status: '.length
                                        ) + '<br>' +
                                        percentage + '%' :
                                        null;
                                }
                            }
                        },
                        {
                            name: 'Plan Est',
                            data: _.map(inner, function (sum,
                                slice) {
                                return {
                                    name: 'Schedule State: ' +
                                        slice,
                                    y: sum,
                                    color: colors[1][
                                        slice
                                    ]
                                };
                            }),
                            center: center,
                            size: size / 2 * 0.7,
                            innerSize: size / 2 * 0.6,
                            dataLabels: {
                                enabled: false
                            }

                        },
                        {
                            name: 'Count',
                            data: _.map(innerinner, function (
                                sum, slice) {
                                return {
                                    name: 'Status: ' +
                                        slice,
                                    y: sum,
                                    color: colors[2][
                                        slice
                                    ]
                                };
                            }),
                            center: center,
                            size: size / 2 * 0.6,
                            innerSize: size / 2 * 0.5,
                            dataLabels: {
                                enabled: false
                            }
                        }

                    ]
                },
                chartConfig: {
                    chart: {
                        type: 'pie'
                    },
                    title: {
                        text: '<strong>' + projectName +
                            '</strong>',
                        floating: true
                    },
                    subtitle: {
                        floating: true,
                        text: 'Dev WIP' +
                            '<br><span style="font-size:' + (size /
                                17) + 'px;color:' + wipColor +
                            ';">' + Math.round((wip * 100) || 0) +
                            '%</span><br>' +
                            outer[wipSlice] + ' of ' + outertotal +
                            '<br>Points',
                        style: {
                            fontSize: (size / 40) + 'px',
                            color: 'black'
                        },
                        verticalAlign: 'middle',
                        y: -window.innerHeight / 30 - window.innerHeight / 40
                    }
                }
            });
        }));
    }
});