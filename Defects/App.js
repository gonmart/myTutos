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
        this._loadMilestones();
    },


    _loadMilestones: function(){
        var mileCombobox = Ext.create('Rally.ui.combobox.MilestoneComboBox', {
            itemId: 'milestone-combobox',
            fieldLabel: 'Milestone: ',
            labelAlign: 'right',
            listeners: {
                ready: this._loadDefectSuites,
                select: this._loadData,
                scope: this
            }
        });        

        this.down("#pulldown-container").add(mileCombobox);
    },


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
                scope: this
            }
        });

        this.down('#pulldown-container').add(dsuiteCombobox);
    },


    _loadData: function(){
        console.log('Loading data...');
    },



});
