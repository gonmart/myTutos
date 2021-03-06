Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    items: [
        {
            xtype: 'container',
            itemId: 'pulldown-container',            
            layout: {
                type: 'hbox',
                align: 'stretch'
            }
        }
    ],

    myDefectStore: undefined,
    myGrid: undefined,

    launch: function() {
        this._loadIterations();
    },

    //Create Iteration ComboBox
    _loadIterations: function(){
        var iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            itemId: 'iteration-combobox',
            fieldLabel: 'Iteration',
            labelAlign: 'right',
            width: 400,
            listeners: {
                ready: this._loadSeverities,
                select: this._loadData,
                scope: this
            }
        });
        
        this.down('#pulldown-container').add(iterComboBox); 
    },

    //Create Severity field ComboBox
    _loadSeverities: function() {
        var severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            itemId: 'severity-combobox',
            model: 'Defect',
            field: 'Severity',
            fieldLabel: 'Severity',
            labelAlign: 'right',
            listeners: {
                ready: this._loadData,
                select: this._loadData,
                scope: this
            }
        });
        
        this.down('#pulldown-container').add(severityComboBox);
    },

    //Construct Filters for Defects
    _getFilters: function(iterationValue, severityValue) {
        var iterationFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'Iteration',
            operation: '=',
            value: iterationValue
        });

        var severityFilter = Ext.create('Rally.data.wsapi.Filter',{
            property: 'Severity',
            operation: '=',
            value: severityValue
        });

        return iterationFilter.and(severityFilter);
    },

    //Get Data from Rally    
    _loadData: function() {
        var selectedIterRef = this.down('#iteration-combobox').getRecord().get("_ref");    
        var selectedSeverityValue = this.down('#severity-combobox').getRecord().get("value");

        console.log("Iteration info: ", this.down('#iteration-combobox').getRecord());

        var myFilters = this._getFilters(selectedIterRef, selectedSeverityValue);
        
        //if store exists, just load new data
        if(this.defectStore){
            this.defectStore.setFilter(myFilters);
            this.defectStore.load();
        } else {
            this.defectStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'Defect',
                autoLoad: true,
                filters: myFilters,
                listeners: {
                    load: function(defectStore) {
                        if(!this.myGrid){
                            this._createGrid(defectStore);
                        }
                    },
                    scope: this 
                },
                fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']
            });
        } 
    },


    //Create and Show a Grid of given stories
    _createGrid: function(myDefectStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myDefectStore,
            columnCfgs: [
                'FormattedID', 'Name', 'Severity', 'Iteration'
            ]
        });        
        this.add(this.myGrid); 
    }
    
});
