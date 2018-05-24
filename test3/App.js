Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Everything starts HERE!

        //Defining here the Top container for the Comboboxes
        this.pulldownContainer = Ext.create('Ext.container.Container', {
            id: 'pulldown-container-id',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
        });

        this.add(this.pulldownContainer);
        this._loadIterations();
    },

    //Create Iteration ComboBox
    _loadIterations: function(){
        this.iterComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            listeners: {
                ready: function(combobox){
                    //this._loadData();
                    this._loadSeverities();
                },
                select: function(combobox) {
                    this._loadData();
                },
                scope: this
            }
        });
        this.pulldownContainer.add(this.iterComboBox);
    },

    //Create Severity field ComboBox
    _loadSeverities: function() {
        this.severityComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            model: 'Defect',
            field: 'Severity',
            listeners: {
                ready: function(combobox) {
                    this._loadData();
                },
                select: function(combobox) {
                    this._loadData();
                },
                scope: this
            }
        });
        this.pulldownContainer.add(this.severityComboBox);
    },

    //Get Data from Rally    
    _loadData: function() {
        var selectedIterRef = this.iterComboBox.getRecord().get("_ref");    
        var selectedSeverityValue = this.severityComboBox.getRecord().get("value");

        var myFilters = [{
            property: 'Iteration',
            operation: '=',
            value: selectedIterRef
        },{
            property: 'Severity',
            operation: '=',
            value: selectedSeverityValue
        }];

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
                    load: function(defectStore, myData, success) {
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
        this.add(this.myGrid); //Adding the Grid in Screen
    }
    
   
});
