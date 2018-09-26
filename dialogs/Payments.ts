import { ComponentDialog, WaterfallDialog} from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Payments extends ComponentDialog {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Payments');

         // Defining the conversation flow using a waterfall model
         this.addDialog(new WaterfallDialog('Payments', [     
            async function (dc){
                await dc.context.sendActivity(`You've reached payments dialog`);
 
                
                return await dc.replaceDialog("TopMenu");
            }                 
        ]));
        //add child dialogs
        this.addDialog(new TopMenu.TopMenu(conversationState));

       
    }
}