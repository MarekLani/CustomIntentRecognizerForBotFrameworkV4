import { ComponentDialog, DialogSet, TextPrompt, NumberPrompt, WaterfallDialog } from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Accounts extends  ComponentDialog {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Accounts');

         // Defining the conversation flow using a waterfall model
         this.addDialog(new WaterfallDialog('Accounts', [     
            async function (dc){
                await dc.context.sendActivity(`You've reached accounts dialog`);
                return await dc.replaceDialog("TopMenu");
            }                 
        ]));
        
        //add child dialogs
        this.addDialog(new TopMenu.TopMenu(conversationState));
    }
}