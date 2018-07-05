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

    defectStore: undefined,
    myGrid: undefined,

    launch: function() {
        this._loadDropdowns();
    },


    _loadRolesDD: function() {
        var usersComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            itemId: 'roles-combobox',
            fieldLabel: 'Role',
            labelAlign: 'right',
            model: 'User',
            field: 'Role',
            listeners: {
                select: this._loadStateDD,
                scope: this
            }
        }); 
        this.down('#pulldown-container').add(usersComboBox);

    },


    _loadStateDD: function () {
        var statesComboBox = Ext.create ('Rally.ui.combobox.FieldValueComboBox', {
            itemId: 'states-combobox',
            fieldLabel: 'Role',
            labelAlign: 'right',
            model: 'Defect',
            field: 'State',
            listeners: {
                select: this._onRoleSelectedDefects,
                scope: this
            }
        });

        this.down('#pulldown-container').add(statesComboBox);
    },

    _loadDropdowns: function() {
        
        this._loadRolesDD();
        this._loadStateDD();
        //this._loadPriorityDD();
        
        
    },


    _getFilters: function (roleSelected, stateSelected) {
        var roleFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'SubmittedBy.Role',
            operation: '=',
            value: roleSelected
        });

        var stateFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'State',
            operation: '=',
            value: stateSelected
        });


        return roleFilter.and(stateFilter);
    },


    _onRoleSelectedDefects: function () {
        var selectedRole = this.down('#roles-combobox').getRecord().get("value");    
        var selectedState = this.down('#states-combobox').getRecord().get("value");    


        var myFilters = this._getFilters(selectedRole, selectedState);
        console.log('Filter:', myFilters.toString());

        if(this.defectStore){
            this.defectStore.setFilter(myFilters);
            this.defectStore.load();
        } else {
            this.defectStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'Defect',
                autoLoad: true,
                limit: Infinity,
                filters: myFilters,
                listeners: {
                    load: function(defectStore) {
                        if(!this.myGrid){
                            this._createDefectsGrid(defectStore);
                        }
                    },
                    scope: this
                },
                fetch: ['FormattedID','Name','SubmittedBy','State','Priority','Severity','Environment','Project','Iteration'],
            });   
        }
    },

    
    _createDefectsGrid: function(myUserStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myUserStore,
            columnCfgs: [
                'FormattedID','Name','SubmittedBy','State','Priority','Severity','Environment','Project','Iteration'
            ]
        });        
        this.add(this.myGrid); 
    },

});
