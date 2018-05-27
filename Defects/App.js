Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    
    items: [
        {
            xtype: 'container',
            Id: 'pulldown-container',
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
            hideLabel: false,
            fieldLabel: 'Milestone: ',
            labelAlign: 'right',
            width: 300,
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
                afterrender: this._loadData,
                scope: this
            }
        });

        this.down('#pulldown-container').add(dsuiteCombobox);
    },


    _loadData: function() {
        var selectedMilestone = this.down("#milestone-combobox").getRecord().get("_ref");
        var selectedDS = this.down("#defectsuite-combobox").getValue();

        console.log("Milestone:", selectedMilestone);
        console.log("Defect Suite:", selectedDS);
      

    },



});
