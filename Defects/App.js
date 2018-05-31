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
        this._loadMilestones();
    },


    //Load Milestones in Combobox
    _loadMilestones: function(){
        var mileCombobox = Ext.create('Rally.ui.combobox.MilestoneComboBox', {
            itemId: 'milestone-combobox',
            hideLabel: false,
            fieldLabel: 'Milestone: ',
            labelAlign: 'right',
            width: 300,
            listeners: {
                ready: this._loadDefectSuites,
                select: this._loadData,
                scope: this
            }
        });        

        this.down("#pulldown-container").add(mileCombobox);
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
    _getFilters: function(SelMilestone, SelDefectSuite){

        var milestoneFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'Milestones',
            operator: '=',
            value: SelMilestone
        });

        var defectSuiteFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'DefectSuites',
            operator: 'contains',
            value: SelDefectSuite
        });

        if(_.isNull(SelDefectSuite)) {
            return milestoneFilter;
        } else {
            return milestoneFilter.or(defectSuiteFilter);
        }

    },



    //Load Data
    _loadData: function() {

        var selectedMilestone = this.down("#milestone-combobox").getRecord().get("_ref");
        var selectedDS = this.down("#defectsuite-combobox").getValue();

        var myFilters = this._getFilters(selectedMilestone, selectedDS);

        if(this.cargoStore){            
            this.cargoStore.setFilter(myFilters);
            this.cargoStore.load();
        } else {
            this.cargoStore = Ext.create('Rally.data.wsapi.artifact.Store', {
                models: ['UserStory','Defect'],
                fetch: ['FormattedID', 'Name', 'ScheduleState','Milestones', 'DefectSuites'],
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
                'FormattedID','Name','ScheduleState','Milestones', 'DefectSuites'
            ]
        });

        this.add(this.myGrid);

    },


});
