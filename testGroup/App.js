Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'milestone',
    
    comboboxConfig: {
        hideLabel: false,
        fieldLabel: 'Milestone',
        labelAlign: 'right'
    },

    //initializing 
    myDefectStore: undefined,
    myGrid: undefined,

    //launch function
    onScopeChange: function(scope) {
        this._myStore(scope);
    },

    //Custom function to define filters
    _myFilters: function(scope) {
        
        var milestoneFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'Milestones.ObjectID',
            operator: 'contains',
            value: scope.getRecord() ? scope.getRecord().get('ObjectID') : null
        });

        var finalFilters = milestoneFilter;

        return finalFilters;
    },


    //Custom function to define the Store
    _myStore: function(scope) {
    
        var myFilters = this._myFilters(scope);
        var myGroupSelection = 'Project';
        var myModel = 'defect';
        var myFetch = [
            'FormattedID',
            'Name',
            'State',
            'ScheduleState',
            'Priority',
            'Severity',
            'Project',
            'Milestones'
        ];

        if(this.myStore){
            this.myStore.setFilter(myFilters);
            this.myStore.load();
        }else{
            this.myStore = Ext.create('Rally.data.wsapi.Store',{
                model: myModel,
                autoLoad: true, 
                limit: Infinity,
                filters: myFilters,
                groupField: myGroupSelection,
                getGroupString: function(record) {
                    return record.data.Project ? record.data.Project.Name : 'None';
                },
                context: {
                    project: null,
                    projectScopeDown: true
                },
                fetch: myFetch,
                listeners: {
                    scope: this, 
                    load: this._onLoadLogic
                },
                sorters: [{
                    property: 'FormattedID',
                    direction: 'DESC'
                }]
            });
        }

    },

    //Custom function to define and work in business logic
    _onLoadLogic: function(store, records) {
        
        var groups = store.getGroups();

        _.forEach(groups, function(group){
            
            var list = _.pluck(group.children, 'raw');

            group['Submitted'] = _.chain(list)
                .where({state: 'Submitted'})
                .size()
                .value();
            
            group['Open'] = _.chain(list)
                .where({state: 'Open'})
                .size()
                .value();
            
            group['Resolved'] = _.chain(list)
                .where({state: 'Resolved'})
                .size()
                .value();

            group['Rejected'] = _.chain(list)
                .where({state: 'Rejected'})
                .size()
                .value();               
                
            group['Closed'] = _.chain(list)
                .where({state: 'Closed'})
                .size()
                .value();

            group['total'] = list.length;
        })
        
        this._data = groups;
        this._export && this._export.destroy(); //make sure _export exist, if so, then destroy it. REplacing the if.

        this._export = Ext.create('Ext.container.Container', {
            html: [
                '<table id="dt-table" class="table table-bordered table-hover table-condensed">',
                '<tfoot>',
                '<th></th>',
                '<th></th>',
                '<th></th>',
                '<th></th>',
                '<th></th>',
                '<th></th>',
                '<th></th>',
                '</tfoot>',
                '</table>'
              ].join('')
        });
        this._export.on('boxready', this._myGrid, this);
        this.add(this._export);

    },

    //custom function to define and create the visualization
    _myGrid: function() {

    }


});