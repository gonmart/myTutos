Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
        //Everything starts HERE!

        this.pulldownContainer = Ext.create('Ext.container.Container', {
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

        var myStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'Defect',
            autoLoad: true,
            filters: [{
                property: 'Iteration',
                operation: '=',
                value: selectedIterRef
            },{
                property: 'Severity',
                operation: '=',
                value: selectedSeverityValue
            }],
            listeners: {
                load: function(myStore, myData, success) {
                    this._loadGrid(myStore);
                },
                scope: this 
            },
            fetch: ['FormattedID', 'Name', 'Severity', 'Iteration']
        });
    },


    //Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore) {
        var myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                'FormattedID', 'Name', 'Severity', 'Iteration'
            ]
        });        
        this.add(myGrid); //Adding the Grid in Screen
    }
    
   
});
