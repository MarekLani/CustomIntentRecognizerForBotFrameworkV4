import { DialogContainer} from 'botbuilder-dialogs';
import TopMenu = require("./TopMenu");

export class Accounts extends DialogContainer {
    constructor(conversationState) {
        // Dialog ID of 'Help' will start when class is called in the parent
        super('Accounts');

        //add child dialogs
        this.dialogs.add('TopMenu', new TopMenu.TopMenu(conversationState));

        // Defining the conversation flow using a waterfall model
        this.dialogs.add('Accounts', [     
            async function (dc, results){
                await dc.context.sendActivity(`You've reached accounts dialog`);
                
                const state = conversationState.get(dc.context);
                state.activeDialog = 'TopMenu';
                await dc.replace("TopMenu");
            }                 
        ]);
    }
}