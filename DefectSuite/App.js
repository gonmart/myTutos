Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    items: [
        {
            xtype: 'container',
            Id: 'pulldown-container',
            itemId: 'pulldown-container',
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        }
    ],

    myDefecfStore: undefined,
    myGrid: undefined,

    launch: function() {
        this._loadDefectSuites();
    },

    //Load Defect Suites in Combobox
    _loadDefectSuites: function() {
        var dsuiteCombobox = Ext.create ('Rally.ui.combobox.ArtifactSearchComboBox', {
            itemId: 'defectsuite-combobox',
            fieldLabel: 'Defect Suite: ',
            labelAlign: 'right',
            storeConfig: {
                autoload: true, 
                models: ['DefectSuite'],
                sorters: {
                    property: 'FormattedID',
                    direction: 'DESC'
                }
            },
            listeners: {
                ready: this._loadData,
                select: this._loadData,
                afterrender: this._loadData,
                scope: this
            }
        });

        this.down('#pulldown-container').add(dsuiteCombobox);
    },

    // Create the Filters
    _getFilters: function(SelDefectSuite){

        var defectSuiteFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'DefectSuites',
            operator: 'contains',
            value: SelDefectSuite
        });

        return defectSuiteFilter;

    },

    //Load Data
    _loadData: function() {

        var selectedDS = this.down("#defectsuite-combobox").getValue();
        var myFilters = this._getFilters(selectedDS);

        if(this.cargoStore){            
            this.cargoStore.setFilter(myFilters);
            this.cargoStore.load();
        } else {
            this.cargoStore = Ext.create('Rally.data.wsapi.artifact.Store', {
                models: ['Defect'],
                fetch: ['FormattedID', 'Name', 'ScheduleState','State','Milestones', 'Project','Blocked','DefectSuites', 'Resolution'],
                autoLoad: true,
                filters: myFilters,
                limit: Infinity,
                listeners: {
                    load: function(cargoStore) {
                        if(!this.myGrid){
                            this._createGrid(cargoStore);
                        }
                    },
                    scope: this
                },
                context: {
                    projectScopeDown: true
                }
            });
            
        }
    },


    //Create Grid
    _createGrid: function(Cargo) {

        this.myGrid = Ext.create('Rally.ui.grid.Grid',{
            store: Cargo,
            enableRanking: true,
            defaultSortToRank: true,
            columnCfgs: [
                'FormattedID','Name','ScheduleState','State','Milestone','Project','Blocked','Resolution'
            ],
            plugins: [
                'rallyprint'
            ]
        });

        this.add(this.myGrid);

    },


});
