Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    launch: function() {
         this._loadData(); //this is calling _loadData function 
    },

    //Get Data from Rally    
    _loadData: function() {
        var myStore = Ext.create('Rally.data.wsapi.Store', {
            model: 'User Story',
            autoLoad: true,
            listeners: {
                load: function(myStore, myData, success) {
                    this._loadGrid(myStore); //this is calling _loadGrid function
                },
                scope: this 
            },
            fetch: ['FormattedID', 'Name', 'ScheduleState']
        });
    },


    //Create and Show a Grid of given stories
    _loadGrid: function(myStoryStore) {
        var myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoryStore,
            columnCfgs: [
                'FormattedID','Name','ScheduleState'
            ]
        });        
        this.add(myGrid); //Adding the Grid in Screen
    }
    
   
});
