Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    myStoriesStore: undefined,
    myGrid: undefined,
    
    launch: function() {
        
        this.pulldownContainer = Ext.create('Ext.container.Container', {
            id: 'pulldown-container-id',
            layout: {
                type: 'hbox',
                align: 'stretch'
            },
        });

        this.add(this.pulldownContainer);
        this._loadReleases(); 
    },

    _loadReleases: function(){
        this.iterationComboBox = Ext.create('Rally.ui.combobox.IterationComboBox', {
            fieldLabel: 'Iteration',
            labelAlign: 'right',
            width: 400,
            listeners: {
                ready: function(){
                    this._loadData();
                },
                select: function() {
                    this._loadData();
                },
                scope: this
            }
        });
        this.pulldownContainer.add(this.iterationComboBox);
    },


    _loadData: function () {
        var selectedIterationRef = this.iterationComboBox.getRecord().get("_ref");    

        var myFilters = [{
            property: 'Iteration',
            operation: '=',
            value: selectedIterationRef
        }];

        //if store exists, just load new data
        if(this.storiesStore){
            this.storiesStore.setFilter(myFilters);
            this.storiesStore.load();
        } else {
            this.storiesStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'User Story',
                autoLoad: true,
                filters: myFilters,
                listeners: {
                    load: function(storiesStore) {
                        if(!this.myGrid){
                            console.log("Store:", storiesStore.getRecords());
                            this._createGrid(storiesStore);
                        }
                    },
                    scope: this 
                },
                fetch: ['FormattedID', 'Name', 'Feature', 'Feature.FormattedID','Feature.RefinedEstimate']
            });
        }

    },

    _createGrid: function(myStoriesStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myStoriesStore,
            columnCfgs: [
                'FormattedID', 'Name', 'Feature', 'Feature.FormattedID','Feature.RefinedEstimate'
            ]
        });        
        this.add(this.myGrid); //Adding the Grid in Screen
    }

});


