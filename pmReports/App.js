Ext.define('CustomApp', {
    extend: 'Rally.app.TimeboxScopedApp',
    componentCls: 'app',
    scopeType: 'release',

    onScopeChange: function(timeboxScope) {
      
        Ext.create('Rally.data.wsapi.artifact.Store', {
            models: ['PortfolioItem/Feature'],
            autoLoad: true,
            fetch: ['FormattedID', 'Name', 'Parent','Project','Owner','PreliminaryEstimateValue','RefinedEstimate','c_FundingType'],
            filters: timeboxScope.getQueryFilter(),
            limit: Infinity,
            listeners: {
                load: this._onLoadingData,
                scope: this
            },
            groupField: 'Project',
            getGroupString: function (instance) {                
                return instance.get('Parent') ? instance.get('Parent').FormattedID + ' - ' + instance.get('Parent').Name : 'None';
            }
        });
    },

    launch: function() {
        this.add([
            {
                xtype: 'container',
                itemId: 'display_box'
            }
        ]);
        this.callParent(arguments);
    },

    _onLoadingData: function(store, records){
        var timeboxInformation = this.getContext().getTimeboxScope().record.data; 
        var groups = store.getGroups();

        //var initiattiveInformation = this._getInitiativeData(records,timeboxInformation);
        var initiattiveInformation = this._getInitiativeData(groups,timeboxInformation);

        this.down('#display_box').removeAll();
        this._addTable(initiattiveInformation, this._getHeadersColumnCfgs());
        
    },

    _addTable: function (stateData, columnCfgs) {                    
        var grid = Ext.create('Rally.ui.grid.Grid', {
            store: Ext.create('Rally.data.custom.Store', {
                data: stateData,
                sorters: [{ sorterFn: function compare(a, b) {
                    if (a.data.loe < b.data.loe) {
                      return -1;
                    }
                    if (a.data.loe > b.data.loe) {
                      return 1;
                    }
                    return 0;
                  },
                  direction: 'desc'}]
            }),
            columnCfgs: columnCfgs,
            showPagingToolbar: false,
            padding: 15,
            enableEditing: false,
            enableBulkEdit: false            
        });       
        this.down('#display_box').add(grid);
    },

    _getInitiativeData: function (records, releaseInformation){
        var data = [],
            totalLOE = 0,
            totalCapex = 0,
            totalOpex = 0,
            totalUndefined = 0,
            vOwner = '';

        _.each(records, function(actual) {  
            
            var groupdata = {
                initiatives: actual.name ? actual.name : 'No Name',
                owner: 0,
                loe: 0,
                capex: 0,
                opex: 0,
                undefined: 0
            };
    
            totalCapex = 0;
            totalOpex = 0;
            totalUndefined = 0;
            totalLOE = 0;

            _.each(actual.children, function (record){
                groupdata.owner = record.get('Parent') ? record.get('Parent').Owner ? record.get('Parent').Owner._refObjectName : '' : '';

                if(record.get("c_FundingType") === 'CapEx') {
                    totalCapex += record.get('RefinedEstimate') || record.get('PreliminaryEstimateValue');
                } else if(record.get("c_FundingType") === 'Opex') {                    
                    totalOpex += record.get('RefinedEstimate') || record.get('PreliminaryEstimateValue');
                }  else {
                    totalUndefined += record.get('RefinedEstimate') || record.get('PreliminaryEstimateValue');
                }

                totalLOE += record.get('RefinedEstimate') || record.get('PreliminaryEstimateValue');               

            })

            groupdata.loe = totalLOE || 0;
            groupdata.capex = totalCapex || 0;
            groupdata.opex = totalOpex || 0;
            groupdata.undefined = totalUndefined || 0;

            data.push(groupdata);

        });
        
        return data;

    },

    _getHeadersColumnCfgs: function() {
        return [{
            dataIndex: 'initiatives',
            text: 'Initiatives',
            flex: 1
        },{
            dataIndex: 'owner',
            text: 'Owner'
        },{
            dataIndex: 'loe',
            text: 'LOE'
        },{
            dataIndex: 'capex',
            text: 'CapEx'
        },{
            dataIndex: 'opex',
            text: 'OpEx'
        },{
            dataIndex: 'undefined',
            text: 'Undefined'
        }];
    },

});
