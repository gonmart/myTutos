Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'iteration',

    comboboxConfig: {
        hideLabel: false,
        fieldLabel: 'Iteration: ',
        labelAlign: 'right'
    },

    myStore: undefined,
    myGrid: undefined,

    //launch function
    onScopeChange: function (scope) {
        this._myStore(scope);
    },

    //Custom function to define filters
    _myFilters: function (scope) {
        var iterationFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'Iteration',
            operator: '=',
            value: scope.getRecord() ? scope.getRecord().get('_ref') : null
        });

        var finalFilters = iterationFilter;
        return finalFilters;
    },

    //Custom function to define the Store
    _myStore: function(scope) {
        var myFilters = this._myFilters(scope);
        console.log("Filter", myFilters.toString());

        if (this.myStore) {
            this.myStore.setFilter(myFilters);
            this.myStore.load();
        } else {
            this.myStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'User Story',
                autoLoad: true,
                limit: Infinity,
                filters: myFilters,
                groupField: 'c_CapacityAllocation',
                context: {
                    project: '/project/208454338752',
                    projectScopeDown: true,
                    projectScopeUp: false
                },
                fetch: [
                    'FormattedID',
                    'Name',
                    'PlanEstimate', 
                    'Iteration',
                    'c_CapacityAllocation',
                    'Project'
                ],
                listeners: {
                    scope: this,
                    load: function(myStore){
                        this._onLoadLogic(myStore);
                    }
                },
                sorters: [{
                    property: 'FormattedID',
                    direction: 'DESC'
                }]
            });
        }
        
    },

    _onLoadLogic: function(store) {
        
        var groups = store.getGroups();

        _.forEach(groups, function (group) {
            var list = _.pluck(group.children, 'raw');

            group['Functional Stories'] = _.chain(list)
                .where({
                    c_CapacityAllocation: 'Functional Stories'
                })
                .size()
                .value();
            
            group['Production Support'] = _.chain(list)
                .where({
                    c_CapacityAllocation: 'Production Support'
                })
                .size()
                .value();

            group['Small Enhancements | Analytics'] = _.chain(list)
                .where({
                    c_CapacityAllocation: 'Small Enhancements | Analytics'
                })
                .size()
                .value();

            group['Technical Design and Code Review'] = _.chain(list)
                .where({
                    c_CapacityAllocation: 'Technical Design and Code Review'
                })
                .size()
                .value();

            group['Telemetry |Performance'] = _.chain(list)
                .where({
                    c_CapacityAllocation: 'Telemetry |Performance'
                })
                .size()
                .value();

            group['Weekly Release Support'] = _.chain(list)
                .where({
                    c_CapacityAllocation: 'Weekly Release Support'
                })
                .size()
                .value();

            group['None'] = _.chain(list)
                .where({
                    c_CapacityAllocation: ''
                })
                .size()
                .value();

            group['total'] = list.length;

        });

        this._data = groups;
        this._export && this._export.destroy(); //make sure _export exist, if so, then destroy it. REplacing the if.
        this._export = Ext.create('Ext.container.Container', {
            html: [
                '<table id="dt-table" class="table table-bordered table-hover table-condensed" style="width:50%">',
                '<tfoot>',
                '<th></th>',
                '<th></th>',
                '</tfoot>',
                '</table>'
            ].join('')
        });
        this._export.on('boxready', this._myGrid, this);
        this.add(this._export);
    },

    //Create Grid
    _createGrid: function(Cargo) {

        var myColumns = [{
            title: "Name",
            data: "name",
            defaultContent: '',
            className: ''
        },
        {
            title: "Submitted",
            data: "Submitted",
            defaultContent: '',
            className: 'dt-center'
        },
        {
            title: "Open",
            data: "Open",
            defaultContent: '',
            className: 'dt-center'
        },
        {
            title: "Resolved",
            data: "Resolved",
            defaultContent: '',
            className: 'dt-center'
        },
        {
            title: "Rejected",
            data: "Rejected",
            defaultContent: '',
            className: 'dt-center'
        },
        {
            title: "Closed",
            data: "Closed",
            defaultContent: '',
            className: 'dt-center'
        },
        {
            title: "Total",
            data: "total",
            defaultContent: '',
            className: 'dt-center'
        }
    ];

    
        this._dt = $('#dt-table').DataTable({
            data: this._data,
            dom: 'rt',
            columns: myColumns,

            paging: false,
            ordering: false,
            info: false, 

            //scrollY: "300px",
            //scrollCollapse: true,
            //scrollX: true,

            footerCallback: function () {
                var api = this.api();
                var column = api.column(0);

              
                //display the footer only when data is available
                if(api.data().count() > 0){
                    $(column.footer()).html('<strong>Total</strong>');
                }
                
                api.columns([1,2,3,4,5,6]).every(function () {
                    
                    //display totals only when data is available                        
                    if(this.data().count() > 0) {
                        var sum = this
                            .data()
                            .reduce(function (a, b) {
                                return a + b;
                            });

                        $(this.footer()).html('<strong>' + sum + '</strong>');
                    }
                    
                });
                
            }
        });






        /*
        this.myGrid = Ext.create('Rally.ui.grid.Grid',{
            store: Cargo,
            enableRanking: true,
            defaultSortToRank: true,
            columnCfgs: [
                'FormattedID','Name','PlanEstimate','Iteration', 'c_CapacityAllocation','Project'
            ],
            plugins: [
                'rallyprint'
            ]
        });

        this.add(this.myGrid);
        */
    },

});
