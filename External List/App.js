Ext.define('Rally.example.FilteredGrid', {
    extend: 'Rally.app.App',
    componentCls: 'app',

    launch: function() {
        this.add({
            xtype: 'rallyfieldvaluecombobox',
            itemId: 'stateComboBox',
            fieldLabel: 'Filter by State:',
            model: 'Defect',
            field: 'State',
            listeners: {
                select: this._onSelect,
                ready: this._onLoad,
                scope: this
            }
        });
    },

    _onLoad: function() {
        this.add({
            xtype: 'rallygrid',
            columnCfgs: [
                'FormattedID',
                'Name',
                'State',
                'Priority',
                'Severity'
            ],
            context: this.getContext(),
            storeConfig: {
                model: 'defect',
                filters: [this._getStateFilter()]
            }
        });
    },

    _getStateFilter: function() {
        return {
            property: 'State',
            operator: '=',
            value: this.down('#stateComboBox').getValue()
        };
    },

    _onSelect: function() {
        var grid = this.down('rallygrid'),
            store = grid.getStore();

        store.clearFilter(true);
        store.filter(this._getStateFilter());
    }
});


Rally.launchApp('Rally.example.FilteredGrid', {
  name: 'Filtered Grid Example'
});
