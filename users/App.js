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

    userStore: undefined,
    myGrid: undefined,

    launch: function() {
        this._loadDropdowns();
    },


    _loadDropdowns: function() {

        var usersComboBox = Ext.create('Rally.ui.combobox.FieldValueComboBox', {
            itemId: 'roles-combobox',
            fieldLabel: 'Role',
            labelAlign: 'right',
            model: 'User',
            field: 'Role',
            listeners: {
                select: this._onRoleSelected,
                scope: this
            }
        });
     
        this.down('#pulldown-container').add(usersComboBox);
    },


    _getFilters: function (roleSelected) {
        var roleFilter = Ext.create('Rally.data.wsapi.Filter', {
            property: 'Role',
            operation: '=',
            value: roleSelected
        });

        return roleFilter;
    },


    _onRoleSelected: function () {

        var selectedRole = this.down('#roles-combobox').getRecord().get("value");    
        var myFilters = this._getFilters(selectedRole);

        if(this.userStore){
            this.userStore.setFilter(myFilters);
            this.userStore.load();
        } else {
            this.userStore = Ext.create('Rally.data.wsapi.Store', {
                model: 'User',
                autoLoad: true,
                limit: Infinity,
                filters: myFilters,
                listeners: {
                    load: function(userStore) {
                        if(!this.myGrid){
                            this._createGrid(userStore);
                        }
                    },
                    scope: this
                },
                fetch: ['UserName','Role'],
            });   
        }

    },

    _createGrid: function(myUserStore) {
        this.myGrid = Ext.create('Rally.ui.grid.Grid', {
            store: myUserStore,
            columnCfgs: [
                'UserName','Role'
            ]
        });        
        this.add(this.myGrid); 
    }

});
