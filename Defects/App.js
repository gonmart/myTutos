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

    myDefecfStore: undefined,
    myGrid: undefined,

    launch: function() {
        
    }
});
